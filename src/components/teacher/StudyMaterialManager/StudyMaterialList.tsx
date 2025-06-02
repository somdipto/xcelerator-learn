
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ExternalLink, FileText, Video, Link as LinkIcon } from 'lucide-react';
import { StudyMaterial } from '../../../data/studyMaterial';

interface StudyMaterialListProps {
  materials: StudyMaterial[];
  onEdit: (material: StudyMaterial) => void;
  onDelete: (materialId: string) => void;
  isLoading?: boolean;
}

const StudyMaterialList: React.FC<StudyMaterialListProps> = ({ 
  materials, 
  onEdit, 
  onDelete, 
  isLoading 
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      video: 'bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/30',
      pdf: 'bg-[#E91E63]/20 text-[#E91E63] border-[#E91E63]/30',
      link: 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30',
      other: 'bg-[#FFA726]/20 text-[#FFA726] border-[#FFA726]/30'
    };
    
    return (
      <Badge variant="secondary" className={variants[type as keyof typeof variants] || variants.other}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const handleViewMaterial = (material: StudyMaterial) => {
    if (material.url) {
      window.open(material.url, '_blank');
    } else if (material.filePath) {
      // Construct the full URL for the uploaded file
      const fileUrl = `${window.location.origin}/uploads/${material.filePath.replace('uploads/', '')}`;
      window.open(fileUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-[#2C2C2C] border-[#424242]">
        <CardContent className="p-6">
          <div className="text-center text-[#E0E0E0]">Loading materials...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#2C2C2C] border-[#424242]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Study Materials ({materials.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-[#666666] mx-auto mb-4" />
            <h3 className="text-[#E0E0E0] text-lg font-medium mb-2">No study materials yet</h3>
            <p className="text-[#666666]">Start by adding your first study material using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#424242] hover:bg-[#424242]/50">
                  <TableHead className="text-[#E0E0E0]">Title</TableHead>
                  <TableHead className="text-[#E0E0E0]">Type</TableHead>
                  <TableHead className="text-[#E0E0E0]">Subject/Chapter</TableHead>
                  <TableHead className="text-[#E0E0E0]">Created</TableHead>
                  <TableHead className="text-[#E0E0E0] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map(material => (
                  <TableRow key={material.id} className="border-[#424242] hover:bg-[#424242]/30">
                    <TableCell>
                      <div>
                        <div className="text-white font-medium">{material.title}</div>
                        {material.description && (
                          <div className="text-sm text-[#CCCCCC] mt-1 truncate max-w-xs">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(material.type)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {material.subjectId && (
                          <div className="text-[#E0E0E0]">Subject: {material.subjectId}</div>
                        )}
                        {material.chapterId && (
                          <div className="text-[#CCCCCC]">Chapter: {material.chapterId}</div>
                        )}
                        {!material.subjectId && !material.chapterId && (
                          <span className="text-[#666666]">Not specified</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#CCCCCC]">
                        {material.createdAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {(material.url || material.filePath) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewMaterial(material)}
                            className="text-[#00E676] hover:text-[#00E676] hover:bg-[#00E676]/10"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(material)}
                          className="text-[#2979FF] hover:text-[#2979FF] hover:bg-[#2979FF]/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(material.id)}
                          className="text-[#E91E63] hover:text-[#E91E63] hover:bg-[#E91E63]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyMaterialList;
