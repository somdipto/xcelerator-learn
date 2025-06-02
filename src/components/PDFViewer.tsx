
import React, { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const openInNewTab = () => {
    const originalUrl = pdfUrl.replace('/preview', '/view');
    window.open(originalUrl, '_blank');
  };

  const openWithGoogleViewer = () => {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl.replace('/preview', '/view'))}&embedded=true`;
    window.open(viewerUrl, '_blank');
  };

  const handleIframeError = () => {
    setHasError(true);
  };

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
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            title={title}
            className="bg-white"
            allow="autoplay; encrypted-media"
            onError={handleIframeError}
          />
        )}
      </div>
      
      <p className="text-xs text-[#CCCCCC] text-center">
        If the PDF doesn't load, try opening it in a new tab using the external link button above.
      </p>
    </div>
  );
};

export default PDFViewer;
