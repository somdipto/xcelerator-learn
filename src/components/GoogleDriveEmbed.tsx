
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Play, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GoogleDriveEmbedProps {
  url: string;
  title?: string;
  description?: string;
}

const GoogleDriveEmbed = ({ url, title, description }: GoogleDriveEmbedProps) => {
  const validateGoogleDriveUrl = (driveUrl: string): boolean => {
    try {
      const urlObj = new URL(driveUrl);
      
      // Only allow Google Drive domains
      const allowedDomains = ['drive.google.com', 'docs.google.com'];
      if (!allowedDomains.includes(urlObj.hostname)) {
        return false;
      }
      
      // Validate URL pattern
      const drivePatterns = [
        /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9-_]+/,
        /^https:\/\/docs\.google\.com\/[a-zA-Z]+\/d\/[a-zA-Z0-9-_]+/
      ];
      
      return drivePatterns.some(pattern => pattern.test(driveUrl));
    } catch {
      return false;
    }
  };

  const getEmbedUrl = (driveUrl: string): string | null => {
    if (!validateGoogleDriveUrl(driveUrl)) {
      return null;
    }
    
    // Extract file ID from various Google Drive URL formats
    const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    return null;
  };

  const getViewUrl = (driveUrl: string): string | null => {
    if (!validateGoogleDriveUrl(driveUrl)) {
      return null;
    }
    
    // Extract file ID and create a view URL
    const fileIdMatch = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/file/d/${fileId}/view`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(url);
  const viewUrl = getViewUrl(url);

  // Security check failed
  if (!embedUrl || !viewUrl) {
    return (
      <Alert className="bg-red-500/10 border-red-500/20">
        <Shield className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-red-300">
          Invalid or unsafe Google Drive URL detected. Please verify the link.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-[#2979FF]/10 border border-[#2979FF]/20 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Embedded iframe with security restrictions */}
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-t-lg"
              allow="autoplay"
              title={title || 'Google Drive Content'}
              sandbox="allow-scripts allow-same-origin allow-presentation"
              style={{ border: 'none' }}
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          
          {/* Overlay for mobile or when iframe doesn't load */}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <Button
              onClick={() => window.open(viewUrl, '_blank', 'noopener,noreferrer')}
              className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Open in Drive
            </Button>
          </div>
        </div>
        
        {/* Content info */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <h4 className="text-white font-medium mb-1">{title}</h4>
              )}
              {description && (
                <p className="text-[#E0E0E0] text-sm">{description}</p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(viewUrl, '_blank', 'noopener,noreferrer')}
              className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white ml-4"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleDriveEmbed;
