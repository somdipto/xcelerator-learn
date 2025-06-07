
import React, { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, Minimize2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Convert various PDF URLs to proper embed format
  const getEmbedUrl = (url: string, attempt: number = 0) => {
    console.log('Processing PDF URL:', url, 'Attempt:', attempt);
    
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        // Try different Google Drive embed options
        if (attempt === 0) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        } else if (attempt === 1) {
          return `https://drive.google.com/file/d/${fileId}/view?embedded=true`;
        } else if (attempt === 2) {
          return `https://docs.google.com/viewer?url=https://drive.google.com/uc?id=${fileId}&embedded=true`;
        }
      }
    }
    
    // For other URLs, try different viewers
    if (attempt === 0) {
      return url;
    } else if (attempt === 1) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    } else if (attempt === 2) {
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  const [embedUrl, setEmbedUrl] = useState(() => getEmbedUrl(pdfUrl, 0));

  const openInNewTab = () => {
    let originalUrl = pdfUrl;
    if (pdfUrl.includes('drive.google.com')) {
      const fileId = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        originalUrl = `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    window.open(originalUrl, '_blank');
  };

  const openWithGoogleViewer = () => {
    let targetUrl = pdfUrl;
    if (pdfUrl.includes('drive.google.com')) {
      const fileId = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        targetUrl = `https://drive.google.com/uc?id=${fileId}`;
      }
    }
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(targetUrl)}`;
    window.open(viewerUrl, '_blank');
  };

  const openWithMozillaViewer = () => {
    let targetUrl = pdfUrl;
    if (pdfUrl.includes('drive.google.com')) {
      const fileId = pdfUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        targetUrl = `https://drive.google.com/uc?id=${fileId}`;
      }
    }
    const viewerUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(targetUrl)}`;
    window.open(viewerUrl, '_blank');
  };

  const retryLoading = () => {
    console.log('Retrying PDF load, attempt:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    setHasError(false);
    setIsLoading(true);
    setEmbedUrl(getEmbedUrl(pdfUrl, retryCount + 1));
  };

  const handleIframeLoad = () => {
    console.log('PDF iframe loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.log('PDF iframe failed to load');
    if (retryCount < 2) {
      // Auto-retry with different URL format
      setTimeout(() => retryLoading(), 1000);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Extended timeout for better user experience
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading && retryCount < 2) {
        console.log('PDF loading timeout - trying alternative method');
        retryLoading();
      } else if (isLoading) {
        console.log('PDF loading timeout - showing fallback options');
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, retryCount]);

  // Reset retry count when PDF URL changes
  useEffect(() => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setEmbedUrl(getEmbedUrl(pdfUrl, 0));
  }, [pdfUrl]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex gap-2">
          {hasError && retryCount < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryLoading}
              className="border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726] hover:text-black"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
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
            <h3 className="text-white text-lg font-semibold mb-2">PDF Viewer Options</h3>
            <p className="text-[#CCCCCC] mb-6 max-w-md">
              The PDF couldn't be embedded directly. Choose one of these viewing options to continue studying:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
              <Button
                onClick={openInNewTab}
                className="bg-[#00E676] text-black hover:bg-[#00E676]/80 h-12"
              >
                📄 Original Source
              </Button>
              <Button
                onClick={openWithGoogleViewer}
                variant="outline"
                className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white h-12"
              >
                🔍 Google Viewer
              </Button>
              <Button
                onClick={openWithMozillaViewer}
                variant="outline"
                className="border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726] hover:text-black h-12"
              >
                📖 PDF.js Viewer
              </Button>
              {retryCount < 3 && (
                <Button
                  onClick={retryLoading}
                  variant="outline"
                  className="border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white h-12"
                >
                  🔄 Try Again
                </Button>
              )}
            </div>
            <p className="text-xs text-[#999999] mt-4">
              These options will open in new tabs but keep your progress here
            </p>
          </div>
        ) : (
          <div className="relative h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A] z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
                  <p className="text-white mb-2">Loading PDF...</p>
                  {retryCount > 0 && (
                    <p className="text-sm text-[#CCCCCC]">
                      Trying alternative method ({retryCount + 1}/3)
                    </p>
                  )}
                </div>
              </div>
            )}
            <iframe
              key={embedUrl} // Force re-render when URL changes
              src={embedUrl}
              width="100%"
              height="100%"
              title={title}
              className="bg-white"
              allow="autoplay; encrypted-media"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{ 
                border: 'none',
                display: isLoading ? 'none' : 'block'
              }}
            />
          </div>
        )}
      </div>
      
      <div className="bg-[#2C2C2C]/50 rounded-lg p-3 text-center">
        <p className="text-xs text-[#CCCCCC] mb-2">
          📚 <strong>Study Tip:</strong> All viewing options maintain your progress in the LMS
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-[#999999]">
          <span>• Bookmark important pages</span>
          <span>• Take notes as you read</span>
          <span>• Return here for quizzes</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
