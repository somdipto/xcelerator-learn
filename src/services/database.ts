
import { supabase } from '@/integrations/supabase/client';

export class DatabaseService {
  // Simple utility methods for direct database access
  
  async query(table: string, options: any = {}) {
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
  
  async insert(table: string, data: Record<string, any>) {
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
  
  async update(table: string, id: string, data: Record<string, any>) {
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
  
  async delete(table: string, id: string) {
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
