
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role: 'teacher' | 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

class AuthService {
  // Check if Supabase is available
  private isSupabaseAvailable(): boolean {
    return Boolean(supabase);
  }

  // Authentication methods
  async signUp(email: string, password: string, userData: { full_name?: string; role?: string } = {}) {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not configured');
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not configured');
    }
    
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Profile methods
  async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    if (!this.isSupabaseAvailable()) {
      return { data: null, error: new Error('Supabase not configured') };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data: data as Profile | null, error };
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    if (!this.isSupabaseAvailable()) {
      throw new Error('Supabase not configured');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  }
}

export const authService = new AuthService();
