
import { useState, useCallback } from 'react';
import DOMPurify from 'dompurify';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  sanitize?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: string;
}

export const useSecureValidation = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const sanitizeInput = useCallback((input: string): string => {
    // Remove potentially dangerous content
    const cleaned = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
    
    // Additional sanitization for common attack vectors
    return cleaned
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .replace(/vbscript:/gi, '')
      .trim();
  }, []);

  const validateField = useCallback((
    fieldName: string,
    value: string,
    rules: ValidationRule
  ): ValidationResult => {
    const errors: string[] = [];
    let sanitizedValue = value;

    // Sanitize if requested
    if (rules.sanitize) {
      sanitizedValue = sanitizeInput(value);
    }

    // Required validation
    if (rules.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
      errors.push(`${fieldName} is required`);
    }

    // Length validations
    if (rules.minLength && sanitizedValue.length < rules.minLength) {
      errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
      errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`);
    }

    // Pattern validation
    if (rules.pattern && sanitizedValue && !rules.pattern.test(sanitizedValue)) {
      errors.push(`${fieldName} format is invalid`);
    }

    // Custom validation
    if (rules.custom && sanitizedValue && !rules.custom(sanitizedValue)) {
      errors.push(`${fieldName} validation failed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: rules.sanitize ? sanitizedValue : undefined
    };
  }, [sanitizeInput]);

  const validateForm = useCallback((
    formData: Record<string, string>,
    validationRules: Record<string, ValidationRule>
  ): { isValid: boolean; errors: Record<string, string[]>; sanitizedData: Record<string, string> } => {
    const allErrors: Record<string, string[]> = {};
    const sanitizedData: Record<string, string> = {};

    Object.entries(formData).forEach(([fieldName, value]) => {
      const rules = validationRules[fieldName];
      if (rules) {
        const result = validateField(fieldName, value, rules);
        if (!result.isValid) {
          allErrors[fieldName] = result.errors;
        }
        sanitizedData[fieldName] = result.sanitizedValue || value;
      } else {
        sanitizedData[fieldName] = value;
      }
    });

    setValidationErrors(allErrors);
    return {
      isValid: Object.keys(allErrors).length === 0,
      errors: allErrors,
      sanitizedData
    };
  }, [validateField]);

  const validateUrl = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url);
      
      // Only allow safe protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Block dangerous patterns
      if (url.match(/(javascript:|data:|vbscript:)/i)) {
        return false;
      }
      
      // Block localhost and private IPs in production
      const hostname = urlObj.hostname;
      if (hostname === 'localhost' || 
          hostname.match(/^127\./) ||
          hostname.match(/^192\.168\./) ||
          hostname.match(/^10\./) ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }, []);

  const validateGoogleDriveUrl = useCallback((url: string): boolean => {
    if (!validateUrl(url)) return false;
    
    const drivePatterns = [
      /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/,
      /^https:\/\/docs\.google\.com\/[a-zA-Z]+\/d\/[a-zA-Z0-9-_]+/
    ];
    
    return drivePatterns.some(pattern => pattern.test(url));
  }, [validateUrl]);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  return {
    validateField,
    validateForm,
    validateUrl,
    validateGoogleDriveUrl,
    sanitizeInput,
    validationErrors,
    clearValidationErrors
  };
};
