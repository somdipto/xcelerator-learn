
// Re-export from split services for backwards compatibility
export { authService } from './authService';
export { dataService } from './dataService';
export { realtimeService } from './realtimeService';

// Export types
export type { Profile } from './authService';
export type { StudyMaterial, Subject } from './dataService';

// Legacy exports for compatibility
import { authService } from './authService';
import { dataService } from './dataService';
import { realtimeService } from './realtimeService';
import { supabase } from '@/integrations/supabase/client';

// Combined service for legacy compatibility
class LegacySupabaseService {
  // Add supabase client access for compatibility
  supabase = supabase;

  // Auth methods
  signUp = authService.signUp.bind(authService);
  signIn = authService.signIn.bind(authService);
  signOut = authService.signOut.bind(authService);
  getCurrentUser = authService.getCurrentUser.bind(authService);
  getProfile = authService.getProfile.bind(authService);
  updateProfile = authService.updateProfile.bind(authService);

  // Data methods
  getStudyMaterials = dataService.getStudyMaterials.bind(dataService);
  createStudyMaterial = dataService.createStudyMaterial.bind(dataService);
  getSubjects = dataService.getSubjects.bind(dataService);
  createSubject = dataService.createSubject.bind(dataService);
  uploadFile = dataService.uploadFile.bind(dataService);
  getFileUrl = dataService.getFileUrl.bind(dataService);

  // Realtime methods
  subscribeToStudyMaterials = realtimeService.subscribeToStudyMaterials.bind(realtimeService);
  removeChannel = realtimeService.removeChannel.bind(realtimeService);

  // Legacy methods that aren't commonly used
  async getTeacherStudyMaterials(teacherId: string) {
    return dataService.getStudyMaterials({ teacher_id: teacherId });
  }

  async updateStudyMaterial(id: string, updates: any) {
    console.log('updateStudyMaterial not implemented in optimized service');
    return { data: null, error: new Error('Not implemented') };
  }

  async deleteStudyMaterial(id: string) {
    console.log('deleteStudyMaterial not implemented in optimized service');
    return { error: new Error('Not implemented') };
  }

  async updateSubject(id: string, updates: any) {
    console.log('updateSubject not implemented in optimized service');
    return { data: null, error: new Error('Not implemented') };
  }

  async deleteSubject(id: string) {
    console.log('deleteSubject not implemented in optimized service');
    return { error: new Error('Not implemented') };
  }
}

export const supabaseService = new LegacySupabaseService();
