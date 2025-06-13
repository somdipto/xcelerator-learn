
import { supabase } from '@/integrations/supabase/client';
import { dataService } from './dataService';

class SecureDataService {
  // Rate limiting storage
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  private checkRateLimit(key: string, maxRequests: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowData = this.rateLimitMap.get(key);
    
    if (!windowData || now > windowData.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (windowData.count >= maxRequests) {
      return false;
    }
    
    windowData.count++;
    return true;
  }

  private async logSecurityEvent(eventType: string, details: any = {}) {
    try {
      await supabase.rpc('log_security_event', {
        event_type: eventType,
        event_details: details
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  private sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().substring(0, 10000); // Limit string length
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      Object.keys(input).forEach(key => {
        if (typeof input[key] === 'string') {
          sanitized[key] = input[key].trim().substring(0, 1000);
        } else {
          sanitized[key] = input[key];
        }
      });
      return sanitized;
    }
    return input;
  }

  async secureGetStudyMaterials(filters: any = {}) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('Authentication required');
    }

    if (!this.checkRateLimit(`study_materials_${userId}`, 100)) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        operation: 'getStudyMaterials',
        userId 
      });
      throw new Error('Rate limit exceeded');
    }

    const sanitizedFilters = this.sanitizeInput(filters);
    return await dataService.getStudyMaterials(sanitizedFilters);
  }

  async secureCreateStudyMaterial(material: any) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('Authentication required');
    }

    if (!this.checkRateLimit(`create_material_${userId}`, 10)) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        operation: 'createStudyMaterial',
        userId 
      });
      throw new Error('Rate limit exceeded');
    }

    // Validate required fields
    if (!material.title?.trim()) {
      throw new Error('Title is required');
    }

    if (!material.type || !['textbook', 'video', 'summary', 'ppt', 'quiz'].includes(material.type)) {
      throw new Error('Invalid material type');
    }

    // Validate URL if provided
    if (material.url && !dataService.isGoogleDriveUrl(material.url)) {
      // Additional URL validation
      try {
        new URL(material.url);
      } catch {
        throw new Error('Invalid URL format');
      }
    }

    const sanitizedMaterial = this.sanitizeInput({
      ...material,
      teacher_id: userId,
      is_public: Boolean(material.is_public)
    });

    await this.logSecurityEvent('STUDY_MATERIAL_CREATED', {
      title: material.title,
      type: material.type
    });

    return await dataService.createStudyMaterial(sanitizedMaterial);
  }

  async secureUpdateStudyMaterial(id: string, updates: any) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('Authentication required');
    }

    if (!this.checkRateLimit(`update_material_${userId}`, 20)) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        operation: 'updateStudyMaterial',
        userId 
      });
      throw new Error('Rate limit exceeded');
    }

    // Verify ownership or admin role
    const { data: existingMaterial } = await supabase
      .from('study_materials')
      .select('teacher_id')
      .eq('id', id)
      .single();

    if (!existingMaterial || existingMaterial.teacher_id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile || profile.role !== 'admin') {
        await this.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          operation: 'updateStudyMaterial',
          materialId: id,
          userId
        });
        throw new Error('Access denied');
      }
    }

    const sanitizedUpdates = this.sanitizeInput(updates);
    
    await this.logSecurityEvent('STUDY_MATERIAL_UPDATED', {
      materialId: id
    });

    return await dataService.updateStudyMaterial(id, sanitizedUpdates);
  }

  async secureDeleteStudyMaterial(id: string) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) {
      throw new Error('Authentication required');
    }

    if (!this.checkRateLimit(`delete_material_${userId}`, 10)) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED', { 
        operation: 'deleteStudyMaterial',
        userId 
      });
      throw new Error('Rate limit exceeded');
    }

    // Verify ownership or admin role
    const { data: existingMaterial } = await supabase
      .from('study_materials')
      .select('teacher_id, title')
      .eq('id', id)
      .single();

    if (!existingMaterial || existingMaterial.teacher_id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile || profile.role !== 'admin') {
        await this.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
          operation: 'deleteStudyMaterial',
          materialId: id,
          userId
        });
        throw new Error('Access denied');
      }
    }

    await this.logSecurityEvent('STUDY_MATERIAL_DELETED', {
      materialId: id,
      title: existingMaterial.title
    });

    return await dataService.deleteStudyMaterial(id);
  }
}

export const secureDataService = new SecureDataService();
