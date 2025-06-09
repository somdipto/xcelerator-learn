
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

class DataService {
  // Study materials methods
  async getStudyMaterials(filters: { grade?: number; subject_id?: string; teacher_id?: string } = {}) {
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
  }

  async createStudyMaterial(material: Omit<StudyMaterial, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('study_materials')
      .insert(material)
      .select()
      .single();
    return { data, error };
  }

  // Subjects methods
  async getSubjects(grade?: number) {
    let query = supabase
      .from('subjects')
      .select('*')
      .order('grade', { ascending: true });

    if (grade) {
      query = query.eq('grade', grade);
    }

    const { data, error } = await query;
    return { data, error };
  }

  async createSubject(subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('subjects')
      .insert(subject)
      .select()
      .single();
    return { data, error };
  }

  async updateSubject(id: string, updates: Partial<Subject>) {
    const { data, error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async deleteSubject(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    return { error };
  }

  // File upload methods
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  }

  getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }
}

export const dataService = new DataService();
