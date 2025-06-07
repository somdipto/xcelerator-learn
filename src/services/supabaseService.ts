
import { supabase } from '@/integrations/supabase/client';

export interface StudyMaterial {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'link' | 'other';
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

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  role: 'teacher' | 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

class SupabaseService {
  // Expose the supabase client
  public supabase = supabase;

  // Track active channels to prevent duplicates
  private activeChannels = new Map<string, any>();

  // Authentication methods
  async signUp(email: string, password: string, userData: { full_name?: string; role?: string } = {}) {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  }

  // Profile methods
  async getProfile(userId: string): Promise<{ data: Profile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data: data as Profile | null, error };
  }

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  }

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

  async getTeacherStudyMaterials(teacherId: string) {
    const { data, error } = await supabase
      .from('study_materials')
      .select(`
        *,
        subjects:subject_id(name, grade),
        chapters:chapter_id(name)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });
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

  async updateStudyMaterial(id: string, updates: Partial<StudyMaterial>) {
    const { data, error } = await supabase
      .from('study_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async deleteStudyMaterial(id: string) {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id);
    return { error };
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

  // Real-time subscriptions with unique channel names
  subscribeToStudyMaterials(callback: (payload: any) => void, channelName?: string) {
    const uniqueChannelName = channelName || `study_materials_${Date.now()}_${Math.random()}`;
    
    // Remove existing channel if it exists
    if (this.activeChannels.has(uniqueChannelName)) {
      const existingChannel = this.activeChannels.get(uniqueChannelName);
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_materials'
        },
        callback
      )
      .subscribe();

    this.activeChannels.set(uniqueChannelName, channel);
    return channel;
  }

  // Method to cleanup a specific channel
  removeChannel(channel: any) {
    // Find and remove from active channels
    for (const [name, activeChannel] of this.activeChannels.entries()) {
      if (activeChannel === channel) {
        this.activeChannels.delete(name);
        break;
      }
    }
    supabase.removeChannel(channel);
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

export const supabaseService = new SupabaseService();
