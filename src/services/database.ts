
// Updated database service to use fetch instead of axios and remove socket.io
import { supabase } from '@/integrations/supabase/client';

interface DatabaseResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

class DatabaseService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  async get<T>(endpoint: string): Promise<DatabaseResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data.message || 'Request failed',
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async post<T>(endpoint: string, payload: any): Promise<DatabaseResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data.message || 'Request failed',
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async put<T>(endpoint: string, payload: any): Promise<DatabaseResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data.message || 'Request failed',
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<DatabaseResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      return {
        data: response.ok ? data : null,
        error: response.ok ? null : data.message || 'Request failed',
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Supabase integration methods with fixed typing
  async getSupabaseData<T>(tableName: 'subjects' | 'chapters' | 'profiles' | 'study_materials', query?: any): Promise<DatabaseResponse<T[]>> {
    try {
      let supabaseQuery = supabase.from(tableName).select('*');
      
      if (query) {
        Object.keys(query).forEach(key => {
          supabaseQuery = supabaseQuery.eq(key, query[key]);
        });
      }

      const { data, error } = await supabaseQuery;
      
      return {
        data: error ? null : data as T[],
        error: error ? error.message : null,
        status: error ? 400 : 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Database error',
        status: 500,
      };
    }
  }

  async insertSupabaseData<T>(tableName: 'subjects' | 'chapters' | 'profiles' | 'study_materials', payload: any): Promise<DatabaseResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();
      
      return {
        data: error ? null : data as T,
        error: error ? error.message : null,
        status: error ? 400 : 201,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Database error',
        status: 500,
      };
    }
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
