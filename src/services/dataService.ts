
import { supabase } from '@/integrations/supabase/client';

export interface StudyMaterial {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  url?: string;
  file_path?: string;
  subject_id?: string;
  chapter_id?: string;
  grade?: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  grade: number;
  icon?: string;
  color?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  name: string;
  description?: string;
  subject_id?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

class DataService {
  // Study Materials
  async getStudyMaterials(filters: { 
    teacher_id?: string;
    subject_id?: string;
    chapter_id?: string;
    grade?: number;
    is_public?: boolean;
  } = {}) {
    let query = supabase.from('study_materials').select(`
      *,
      subjects(name, grade),
      chapters(name)
    `);

    // Apply filters
    if (filters.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id);
    }
    if (filters.subject_id) {
      query = query.eq('subject_id', filters.subject_id);
    }
    if (filters.chapter_id) {
      query = query.eq('chapter_id', filters.chapter_id);
    }
    if (filters.grade !== undefined) {
      query = query.eq('grade', filters.grade);
    }
    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    return await query.order('created_at', { ascending: false });
  }

  async createStudyMaterial(material: Omit<StudyMaterial, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('study_materials')
      .insert(material)
      .select()
      .single();
  }

  async updateStudyMaterial(id: string, updates: Partial<StudyMaterial>) {
    return await supabase
      .from('study_materials')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  async deleteStudyMaterial(id: string) {
    return await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);
  }

  // Subjects
  async getSubjects(grade?: number) {
    let query = supabase.from('subjects').select('*');
    
    if (grade) {
      query = query.eq('grade', grade);
    }
    
    return await query.order('name');
  }

  async createSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();
  }

  async updateSubject(id: string, updates: Partial<Subject>) {
    return await supabase
      .from('subjects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  async deleteSubject(id: string) {
    return await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
  }

  // Chapters
  async getChapters(filters: { subject_id?: string; grade?: number } = {}) {
    let query = supabase.from('chapters').select(`
      *,
      subjects!inner(*)
    `);

    if (filters.subject_id) {
      query = query.eq('subject_id', filters.subject_id);
    }

    if (filters.grade) {
      query = query.eq('subjects.grade', filters.grade);
    }

    return await query.order('order_index');
  }

  async createChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>) {
    return await supabase
      .from('chapters')
      .insert(chapter)
      .select()
      .single();
  }

  async updateChapter(id: string, updates: Partial<Chapter>) {
    return await supabase
      .from('chapters')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
  }

  async deleteChapter(id: string) {
    return await supabase
      .from('chapters')
      .delete()
      .eq('id', id);
  }

  // File Upload
  async uploadFile(file: File, bucket: string = 'study-materials') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    return { data, error, filePath };
  }

  async getFileUrl(filePath: string, bucket: string = 'study-materials') {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Google Drive URL utilities
  isGoogleDriveUrl(url: string): boolean {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  }

  convertGoogleDriveUrl(url: string): string {
    // Convert Google Drive share URL to direct access URL
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
    return url;
  }

  getGoogleDriveEmbedUrl(url: string): string {
    // Convert to embeddable URL
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return url;
  }

  // Validation utilities
  validateContentData(material: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!material.title?.trim()) {
      errors.push('Title is required');
    }

    if (!material.type) {
      errors.push('Content type is required');
    }

    if (!material.teacher_id) {
      errors.push('Teacher ID is required');
    }

    if (material.type === 'video' || material.type === 'quiz') {
      if (!material.url?.trim()) {
        errors.push(`URL is required for ${material.type} content`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension || '');
  }

  validateFileSize(file: File, maxSizeMB: number): boolean {
    return file.size <= maxSizeMB * 1024 * 1024;
  }
}

export const dataService = new DataService();
