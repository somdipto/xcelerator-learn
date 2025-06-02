
import React, { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Google Drive URL to proper embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  };

  const embedUrl = getEmbedUrl(pdfUrl);

  const openInNewTab = () => {
    const originalUrl = embedUrl.replace('/preview', '/view');
    window.open(originalUrl, '_blank');
  };

  const openWithGoogleViewer = () => {
    const originalUrl = embedUrl.replace('/preview', '/view');
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}&embedded=true`;
    window.open(viewerUrl, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('PDF loaded successfully');
  };

  const handleIframeError = () => {
    setHasError(true);
    setIsLoading(false);
    console.log('PDF failed to load');
  };

  // Timeout fallback since iframe events aren't reliable for cross-origin
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
        console.log('PDF loading timeout - showing fallback options');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className={`rounded-lg overflow-hidden border border-[#2C2C2C] ${
        isExpanded ? 'h-[80vh]' : 'h-[400px] sm:h-[500px]'
      }`}>
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full bg-[#1A1A1A] text-center p-6">
            <AlertCircle className="h-12 w-12 text-[#FF6B6B] mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">PDF Loading Failed</h3>
            <p className="text-[#CCCCCC] mb-4">
              The PDF couldn't be embedded. Try one of these options:
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                onClick={openInNewTab}
                className="bg-[#00E676] text-black hover:bg-[#00E676]/80"
              >
                Open in New Tab
              </Button>
              <Button
                onClick={openWithGoogleViewer}
                variant="outline"
                className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black"
              >
                Try Google Viewer
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
                  <p className="text-white">Loading PDF...</p>
                </div>
              </div>
            )}
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              title={title}
              className="bg-white"
              allow="autoplay; encrypted-media"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        )}
      </div>
      
      <p className="text-xs text-[#CCCCCC] text-center">
        If the PDF doesn't load, try opening it in a new tab using the external link button above.
      </p>
    </div>
  );
};

export default PDFViewer;
