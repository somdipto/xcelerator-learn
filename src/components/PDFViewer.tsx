
import React, { useState } from 'react';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

const PDFViewer = ({ pdfUrl, title }: PDFViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const openInNewTab = () => {
    const originalUrl = pdfUrl.replace('/preview', '/view');
    window.open(originalUrl, '_blank');
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
        <iframe
          src={pdfUrl}
          width="100%"
          height="100%"
          title={title}
          className="bg-white"
          allow="autoplay; encrypted-media"
        />
      </div>
      
      <p className="text-xs text-[#CCCCCC] text-center">
        If the PDF doesn't load, try opening it in a new tab using the external link button above.
      </p>
    </div>
  );
};

export default PDFViewer;
