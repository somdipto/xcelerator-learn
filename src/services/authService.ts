
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
  updated_at: string;
}

class AuthService {
  async signUp(email: string, password: string, userData?: any) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData
      }
    });

    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser(): Promise<{ user: User | null; error: any }> {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { data: null, error };
    }

    // Type assertion to ensure role is properly typed
    const profile: Profile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as 'student' | 'teacher' | 'admin',
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return { data: profile, error: null };
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Type assertion for the returned data
    const profile: Profile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role as 'student' | 'teacher' | 'admin',
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return { data: profile, error: null };
  }
}

export const authService = new AuthService();
