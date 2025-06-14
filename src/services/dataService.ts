
import { supabase } from '@/integrations/supabase/client';

export interface Subject {
  id: string;
  name: string;
  grade: number;
  icon?: string;
  color?: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Chapter {
  id: string;
  name: string;
  subject_id: string;
  order_index?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudyMaterial {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  url?: string;
  file_path?: string;
  grade?: number;
  subject_id?: string;
  chapter_id?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string;
}

class DataService {
  // Enhanced Google Drive URL validation
  isGoogleDriveUrl(url: string): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    const patterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/,
      /^https:\/\/docs\.google\.com\/document\/d\/[a-zA-Z0-9-_]+/,
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+/,
      /^https:\/\/docs\.google\.com\/presentation\/d\/[a-zA-Z0-9-_]+/,
      /^https:\/\/docs\.google\.com\/forms\/d\/[a-zA-Z0-9-_]+/,
    ];

    return patterns.some(pattern => pattern.test(url));
  }

  // Validate UUID format
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Enhanced error handling wrapper
  private async handleDatabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const result = await operation();
      
      if (result.error) {
        console.error('Database operation error:', result.error);
        return {
          data: null,
          error: {
            message: result.error.message || 'Database operation failed',
            details: result.error
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Unexpected error in database operation:', error);
      return {
        data: null,
        error: {
          message: 'Unexpected error occurred',
          details: error
        }
      };
    }
  }

  // Get subjects with optional grade filter
  async getSubjects(grade?: number): Promise<{ data: Subject[] | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      let query = supabase
        .from('subjects')
        .select('*')
        .order('grade', { ascending: true })
        .order('name', { ascending: true });

      if (grade) {
        query = query.eq('grade', grade);
      }

      return await query;
    });
  }

  // Create a new subject
  async createSubject(subjectData: {
    name: string;
    grade: number;
    created_by: string;
    icon?: string;
    color?: string;
    description?: string;
  }): Promise<{ data: Subject | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      // Validate teacher ID format
      if (!this.isValidUUID(subjectData.created_by)) {
        return {
          data: null,
          error: { message: 'Invalid teacher ID format' }
        };
      }

      return await supabase
        .from('subjects')
        .insert([subjectData])
        .select()
        .single();
    });
  }

  // Update a subject
  async updateSubject(id: string, updates: Partial<Subject>): Promise<{ data: Subject | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      if (!this.isValidUUID(id)) {
        return {
          data: null,
          error: { message: 'Invalid subject ID format' }
        };
      }

      return await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Delete a subject
  async deleteSubject(id: string): Promise<{ data: any; error: any }> {
    return this.handleDatabaseOperation(async () => {
      if (!this.isValidUUID(id)) {
        return {
          data: null,
          error: { message: 'Invalid subject ID format' }
        };
      }

      return await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
    });
  }

  // Get chapters with optional filters
  async getChapters(filters?: { subject_id?: string }): Promise<{ data: Chapter[] | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      let query = supabase
        .from('chapters')
        .select('*')
        .order('order_index', { ascending: true });

      if (filters?.subject_id) {
        if (!this.isValidUUID(filters.subject_id)) {
          return {
            data: null,
            error: { message: 'Invalid subject ID format' }
          };
        }
        query = query.eq('subject_id', filters.subject_id);
      }

      return await query;
    });
  }

  // Create a new chapter
  async createChapter(chapterData: {
    name: string;
    subject_id: string;
    order_index?: number;
    description?: string;
  }): Promise<{ data: Chapter | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      // Validate subject ID format
      if (!this.isValidUUID(chapterData.subject_id)) {
        return {
          data: null,
          error: { message: 'Invalid subject ID format' }
        };
      }

      return await supabase
        .from('chapters')
        .insert([chapterData])
        .select()
        .single();
    });
  }

  // Update a chapter
  async updateChapter(id: string, updates: Partial<Chapter>): Promise<{ data: Chapter | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      if (!this.isValidUUID(id)) {
        return {
          data: null,
          error: { message: 'Invalid chapter ID format' }
        };
      }

      return await supabase
        .from('chapters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Delete a chapter
  async deleteChapter(id: string): Promise<{ data: any; error: any }> {
    return this.handleDatabaseOperation(async () => {
      if (!this.isValidUUID(id)) {
        return {
          data: null,
          error: { message: 'Invalid chapter ID format' }
        };
      }

      return await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
    });
  }

  // Get study materials with optional filters
  async getStudyMaterials(filters?: {
    teacher_id?: string;
    subject_id?: string;
    chapter_id?: string;
    grade?: number;
    is_public?: boolean;
  }): Promise<{ data: StudyMaterial[] | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      let query = supabase
        .from('study_materials')
        .select(`
          *,
          subjects:subject_id(name, icon),
          chapters:chapter_id(name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.teacher_id) {
        if (!this.isValidUUID(filters.teacher_id)) {
          return {
            data: null,
            error: { message: 'Invalid teacher ID format' }
          };
        }
        query = query.eq('teacher_id', filters.teacher_id);
      }

      if (filters?.subject_id) {
        if (!this.isValidUUID(filters.subject_id)) {
          return {
            data: null,
            error: { message: 'Invalid subject ID format' }
          };
        }
        query = query.eq('subject_id', filters.subject_id);
      }

      if (filters?.chapter_id) {
        if (!this.isValidUUID(filters.chapter_id)) {
          return {
            data: null,
            error: { message: 'Invalid chapter ID format' }
          };
        }
        query = query.eq('chapter_id', filters.chapter_id);
      }

      if (filters?.grade) {
        query = query.eq('grade', filters.grade);
      }

      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      return await query;
    });
  }

  // Create a new study material with enhanced validation
  async createStudyMaterial(materialData: {
    teacher_id: string;
    title: string;
    description?: string;
    type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
    url?: string;
    file_path?: string;
    grade?: number;
    subject_id?: string;
    chapter_id?: string;
    is_public?: boolean;
  }): Promise<{ data: StudyMaterial | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      // Validate required fields
      if (!materialData.title?.trim()) {
        return {
          data: null,
          error: { message: 'Title is required' }
        };
      }

      // Validate teacher ID format
      if (!this.isValidUUID(materialData.teacher_id)) {
        return {
          data: null,
          error: { message: 'Invalid teacher ID format' }
        };
      }

      // Validate subject ID if provided
      if (materialData.subject_id && !this.isValidUUID(materialData.subject_id)) {
        return {
          data: null,
          error: { message: 'Invalid subject ID format' }
        };
      }

      // Validate chapter ID if provided
      if (materialData.chapter_id && !this.isValidUUID(materialData.chapter_id)) {
        return {
          data: null,
          error: { message: 'Invalid chapter ID format' }
        };
      }

      // Validate URL if provided
      if (materialData.url && !this.isGoogleDriveUrl(materialData.url)) {
        return {
          data: null,
          error: { message: 'Invalid Google Drive URL format' }
        };
      }

      // Validate type-specific requirements
      if (['video', 'quiz'].includes(materialData.type) && !materialData.url) {
        return {
          data: null,
          error: { message: `URL is required for ${materialData.type} content` }
        };
      }

      console.log('Creating study material with data:', materialData);

      return await supabase
        .from('study_materials')
        .insert([materialData])
        .select()
        .single();
    });
  }

  // Update a study material
  async updateStudyMaterial(id: string, updates: Partial<StudyMaterial>): Promise<{ data: StudyMaterial | null; error: any }> {
    return this.handleDatabaseOperation(async () => {
      if (!this.isValidUUID(id)) {
        return {
          data: null,
          error: { message: 'Invalid material ID format' }
        };
      }

      return await supabase
        .from('study_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    });
  }

  // Delete a study material
  async deleteStudyMaterial(id: string): Promise<{ data: any; error: any }> {
    return this.handleDatabaseOperation(async () => {
      if (!this.isValidUUID(id)) {
        return {
          data: null,
          error: { message: 'Invalid material ID format' }
        };
      }

      return await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);
    });
  }

  // File upload methods
  async uploadFile(file: File, path: string): Promise<{ data: any; error: any }> {
    return this.handleDatabaseOperation(async () => {
      return await supabase.storage
        .from('study-materials')
        .upload(path, file);
    });
  }

  async getFileUrl(path: string): Promise<{ data: { publicUrl: string }; error: any }> {
    try {
      const { data } = supabase.storage
        .from('study-materials')
        .getPublicUrl(path);
      
      return { data, error: null };
    } catch (error) {
      return { data: { publicUrl: '' }, error };
    }
  }

  // Utility methods
  convertGoogleDriveUrl(url: string): string {
    if (!this.isGoogleDriveUrl(url)) return url;
    
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/view`;
    }
    return url;
  }

  getGoogleDriveEmbedUrl(url: string): string {
    if (!this.isGoogleDriveUrl(url)) return url;
    
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
    return url;
  }

  validateContentData(material: any): boolean {
    if (!material.title?.trim()) return false;
    if (!material.type) return false;
    if (['video', 'quiz'].includes(material.type) && !material.url) return false;
    return true;
  }

  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension || '');
  }

  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}

export const dataService = new DataService();
