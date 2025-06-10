
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

export class DatabaseService {
  // Simple utility methods for direct database access
  
  async query(table: TableName, options: any = {}) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase.from(table).select(options.select || '*');
      
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  async insert(table: TableName, data: Record<string, any>) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();
      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  async update(table: TableName, id: string, data: Record<string, any>) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }
  
  async delete(table: TableName, id: string) {
    if (!supabase) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      return { error };
    } catch (error) {
      return { error };
    }
  }
}

export const databaseService = new DatabaseService();
