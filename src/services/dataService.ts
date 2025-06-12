import { supabase } from '@/integrations/supabase/client';
import type { StudyMaterial } from '@/types/studyMaterial';

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
  subject_id: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

class DataService {
  // Check if Supabase is configured
  private isSupabaseConfigured(): boolean {
    return Boolean(supabase);
  }

  // Study materials methods
  async getStudyMaterials(filters: { grade?: number; subject_id?: string; teacher_id?: string } = {}) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase
        .from('study_materials')
        .select(`
          *,
          subjects:subject_id(name, grade),
          profiles:teacher_id(full_name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (filters.grade) {
        query = query.eq('grade', filters.grade);
      }
      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }
      if (filters.teacher_id) {
        query = query.eq('teacher_id', filters.teacher_id);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createStudyMaterial(material: Omit<StudyMaterial, 'id' | 'created_at' | 'updated_at'>) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      // Validate Google Drive URLs and convert to proper format
      if (material.url && this.isGoogleDriveUrl(material.url)) {
        material.url = this.convertGoogleDriveUrl(material.url);
      }

      const { data, error } = await supabase
        .from('study_materials')
        .insert(material)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateStudyMaterial(id: string, updates: Partial<StudyMaterial>) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      // Validate Google Drive URLs and convert to proper format
      if (updates.url && this.isGoogleDriveUrl(updates.url)) {
        updates.url = this.convertGoogleDriveUrl(updates.url);
      }

      const { data, error } = await supabase
        .from('study_materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteStudyMaterial(id: string) {
    if (!this.isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Subjects methods
  async getSubjects(grade?: number) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase
        .from('subjects')
        .select('*')
        .order('grade', { ascending: true });

      if (grade) {
        query = query.eq('grade', grade);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateSubject(id: string, updates: Partial<Subject>) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteSubject(id: string) {
    if (!this.isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Chapters methods
  async getChapters(filters: { subject_id?: string; grade?: number } = {}) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase
        .from('chapters')
        .select(`
          *,
          subjects:subject_id(name, grade)
        `)
        .order('order_index', { ascending: true });

      if (filters.subject_id) {
        query = query.eq('subject_id', filters.subject_id);
      }

      const { data, error } = await query;

      // Filter by grade if provided (since chapters don't have direct grade field)
      if (data && filters.grade) {
        const filteredData = data.filter(chapter =>
          chapter.subjects && chapter.subjects.grade === filters.grade
        );
        return { data: filteredData, error };
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async createChapter(chapter: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('chapters')
        .insert(chapter)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateChapter(id: string, updates: Partial<Chapter>) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase
        .from('chapters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  async deleteChapter(id: string) {
    if (!this.isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  // File upload methods
  async uploadFile(bucket: string, path: string, file: File) {
    if (!this.isSupabaseConfigured()) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  }

  getFileUrl(bucket: string, path: string): string {
    if (!this.isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot get file URL');
      return '';
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  // Google Drive URL utilities
  isGoogleDriveUrl(url: string): boolean {
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  }

  convertGoogleDriveUrl(url: string): string {
    // Convert various Google Drive URL formats to a consistent viewable format
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      }
    }
    return url;
  }

  getGoogleDriveEmbedUrl(url: string): string {
    // Convert Google Drive URL to embeddable format
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  }

  // File validation utilities
  validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Content validation
  validateContentData(material: Partial<StudyMaterial>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!material.title?.trim()) {
      errors.push('Title is required');
    }

    if (!material.type) {
      errors.push('Content type is required');
    }

    if (!material.subject_id) {
      errors.push('Subject is required');
    }

    if (!material.chapter_id) {
      errors.push('Chapter is required');
    }

    if (!material.grade || material.grade < 1 || material.grade > 12) {
      errors.push('Valid grade (1-12) is required');
    }

    // Validate URL for certain types
    if (material.type === 'video' || material.type === 'quiz') {
      if (!material.url?.trim()) {
        errors.push(`URL is required for ${material.type} content`);
      } else if (!this.isValidUrl(material.url)) {
        errors.push('Please provide a valid URL');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const dataService = new DataService();
