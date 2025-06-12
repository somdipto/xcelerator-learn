
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RefreshCw, Eye, Trash2, BookOpen, Video, FileText, FileSliders, Trophy, File } from 'lucide-react';
import type { StudyMaterial } from '@/services/dataService';

interface ContentItem extends StudyMaterial {
  subjects?: { name: string; grade: number };
  chapters?: { name: string };
}

interface ContentListProps {
  contentList: ContentItem[];
  onRefresh: () => void;
  onDelete: (id: string, title: string) => void;
}

const ContentList: React.FC<ContentListProps> = ({
  contentList,
  onRefresh,
  onDelete
}) => {
  const getFileIcon = (type: string) => {
    const iconMap = {
      textbook: BookOpen,
      video: Video,
      summary: FileText,
      ppt: FileSliders,
      quiz: Trophy
    };
    return iconMap[type as keyof typeof iconMap] || File;
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Uploaded Content ({contentList.length})</span>
          <Button
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="border-[#424242] text-[#2979FF] hover:bg-[#2979FF]/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contentList.length === 0 ? (
          <div className="text-center text-[#E0E0E0] py-8">
            <Upload className="h-12 w-12 mx-auto mb-4 text-[#666666]" />
            <p>No content uploaded yet</p>
            <p className="text-sm text-[#666666]">Upload your first content using the form on the left</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {contentList.map((content) => {
              const IconComponent = getFileIcon(content.type);
              return (
                <div key={content.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg">
                  <IconComponent className="h-8 w-8 text-[#2979FF] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{content.title}</div>
                    <div className="text-sm text-[#E0E0E0]">
                      {content.subjects?.name} • Class {content.subjects?.grade}
                      {content.chapters?.name && ` • ${content.chapters.name}`}
                    </div>
                    <div className="text-xs text-[#666666] flex items-center gap-2">
                      <span className="bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded text-xs">
                        {content.type.toUpperCase()}
                      </span>
                      <span>{new Date(content.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {content.url && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-[#00E676] hover:bg-[#00E676]/10"
                        onClick={() => window.open(content.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-[#FF7043] hover:bg-[#FF7043]/10"
                      onClick={() => onDelete(content.id, content.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentList;
