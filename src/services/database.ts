
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

export class DatabaseService {
  // Simple utility methods for direct database access
  
  async query<T extends TableName>(
    table: T, 
    options: {
      select?: string;
      filters?: Partial<TableRow<T>>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ) {
    if (!supabase) {
      return { data: null, error: new Error('Supabase not configured') };
    }

    try {
      let query = supabase.from(table).select(options.select || '*');
      
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }
      
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
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
  
  async insert<T extends TableName>(table: T, data: TableInsert<T>) {
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
  
  async update<T extends TableName>(table: T, id: string, data: TableUpdate<T>) {
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
  
  async delete<T extends TableName>(table: T, id: string) {
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
