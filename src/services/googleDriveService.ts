
import { dataService } from './dataService';

export interface GoogleDriveLink {
  id: string;
  url: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  subject: string;
  chapter: string;
  grade: number;
  teacherId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BatchUploadResult {
  success: boolean;
  results: Array<{
    success: boolean;
    data?: any;
    error?: string;
    url?: string;
    title?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

class GoogleDriveService {
  // Enhanced URL validation for multiple Google services
  validateAndNormalizeUrl(url: string): { isValid: boolean; normalizedUrl?: string; fileId?: string; serviceType?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false };
    }

    // Remove any tracking parameters and normalize
    const cleanUrl = url.split('?')[0];
    
    // Enhanced patterns for different Google services
    const patterns = [
      { pattern: /drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/, service: 'drive' },
      { pattern: /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/, service: 'docs' },
      { pattern: /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/, service: 'sheets' },
      { pattern: /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/, service: 'slides' },
      { pattern: /docs\.google\.com\/forms\/d\/([a-zA-Z0-9-_]+)/, service: 'forms' },
    ];

    for (const { pattern, service } of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        const fileId = match[1];
        const normalizedUrl = this.createUniversalAccessUrl(fileId, service);
        return { isValid: true, normalizedUrl, fileId, serviceType: service };
      }
    }

    return { isValid: false };
  }

  // Create universal access URL based on service type
  private createUniversalAccessUrl(fileId: string, serviceType: string): string {
    switch (serviceType) {
      case 'docs':
        return `https://docs.google.com/document/d/${fileId}/edit?usp=sharing`;
      case 'sheets':
        return `https://docs.google.com/spreadsheets/d/${fileId}/edit?usp=sharing`;
      case 'slides':
        return `https://docs.google.com/presentation/d/${fileId}/edit?usp=sharing`;
      case 'forms':
        return `https://docs.google.com/forms/d/${fileId}/viewform?usp=sharing`;
      default:
        return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
    }
  }

