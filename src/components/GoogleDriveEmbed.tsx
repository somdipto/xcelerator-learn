
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Eye, AlertCircle } from 'lucide-react';

interface GoogleDriveEmbedProps {
  url: string;
  title?: string;
  description?: string;
  className?: string;
}

const GoogleDriveEmbed: React.FC<GoogleDriveEmbedProps> = ({ 
  url, 
  title, 
  description, 
  className = '' 
}) => {
  const [embedError, setEmbedError] = useState(false);

  // Extract file ID from Google Drive URL
  const getFileId = (driveUrl: string): string | null => {
    const match = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  // Generate different URL formats
  const fileId = getFileId(url);
  const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
  const directUrl = fileId ? `https://drive.google.com/file/d/${fileId}/view` : url;
  const downloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '';

  const handleEmbedError = () => {
    setEmbedError(true);
  };

  if (!fileId) {
    return (
      <div className="bg-[#FF7043]/10 border border-[#FF7043]/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-[#FF7043]" />
          <span className="text-[#FF7043] font-medium">Invalid Google Drive URL</span>
        </div>
        <p className="text-sm text-[#E0E0E0] mb-3">
          The provided URL doesn't appear to be a valid Google Drive link.
        </p>
        <Button
          onClick={() => window.open(url, '_blank')}
          variant="outline"
          size="sm"
          className="border-[#FF7043] text-[#FF7043] hover:bg-[#FF7043]/10"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Link
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-[#1A1A1A] border border-[#2C2C2C] rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      {(title || description) && (
        <div className="p-4 border-b border-[#2C2C2C]">
          {title && (
            <h3 className="text-white font-medium mb-1">{title}</h3>
          )}
          {description && (
            <p className="text-[#E0E0E0] text-sm">{description}</p>
          )}
        </div>
      )}

      {/* Embed Area */}
      <div className="relative">
        {!embedError && embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-96 border-0"
            allow="autoplay"
            onError={handleEmbedError}
            title={title || "Google Drive Content"}
          />
        ) : (
          <div className="h-96 flex items-center justify-center bg-[#121212]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-[#666666] mx-auto mb-4" />
              <p className="text-[#E0E0E0] mb-4">
                Preview not available. Use the buttons below to access the content.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-[#121212] border-t border-[#2C2C2C]">
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => window.open(directUrl, '_blank')}
            variant="outline"
            size="sm"
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF]/10"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          
          <Button
            onClick={() => window.open(directUrl, '_blank')}
            variant="outline"
            size="sm"
            className="border-[#00E676] text-[#00E676] hover:bg-[#00E676]/10"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Drive
          </Button>

          {downloadUrl && (
            <Button
              onClick={() => window.open(downloadUrl, '_blank')}
              variant="outline"
              size="sm"
              className="border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726]/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveEmbed;
