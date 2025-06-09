
import { supabase } from '@/integrations/supabase/client';

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export interface DatabaseResponse<T = any> {
  data: T | null;
  error: DatabaseError | null;
}

class DatabaseService {
  // Subjects
  async getSubjects(): Promise<DatabaseResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Unknown error' } 
      };
    }
  }

  async createSubject(subjectData: any): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert([subjectData])
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Unknown error' } 
      };
    }
  }

  async updateSubject(id: string, updates: any): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Unknown error' } 
      };
    }
  }

  async deleteSubject(id: string): Promise<DatabaseResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: true, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Unknown error' } 
      };
    }
  }

  // Study Materials
  async getStudyMaterials(): Promise<DatabaseResponse<any[]>> {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data: data || [], error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Unknown error' } 
      };
    }
  }

  async createStudyMaterial(materialData: any): Promise<DatabaseResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .insert([materialData])
        .select()
        .single();

      if (error) {
        return { data: null, error: { message: error.message } };
      }

      return { data, error: null };
    } catch (err) {
      return { 
        data: null, 
        error: { message: err instanceof Error ? err.message : 'Unknown error' } 
      };
    }
  }
}

export const databaseService = new DatabaseService();
