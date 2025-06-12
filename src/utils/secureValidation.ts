
import { supabase } from '@/integrations/supabase/client';

// Client-side validation utilities that complement server-side validation

export const validateEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePasswordStrength = async (password: string): Promise<{
  valid: boolean;
  errors: string[];
}> => {
  try {
    // Use the secure database function for validation
    const { data, error } = await supabase.rpc('validate_password_strength', {
      password
    });
    
    if (error) {
      console.error('Password validation error:', error);
      return {
        valid: false,
        errors: ['Password validation failed. Please try again.']
      };
    }
    
    // Fix type issue by properly casting the response
    if (typeof data === 'object' && data !== null && 'valid' in data && 'errors' in data) {
      return data as { valid: boolean; errors: string[] };
    }
    
    // Fallback if data format is unexpected
    return {
      valid: false,
      errors: ['Password validation failed. Please try again.']
    };
  } catch (error) {
    console.error('Password validation error:', error);
    return {
      valid: false,
      errors: ['Password validation failed. Please try again.']
    };
  }
};

export const validateUrlSafety = async (url: string): Promise<boolean> => {
  try {
    // Use the secure database function for URL validation
    const { data, error } = await supabase.rpc('validate_url_secure', {
      url
    });
    
    if (error) {
      console.error('URL validation error:', error);
      return false;
    }
    
    return Boolean(data);
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
};

export const validateFileUpload = async (
  file: File,
  userRole: string = 'student'
): Promise<{ valid: boolean; error?: string }> => {
  try {
    // Client-side checks first
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Check file size on client (50MB for students, 100MB for teachers/admins)
    const maxSize = userRole === 'teacher' || userRole === 'admin' ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size exceeds limit (${userRole === 'teacher' || userRole === 'admin' ? '100MB' : '50MB'})` 
      };
    }

    // Use the secure database function for comprehensive validation
    const { data, error } = await supabase.rpc('validate_file_upload_secure', {
      file_path: file.name,
      file_size: file.size,
      mime_type: file.type,
      user_role: userRole
    });
    
    if (error) {
      console.error('File validation error:', error);
      return { valid: false, error: 'File validation failed' };
    }
    
    return { valid: Boolean(data) };
  } catch (error) {
    console.error('File validation error:', error);
    return { valid: false, error: 'File validation failed' };
  }
};

export const sanitizeInput = (input: string): string => {
  // Basic XSS prevention
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove dangerous characters from file names
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};
