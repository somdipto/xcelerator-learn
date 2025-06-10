
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
  updateSubject = dataService.updateSubject.bind(dataService);
  deleteSubject = dataService.deleteSubject.bind(dataService);
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
    return dataService.updateStudyMaterial(id, updates);
  }

  async deleteStudyMaterial(id: string) {
    return dataService.deleteStudyMaterial(id);
  }

  // Chapter methods
  async getChapters(filters: { subject_id?: string; grade?: number } = {}) {
    return dataService.getChapters(filters);
  }

  async createChapter(chapter: any) {
    return dataService.createChapter(chapter);
  }

  async updateChapter(id: string, updates: any) {
    return dataService.updateChapter(id, updates);
  }

  async deleteChapter(id: string) {
    return dataService.deleteChapter(id);
  }

  // Utility methods
  isGoogleDriveUrl(url: string) {
    return dataService.isGoogleDriveUrl(url);
  }

  convertGoogleDriveUrl(url: string) {
    return dataService.convertGoogleDriveUrl(url);
  }

  getGoogleDriveEmbedUrl(url: string) {
    return dataService.getGoogleDriveEmbedUrl(url);
  }

  validateContentData(material: any) {
    return dataService.validateContentData(material);
  }

  validateFileType(fileName: string, allowedTypes: string[]) {
    return dataService.validateFileType(fileName, allowedTypes);
  }

  validateFileSize(file: File, maxSizeMB: number) {
    return dataService.validateFileSize(file, maxSizeMB);
  }
}

export const supabaseService = new LegacySupabaseService();
