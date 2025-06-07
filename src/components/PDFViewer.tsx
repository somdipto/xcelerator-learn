
import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Maximize2, Minimize2, AlertCircle, RefreshCw, Fullscreen, MinimizeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
          return `https://drive.google.com/uc?id=${fileId}&export=download`;
        } else if (attempt === 2) {
          return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(`https://drive.google.com/uc?id=${fileId}&export=download`)}`;
        }
      }
    }
    
    // For other URLs, try different viewers
    if (attempt === 0) {
      return url;
    } else if (attempt === 1) {
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;
    } else if (attempt === 2) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    
    return url;
  };

  const [embedUrl, setEmbedUrl] = useState(() => getEmbedUrl(pdfUrl, 0));

  // Fullscreen functionality
  const enterFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        await (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        await (containerRef.current as any).msRequestFullscreen();
      } else {
        // Fallback to expanded mode if fullscreen API is not supported
        setIsExpanded(true);
        return;
      }
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      // Fallback to expanded mode
      setIsExpanded(true);
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      } else {
        // Fallback to contracted mode
        setIsExpanded(false);
      }
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
      setIsExpanded(false);
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen]);

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
        targetUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
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
        targetUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
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
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, retryCount]);

  // Reset retry count when PDF URL changes
  useEffect(() => {
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setEmbedUrl(getEmbedUrl(pdfUrl, 0));
  }, [pdfUrl]);

  const getContainerHeight = () => {
    if (isFullscreen) return '100vh';
    if (isExpanded) return '80vh';
    return '50vh md:60vh'; // Tablet-optimized height
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h3 className="text-base md:text-lg font-semibold text-white truncate">{title}</h3>
        <div className="flex gap-2 flex-wrap">
          {hasError && retryCount < 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryLoading}
              className="border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726] hover:text-black h-11 px-3 touch-manipulation"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Retry</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white h-11 px-3 touch-manipulation"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span className="hidden md:inline ml-2">{isExpanded ? 'Minimize' : 'Expand'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white h-11 px-3 touch-manipulation"
          >
            {isFullscreen ? <MinimizeIcon className="h-4 w-4" /> : <Fullscreen className="h-4 w-4" />}
            <span className="hidden md:inline ml-2">Full</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInNewTab}
            className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black h-11 px-3 touch-manipulation"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Open</span>
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className={`rounded-lg overflow-hidden border border-[#2C2C2C] ${
          isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''
        }`}
        style={{ height: getContainerHeight() }}
      >
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full bg-[#1A1A1A] text-center p-4 md:p-6">
            <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-[#FF6B6B] mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">PDF Viewer Options</h3>
            <p className="text-[#CCCCCC] mb-6 max-w-md text-sm md:text-base">
              The PDF couldn't be embedded directly. Choose one of these viewing options to continue studying:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
              <Button
                onClick={openInNewTab}
                className="bg-[#00E676] text-black hover:bg-[#00E676]/80 h-12 touch-manipulation"
              >
                📄 Original Source
              </Button>
              <Button
                onClick={openWithGoogleViewer}
                variant="outline"
                className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white h-12 touch-manipulation"
              >
                🔍 Google Viewer
              </Button>
              <Button
                onClick={openWithMozillaViewer}
                variant="outline"
                className="border-[#FFA726] text-[#FFA726] hover:bg-[#FFA726] hover:text-black h-12 touch-manipulation"
              >
                📖 PDF.js Viewer
              </Button>
              {retryCount < 3 && (
                <Button
                  onClick={retryLoading}
                  variant="outline"
                  className="border-[#E91E63] text-[#E91E63] hover:bg-[#E91E63] hover:text-white h-12 touch-manipulation"
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
                  <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
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
            {isFullscreen && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitFullscreen}
                  className="bg-black/50 border-white/20 text-white hover:bg-white/10 h-12 px-4 touch-manipulation"
                >
                  <MinimizeIcon className="h-4 w-4 mr-2" />
                  Exit Fullscreen
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-[#2C2C2C]/50 rounded-lg p-3 md:p-4 text-center">
        <p className="text-xs md:text-sm text-[#CCCCCC] mb-2">
          📚 <strong>Study Tip:</strong> All viewing options maintain your progress in the LMS
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-[#999999]">
          <span>• Use fullscreen for better focus</span>
          <span>• Take notes as you read</span>
          <span>• Return here for quizzes</span>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