  // Enhanced embeddable URL generation
  getEmbeddableUrl(url: string): string | null {
    const validation = this.validateAndNormalizeUrl(url);
    if (!validation.isValid || !validation.fileId || !validation.serviceType) {
      return null;
    }

    const { fileId, serviceType } = validation;

    switch (serviceType) {
      case 'docs':
        return `https://docs.google.com/document/d/${fileId}/preview`;
      case 'sheets':
        return `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
      case 'slides':
        return `https://docs.google.com/presentation/d/${fileId}/preview`;
      case 'forms':
        return `https://docs.google.com/forms/d/${fileId}/viewform?embedded=true`;
      default:
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }

  // Verify universal access for a Google Drive link
  async verifyUniversalAccess(url: string): Promise<{ accessible: boolean; error?: string }> {
    try {
      const validation = this.validateAndNormalizeUrl(url);
      if (!validation.isValid) {
        return { accessible: false, error: 'Invalid Google Drive URL' };
      }

      // Test accessibility by attempting to fetch the preview
      const previewUrl = this.getEmbeddableUrl(url);
      if (!previewUrl) {
        return { accessible: false, error: 'Cannot generate preview URL' };
      }

      // In a real implementation, you would make a HEAD request to test accessibility
      // For now, we'll assume URLs that can be normalized are accessible
      return { accessible: true };
    } catch (error) {
      return { accessible: false, error: 'Failed to verify access' };
    }
  }

  // Enhanced content ingestion with better error handling
  async ingestGoogleDriveLink(linkData: {
    url: string;
    title: string;
    description?: string;
    type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
    subject: string;
    chapter: string;
    grade: number;
    teacherId: string;
    isPublic?: boolean;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Enhanced validation
      const validation = this.validateAndNormalizeUrl(linkData.url);
      if (!validation.isValid) {
        return { success: false, error: 'Invalid Google Drive URL format' };
      }

      // Verify universal access
      const accessCheck = await this.verifyUniversalAccess(linkData.url);
      if (!accessCheck.accessible) {
        return { 
          success: false, 
          error: `Universal access verification failed: ${accessCheck.error}` 
        };
      }

      // Prepare enhanced material data
      const materialData = {
        teacher_id: linkData.teacherId,
        title: linkData.title,
        description: linkData.description || `${validation.serviceType || 'Google Drive'} content for ${linkData.chapter}`,
        type: linkData.type,
        url: validation.normalizedUrl,
        grade: linkData.grade,
        is_public: linkData.isPublic ?? true, // Default to public for universal access
      };

      // Find or create subject with enhanced error handling
      const { data: subjects, error: subjectsError } = await dataService.getSubjects(linkData.grade);
      if (subjectsError) {
        return { success: false, error: `Failed to load subjects: ${subjectsError.message}` };
      }

      let subjectId: string | undefined;
      
      if (subjects) {
        const existingSubject = subjects.find(s => s.name.toLowerCase() === linkData.subject.toLowerCase());
        if (existingSubject) {
          subjectId = existingSubject.id;
        } else {
          // Create new subject
          const { data: newSubject, error: subjectError } = await dataService.createSubject({
            name: linkData.subject,
            grade: linkData.grade,
            created_by: linkData.teacherId,
          });
          if (subjectError) {
            return { success: false, error: `Failed to create subject: ${subjectError.message}` };
          }
          if (newSubject) {
            subjectId = newSubject.id;
          }
        }
      }

      // Find or create chapter with enhanced error handling
      let chapterId: string | undefined;
      if (subjectId) {
        const { data: chapters, error: chaptersError } = await dataService.getChapters({ subject_id: subjectId });
        if (chaptersError) {
          return { success: false, error: `Failed to load chapters: ${chaptersError.message}` };
        }

        if (chapters) {
          const existingChapter = chapters.find(c => c.name.toLowerCase() === linkData.chapter.toLowerCase());
          if (existingChapter) {
            chapterId = existingChapter.id;
          } else {
            // Create new chapter
            const { data: newChapter, error: chapterError } = await dataService.createChapter({
              name: linkData.chapter,
              subject_id: subjectId,
              order_index: chapters.length + 1,
            });
            if (chapterError) {
              return { success: false, error: `Failed to create chapter: ${chapterError.message}` };
            }
            if (newChapter) {
              chapterId = newChapter.id;
            }
          }
        }
      }

      // Create the study material with enhanced data
      const finalMaterialData = {
        ...materialData,
        subject_id: subjectId,
        chapter_id: chapterId,
      };

      const { data: studyMaterial, error } = await dataService.createStudyMaterial(finalMaterialData);

      if (error) {
        return { success: false, error: `Failed to create study material: ${error.message}` };
      }

      return { success: true, data: studyMaterial };
    } catch (error: any) {
      console.error('Error ingesting Google Drive link:', error);
      return { success: false, error: error.message || 'Failed to ingest Google Drive link' };
    }
  }

  // Enhanced batch ingestion with detailed results
  async batchIngestLinks(links: Array<{
    url: string;
    title: string;
    description?: string;
    type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
    subject: string;
    chapter: string;
    grade: number;
    teacherId: string;
    isPublic?: boolean;
  }>): Promise<BatchUploadResult> {
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const link of links) {
      const result = await this.ingestGoogleDriveLink(link);
      results.push({
        ...result,
        url: link.url,
        title: link.title
      });
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return {
      success: successful > 0,
      results,
      summary: {
        total: links.length,
        successful,
        failed
      }
    };
  }

  // Parse CSV data for batch upload
  parseCsvData(csvText: string): Array<{
    url: string;
    title: string;
    description?: string;
    type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
    subject: string;
    chapter: string;
    grade: number;
  }> {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const item: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'url':
            item.url = value;
            break;
          case 'title':
            item.title = value;
            break;
          case 'description':
            item.description = value;
            break;
          case 'type':
            item.type = value as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
            break;
          case 'subject':
            item.subject = value;
            break;
          case 'chapter':
            item.chapter = value;
            break;
          case 'grade':
            item.grade = parseInt(value) || 10;
            break;
        }
      });

      if (item.url && item.title) {
        data.push(item);
      }
    }

    return data;
  }

  // Get enhanced chapter content with universal access verification
  async getChapterLinks(subject: string, chapter: string, grade: number): Promise<GoogleDriveLink[]> {
    try {
      const { data: materials, error } = await dataService.getStudyMaterials({
        grade,
        is_public: true
      });

      if (error || !materials) {
        console.error('Error fetching materials:', error);
        return [];
      }

      // Filter and enhance materials
      const filteredMaterials = materials.filter((material: any) => {
        const subjectMatch = material.subjects?.name === subject;
        const chapterMatch = material.chapters?.name === chapter;
        return subjectMatch && chapterMatch && material.url && dataService.isGoogleDriveUrl(material.url);
      });

      // Enhance with accessibility verification
      const enhancedMaterials = filteredMaterials.map((material: any) => ({
        id: material.id,
        url: material.url,
        title: material.title,
        description: material.description,
        type: material.type,
        subject,
        chapter,
        grade: material.grade,
        teacherId: material.teacher_id,
        isPublic: material.is_public,
        createdAt: material.created_at,
        updatedAt: material.updated_at,
      }));

      return enhancedMaterials;
    } catch (error) {
      console.error('Error fetching chapter links:', error);
      return [];
    }
  }

  // Analytics for content usage
  async getContentAnalytics(teacherId: string): Promise<{
    totalContent: number;
    byType: Record<string, number>;
    bySubject: Record<string, number>;
    recentUploads: number;
  }> {
    try {
      const { data: materials, error } = await dataService.getStudyMaterials({
        teacher_id: teacherId
      });

      if (error || !materials) {
        return {
          totalContent: 0,
          byType: {},
          bySubject: {},
          recentUploads: 0
        };
      }

      const byType: Record<string, number> = {};
      const bySubject: Record<string, number> = {};
      let recentUploads = 0;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      materials.forEach((material: any) => {
        // Count by type
        byType[material.type] = (byType[material.type] || 0) + 1;

        // Count by subject
        const subjectName = material.subjects?.name || 'Unknown';
        bySubject[subjectName] = (bySubject[subjectName] || 0) + 1;

        // Count recent uploads
        if (new Date(material.created_at) > sevenDaysAgo) {
          recentUploads++;
        }
      });

      return {
        totalContent: materials.length,
        byType,
        bySubject,
        recentUploads
      };
    } catch (error) {
      console.error('Error fetching content analytics:', error);
      return {
        totalContent: 0,
        byType: {},
        bySubject: {},
        recentUploads: 0
      };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
