
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

class GoogleDriveService {
  // Validate and normalize Google Drive URLs
  validateAndNormalizeUrl(url: string): { isValid: boolean; normalizedUrl?: string; fileId?: string } {
    if (!url || typeof url !== 'string') {
      return { isValid: false };
    }

    // Remove any tracking parameters and normalize
    const cleanUrl = url.split('?')[0];
    
    // Extract file ID from various Google Drive URL formats
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/,
      /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/,
      /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9-_]+)/,
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        const fileId = match[1];
        const normalizedUrl = `https://drive.google.com/file/d/${fileId}/view`;
        return { isValid: true, normalizedUrl, fileId };
      }
    }

    return { isValid: false };
  }

  // Convert to embeddable URL for universal access
  getEmbeddableUrl(url: string): string | null {
    const validation = this.validateAndNormalizeUrl(url);
    if (!validation.isValid || !validation.fileId) {
      return null;
    }

    return `https://drive.google.com/file/d/${validation.fileId}/preview`;
  }

  // Get direct download URL (for certain file types)
  getDirectUrl(url: string): string | null {
    const validation = this.validateAndNormalizeUrl(url);
    if (!validation.isValid || !validation.fileId) {
      return null;
    }

    return `https://drive.google.com/uc?export=download&id=${validation.fileId}`;
  }

  // Ingest Google Drive link and store in Supabase
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
      // Validate the Google Drive URL
      const validation = this.validateAndNormalizeUrl(linkData.url);
      if (!validation.isValid) {
        return { success: false, error: 'Invalid Google Drive URL' };
      }

      // Prepare the study material data
      const materialData = {
        teacher_id: linkData.teacherId,
        title: linkData.title,
        description: linkData.description,
        type: linkData.type,
        url: validation.normalizedUrl, // Use normalized URL
        grade: linkData.grade,
        is_public: linkData.isPublic ?? true, // Default to public for universal access
      };

      // Find or create subject
      const { data: subjects } = await dataService.getSubjects(linkData.grade);
      let subjectId: string | undefined;
      
      if (subjects) {
        const existingSubject = subjects.find(s => s.name.toLowerCase() === linkData.subject.toLowerCase());
        if (existingSubject) {
          subjectId = existingSubject.id;
        } else {
          // Create new subject if it doesn't exist
          const { data: newSubject, error: subjectError } = await dataService.createSubject({
            name: linkData.subject,
            grade: linkData.grade,
            created_by: linkData.teacherId,
          });
          if (!subjectError && newSubject) {
            subjectId = newSubject.id;
          }
        }
      }

      // Find or create chapter
      let chapterId: string | undefined;
      if (subjectId) {
        const { data: chapters } = await dataService.getChapters({ subject_id: subjectId });
        if (chapters) {
          const existingChapter = chapters.find(c => c.name.toLowerCase() === linkData.chapter.toLowerCase());
          if (existingChapter) {
            chapterId = existingChapter.id;
          } else {
            // Create new chapter if it doesn't exist
            const { data: newChapter, error: chapterError } = await dataService.createChapter({
              name: linkData.chapter,
              subject_id: subjectId,
              order_index: chapters.length + 1,
            });
            if (!chapterError && newChapter) {
              chapterId = newChapter.id;
            }
          }
        }
      }

      // Add subject and chapter IDs to material data
      const finalMaterialData = {
        ...materialData,
        subject_id: subjectId,
        chapter_id: chapterId,
      };

      // Create the study material
      const { data: studyMaterial, error } = await dataService.createStudyMaterial(finalMaterialData);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: studyMaterial };
    } catch (error: any) {
      console.error('Error ingesting Google Drive link:', error);
      return { success: false, error: error.message || 'Failed to ingest Google Drive link' };
    }
  }

  // Batch ingest multiple Google Drive links
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
  }>): Promise<{ success: boolean; results: Array<{ success: boolean; data?: any; error?: string }> }> {
    const results = [];
    
    for (const link of links) {
      const result = await this.ingestGoogleDriveLink(link);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      results
    };
  }

  // Get all Google Drive links for a specific chapter
  async getChapterLinks(subject: string, chapter: string, grade: number): Promise<GoogleDriveLink[]> {
    try {
      const { data: materials, error } = await dataService.getStudyMaterials({
        grade,
        is_public: true
      });

      if (error || !materials) {
        return [];
      }

      // Filter materials that match the subject and chapter
      const filteredMaterials = materials.filter((material: any) => {
        const subjectMatch = material.subjects?.name === subject;
        const chapterMatch = material.chapters?.name === chapter;
        return subjectMatch && chapterMatch && material.url && dataService.isGoogleDriveUrl(material.url);
      });

      return filteredMaterials.map((material: any) => ({
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
    } catch (error) {
      console.error('Error fetching chapter links:', error);
      return [];
    }
  }

  // Ensure universal accessibility by making links public
  async ensureUniversalAccess(materialId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await dataService.updateStudyMaterial(materialId, {
        is_public: true
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const googleDriveService = new GoogleDriveService();
