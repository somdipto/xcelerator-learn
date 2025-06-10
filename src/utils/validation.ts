
import DOMPurify from 'dompurify';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class SecurityValidator {
  // Sanitize HTML content to prevent XSS
  static sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
      ALLOWED_ATTR: []
    });
  }

  // Validate and sanitize URLs
  static validateUrl(url: string): ValidationResult {
    const errors: string[] = [];
    
    try {
      const parsedUrl = new URL(url);
      
      // Only allow https and http protocols
      if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
        errors.push('Only HTTP and HTTPS URLs are allowed');
      }
      
      // Block localhost and private IP ranges in production
      if (process.env.NODE_ENV === 'production') {
        const hostname = parsedUrl.hostname.toLowerCase();
        if (hostname === 'localhost' || 
            hostname.startsWith('127.') ||
            hostname.startsWith('192.168.') ||
            hostname.startsWith('10.') ||
            (hostname.startsWith('172.') && parseInt(hostname.split('.')[1]) >= 16 && parseInt(hostname.split('.')[1]) <= 31)) {
          errors.push('Private network URLs are not allowed');
        }
      }
      
    } catch {
      errors.push('Invalid URL format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate file uploads
  static validateFile(file: File): ValidationResult {
    const errors: string[] = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    const allowedTypes = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]);

    if (file.size > maxSize) {
      errors.push('File size must be less than 50MB');
    }

    if (!allowedTypes.has(file.type)) {
      errors.push('File type not allowed. Allowed types: PDF, Images (JPEG, PNG, GIF), Videos (MP4, WebM), PowerPoint');
    }

    // Additional filename validation
    const dangerousExtensions = /\.(exe|bat|cmd|scr|pif|vbs|js|jar|com|psl1|ps1|sh|php|asp|aspx|jsp)$/i;
    if (dangerousExtensions.test(file.name)) {
      errors.push('File extension not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate text input for XSS and injection attacks
  static validateTextInput(text: string, maxLength: number = 1000): ValidationResult {
    const errors: string[] = [];
    
    if (text.length > maxLength) {
      errors.push(`Text must be less than ${maxLength} characters`);
    }
    
    // Check for potential script tags or javascript
    const scriptPattern = /<script|javascript:|data:|vbscript:|on\w+\s*=/i;
    if (scriptPattern.test(text)) {
      errors.push('Potentially malicious content detected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate email format
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
    
    if (email.length > 254) {
      errors.push('Email address is too long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Rate limiting helper (simple in-memory implementation)
  private static attempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  
  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);
    
    if (!attempt || now - attempt.lastAttempt > windowMs) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    if (attempt.count >= maxAttempts) {
      return false;
    }
    
    attempt.count++;
    attempt.lastAttempt = now;
    return true;
  }
}
