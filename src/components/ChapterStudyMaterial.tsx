import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Link as LinkIcon, BookOpen, FileSliders, Trophy, ExternalLink, RefreshCw } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { googleDriveService } from '@/services/googleDriveService';
import GoogleDriveEmbed from './GoogleDriveEmbed';
import { toast } from '@/hooks/use-toast';

interface ChapterStudyMaterialProps {
  subject: string;
  chapter: string;
  selectedGrade: number;
  onBack: () => void;
}

// Type for Supabase response that includes joined data
interface SupabaseStudyMaterial {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: string; // This comes as string from Supabase
  url?: string;
  file_path?: string;
  subject_id?: string;
  chapter_id?: string;
  grade?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  subjects?: { name: string; grade: number };
  chapters?: { name: string };
}

// Local study material type that matches our interface
interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  url?: string;
  file_path?: string;
  teacher_id?: string;
  subject_id?: string;
  chapter_id?: string;
  grade?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
}

const ChapterStudyMaterial = ({ subject, chapter, selectedGrade, onBack }: ChapterStudyMaterialProps) => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudyMaterials();
  }, [subject, chapter, selectedGrade]);

  const loadStudyMaterials = async () => {
    setIsLoading(true);
    try {
      // Load from Supabase with enhanced Google Drive support
      const { data: supabaseMaterials, error } = await dataService.getStudyMaterials({
        grade: selectedGrade,
        is_public: true // Ensure universal access
      });

      if (!error && supabaseMaterials?.length) {
        // Filter materials for this specific chapter and convert types
        const filteredMaterials = supabaseMaterials
          .filter((material: any) => {
            const subjectMatch = material.subjects?.name === subject;
            const chapterMatch = material.chapters?.name === chapter;
            return subjectMatch && chapterMatch;
          })
          .map((material: any): StudyMaterial => ({
            id: material.id,
            title: material.title,
            description: material.description,
            type: material.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
            url: material.url,
            file_path: material.file_path,
            teacher_id: material.teacher_id,
            subject_id: material.subject_id,
            chapter_id: material.chapter_id,
            grade: material.grade,
            is_public: material.is_public,
            created_at: material.created_at,
            updated_at: material.updated_at
          }));
        
        setStudyMaterials(filteredMaterials);
      } else {
        // Fallback to localStorage for demo content
        const localKey = `studentContent_${subject}_${selectedGrade}`;
        const localContent = JSON.parse(localStorage.getItem(localKey) || '[]');
        const chapterContent = localContent.filter((item: any) => item.embedInChapter === chapter);
        setStudyMaterials(chapterContent);
      }

      // Show success message if materials are loaded
      if (studyMaterials.length > 0) {
        toast({
          title: "Content Loaded",
          description: `Found ${studyMaterials.length} materials for ${chapter}`,
        });
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
      setStudyMaterials([]);
      toast({
        title: "Loading Error",
        description: "Failed to load study materials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadStudyMaterials();
    toast({
      title: "Refreshing Content",
      description: "Checking for latest updates...",
    });
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      textbook: BookOpen,
      video: Video,
      summary: FileText,
      ppt: FileSliders,
      quiz: Trophy,
      link: LinkIcon
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || FileText;
    return React.createElement(IconComponent, { className: "h-5 w-5" });
  };

  const renderMaterialContent = (material: StudyMaterial) => {
    if (material.url && dataService.isGoogleDriveUrl(material.url)) {
      // Enhanced Google Drive embedding with universal access
      return (
        <GoogleDriveEmbed
          url={material.url}
          title={material.title}
          description={material.description}
        />
      );
    } else if (material.url) {
      // Other URL types
      return (
        <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg p-4">
          <Button
            onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}
            className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open {material.title}
          </Button>
        </div>
      );
    } else {
      // No content available
      return (
        <div className="bg-[#666666]/10 border border-[#666666]/20 rounded-lg p-4">
          <p className="text-[#666666] text-sm">Content not available</p>
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-[#E0E0E0] hover:text-[#00E676]"
          >
            <ExternalLink className="h-4 w-4 mr-2 transform rotate-180" />
            Back to Subjects
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {subject} - {chapter}
        </h1>
        <p className="text-[#E0E0E0]">
          Explore study materials for Class {selectedGrade} • Universal Access Enabled
        </p>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading study materials...</p>
        </div>
      ) : (
        /* Study Materials Section */
        <div className="grid gap-6">
          {studyMaterials.map((material, index) => (
            <Card key={material.id || index} className="bg-[#1A1A1A] border-[#2C2C2C] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  {getTypeIcon(material.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{material.title}</h3>
                      {material.url && dataService.isGoogleDriveUrl(material.url) && (
                        <span className="text-xs bg-[#00E676]/20 text-[#00E676] px-2 py-1 rounded-full font-medium">
                          Universal Access
                        </span>
                      )}
                    </div>
                    {material.description && (
                      <p className="text-sm text-[#E0E0E0] font-normal mt-1">
                        {material.description}
                      </p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {renderMaterialContent(material)}
              </CardContent>
            </Card>
          ))}

          {studyMaterials.length === 0 && (
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-[#666666] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Study Materials Yet</h3>
                <p className="text-[#E0E0E0] mb-4">
                  Your teacher hasn't uploaded any materials for this chapter yet.
                </p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check for Updates
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterStudyMaterial;
