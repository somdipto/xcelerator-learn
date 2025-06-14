
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Video, 
  Book, 
  Presentation, 
  HelpCircle, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  url?: string;
  grade?: number;
  created_at: string;
  subjects?: { name: string };
  chapters?: { name: string };
}

interface ContentListProps {
  contentList: ContentItem[];
  onRefresh: () => void;
  onDelete: (id: string, title: string) => void;
  showActions?: boolean;
}

const ContentList: React.FC<ContentListProps> = ({ 
  contentList, 
  onRefresh, 
  onDelete,
  showActions = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'textbook':
        return <Book className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'summary':
        return <FileText className="h-4 w-4" />;
      case 'ppt':
        return <Presentation className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'textbook':
        return 'bg-blue-500/20 text-blue-400';
      case 'video':
        return 'bg-red-500/20 text-red-400';
      case 'summary':
        return 'bg-green-500/20 text-green-400';
      case 'ppt':
        return 'bg-orange-500/20 text-orange-400';
      case 'quiz':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const filteredContent = contentList.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subjects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.chapters?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (contentList.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-[#666666] mb-4" />
        <p className="text-[#E0E0E0] mb-4">No study materials found</p>
        {showActions && (
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showActions && (
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <Input
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2C2C2C] border-[#424242] text-white"
            />
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {filteredContent.map((item) => (
          <Card key={item.id} className="bg-[#2C2C2C] border-[#424242]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getTypeColor(item.type)} border-0`}>
                      {getTypeIcon(item.type)}
                      <span className="ml-1 capitalize">{item.type}</span>
                    </Badge>
                    {item.grade && (
                      <Badge variant="outline" className="border-[#666666] text-[#E0E0E0]">
                        Class {item.grade}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  
                  {item.description && (
                    <p className="text-[#999999] text-sm mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-[#666666]">
                    {item.subjects?.name && (
                      <span>Subject: {item.subjects.name}</span>
                    )}
                    {item.chapters?.name && (
                      <span>Chapter: {item.chapters.name}</span>
                    )}
                    <span>
                      Added: {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {showActions && (
                  <div className="flex items-center gap-2 ml-4">
                    {item.url && (
                      <Button
                        onClick={() => window.open(item.url, '_blank')}
                        size="sm"
                        variant="outline"
                        className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      onClick={() => onDelete(item.id, item.title)}
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredContent.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-[#666666] mb-4" />
          <p className="text-[#E0E0E0]">No materials found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ContentList;
