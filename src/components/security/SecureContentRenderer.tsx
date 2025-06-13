
import React from 'react';
import DOMPurify from 'dompurify';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface SecureContentRendererProps {
  content: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  className?: string;
}

const SecureContentRenderer: React.FC<SecureContentRendererProps> = ({
  content,
  allowedTags = ['p', 'br', 'strong', 'em', 'u'],
  allowedAttributes = [],
  className = ''
}) => {
  const sanitizeContent = (html: string): string => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      USE_PROFILES: { html: true }
    });
  };

  // Additional security check for potentially dangerous content
  const containsSuspiciousContent = (text: string): boolean => {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<script/i,
      /onload=/i,
      /onerror=/i,
      /onclick=/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(text));
  };

  if (containsSuspiciousContent(content)) {
    return (
      <Alert className="bg-red-500/10 border-red-500/20">
        <Shield className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">
          Content blocked due to security concerns
        </AlertDescription>
      </Alert>
    );
  }

  const sanitizedContent = sanitizeContent(content);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

export default SecureContentRenderer;
