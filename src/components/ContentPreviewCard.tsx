
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, FileText, FileSliders, Trophy, Eye, Download, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ContentPreviewCardProps {
  title: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  subject: string;
  chapter: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
  isNew?: boolean;
  onClick?: () => void;
}

const ContentPreviewCard = ({
  title,
  type,
  subject,
  chapter,
  uploadedBy,
  uploadedAt,
  url,
  isNew = false,
  onClick
}: ContentPreviewCardProps) => {
  const getTypeIcon = () => {
    const iconMap = {
      textbook: BookOpen,
      video: Video,
      summary: FileText,
      ppt: FileSliders,
      quiz: Trophy
    };
    return iconMap[type] || BookOpen;
  };

  const getTypeColor = () => {
    const colorMap = {
      textbook: 'bg-[#2979FF]',
      video: 'bg-[#FF7043]',
      summary: 'bg-[#00E676]',
      ppt: 'bg-[#FFA726]',
      quiz: 'bg-[#E91E63]'
    };
    return colorMap[type] || 'bg-[#2979FF]';
  };

  const Icon = getTypeIcon();

  return (
    <Card className="bg-[#1A1A1A] border-[#2C2C2C] hover:border-[#2979FF]/50 transition-all duration-200 group cursor-pointer relative overflow-hidden">
      {isNew && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-[#00E676] text-black text-xs animate-pulse">
            NEW
          </Badge>
        </div>
      )}
      
      <CardContent className="p-4" onClick={onClick}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${getTypeColor()} flex-shrink-0`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-[#00E676] transition-colors">
              {title}
            </h3>
            
            <div className="text-xs text-[#E0E0E0] mb-2">
              <span className="text-[#2979FF]">{subject}</span>
              <span className="text-[#666666] mx-1">•</span>
              <span>{chapter}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-[#666666] flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>by {uploadedBy}</span>
                <span className="mx-1">•</span>
                <span>{uploadedAt}</span>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-[#2979FF] hover:bg-[#2979FF]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (url) window.open(url, '_blank');
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-[#00E676] hover:bg-[#00E676]/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download logic
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentPreviewCard;
