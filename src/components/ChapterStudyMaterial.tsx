import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Link as LinkIcon, BookOpen, FileSliders, Trophy, ExternalLink } from 'lucide-react';
import { StudyMaterial, dataService } from '@/services/dataService';
import GoogleDriveEmbed from './GoogleDriveEmbed';

interface ChapterStudyMaterialProps {
  subject: string;
  chapter: string;
  selectedGrade: number;
  onBack: () => void;
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
      // Load from Supabase first
      const { data: supabaseMaterials, error } = await dataService.getStudyMaterials({
        grade: selectedGrade
      });

      if (!error && supabaseMaterials?.length) {
        // Filter materials for this specific chapter
        const filteredMaterials = supabaseMaterials.filter((material: any) => {
          const subjectMatch = material.subjects?.name === subject;
          const chapterMatch = material.chapters?.name === chapter;
          return subjectMatch && chapterMatch;
        });
        
        setStudyMaterials(filteredMaterials);
      } else {
        // Fallback to localStorage for demo content
        const localKey = `studentContent_${subject}_${selectedGrade}`;
        const localContent = JSON.parse(localStorage.getItem(localKey) || '[]');
        const chapterContent = localContent.filter((item: any) => item.embedInChapter === chapter);
        setStudyMaterials(chapterContent);
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
      setStudyMaterials([]);
    } finally {
      setIsLoading(false);
    }
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
    return iconMap[type as keyof typeof iconMap] || FileText;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-[#E0E0E0] hover:text-[#00E676] mb-4"
        >
          <ExternalLink className="h-4 w-4 mr-2 transform rotate-180" />
          Back to Subjects
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">
          {subject} - {chapter}
        </h1>
        <p className="text-[#E0E0E0]">
          Explore study materials for Class {selectedGrade}
        </p>
      </div>
      
      {/* Study Materials Section */}
      <div className="grid gap-6">
        {studyMaterials.map((material, index) => (
          <Card key={material.id || index} className="bg-[#1A1A1A] border-[#2C2C2C] overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-3">
                {getTypeIcon(material.type)}
                <div>
                  <h3 className="text-lg font-semibold">{material.title}</h3>
                  {material.description && (
                    <p className="text-sm text-[#E0E0E0] font-normal mt-1">
                      {material.description}
                    </p>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {material.url && dataService.isGoogleDriveUrl(material.url) ? (
                <GoogleDriveEmbed
                  url={material.url}
                  title={material.title}
                  description={material.description}
                />
              ) : material.url ? (
                <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg p-4">
                  <Button
                    onClick={() => window.open(material.url, '_blank')}
                    className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open {material.title}
                  </Button>
                </div>
              ) : (
                <div className="bg-[#666666]/10 border border-[#666666]/20 rounded-lg p-4">
                  <p className="text-[#666666] text-sm">Content not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {studyMaterials.length === 0 && !isLoading && (
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-[#666666] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Study Materials Yet</h3>
              <p className="text-[#E0E0E0]">
                Your teacher hasn't uploaded any materials for this chapter yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChapterStudyMaterial;
