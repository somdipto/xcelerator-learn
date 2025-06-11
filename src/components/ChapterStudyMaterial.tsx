import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Trophy, RefreshCw, BookOpen, FileText, Video, FileSliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subjects, SubjectName } from '@/data/subjects';
import { getStudyMaterial, convertToEmbedUrl } from '@/data/studyMaterials';
import { supabaseService, StudyMaterial } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import PDFViewer from './PDFViewer';

interface ChapterStudyMaterialProps {
  subject: SubjectName;
  chapter: string;
  selectedGrade: number;
  onBack: () => void;
}

const ChapterStudyMaterial = ({ subject, chapter, selectedGrade, onBack }: ChapterStudyMaterialProps) => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('textbook');
  
  const subjectData = subjects[subject];
  const localStudyMaterial = getStudyMaterial(subject, selectedGrade, chapter);

  useEffect(() => {
    loadStudyMaterials();
  }, [subject, chapter, selectedGrade]);

  const loadStudyMaterials = async () => {
    setIsLoading(true);
    try {
      // Get all study materials from Supabase
      const { data, error } = await supabaseService.getStudyMaterials();

      if (error) {
        console.error('Error loading study materials:', error);
        toast({
          title: "Error",
          description: "Failed to load study materials",
          variant: "destructive",
        });
        setStudyMaterials([]);
      } else {
        // Filter materials to match current context
        const filteredMaterials = (data || []).filter(material => {
          const materialTitle = material.title.toLowerCase();
          const subjectMatch = materialTitle.includes(subject.toLowerCase()) ||
                             material.chapter_id?.includes(subject.toLowerCase());
          const chapterMatch = materialTitle.includes(chapter.toLowerCase()) ||
                             material.chapter_id?.includes(chapter.toLowerCase());
          return subjectMatch && chapterMatch;
        });

        setStudyMaterials(filteredMaterials);
        console.log('Loaded study materials:', filteredMaterials);
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
      toast({
        title: "Error",
        description: "Failed to load study materials",
        variant: "destructive",
      });
      setStudyMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Categorize materials by type
  const textbookMaterials = studyMaterials.filter(m => m.type === 'textbook');
  const videoMaterials = studyMaterials.filter(m => m.type === 'video');
  const summaryMaterials = studyMaterials.filter(m => m.type === 'summary');
  const pptMaterials = studyMaterials.filter(m => m.type === 'ppt');
  const quizMaterials = studyMaterials.filter(m => m.type === 'quiz');

  // Get the primary textbook for theory tab (prioritize mock data, then local data)
  const primaryTextbook = textbookMaterials[0] || (localStudyMaterial?.pdfUrl ? {
    id: 'local-pdf',
    title: `${chapter} - Textbook`,
    description: `Local textbook for ${chapter}`,
    type: 'notes' as const,
    content_url: localStudyMaterial.pdfUrl,
    chapter_id: chapter,
    order_index: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } : null);

  const renderEmbeddedContent = (url: string, title: string, type: string) => {
    const embedUrl = convertToEmbedUrl(url);
    
    return (
      <div className="w-full h-[600px] md:h-[700px] bg-white rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="autoplay"
          loading="lazy"
        />
      </div>
    );
  };

  const renderMaterialCard = (material: StudyMaterial, icon: string, color: string) => (
    <Card key={material.id} className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300 touch-manipulation">
      <CardHeader className="pb-3">
        <CardTitle className={`text-${color} text-base md:text-lg flex items-center gap-2 flex-wrap`}>
          <span className="text-xl">{icon}</span>
          <span className="flex-1 min-w-0 truncate">{material.title}</span>
          <Badge variant="secondary" className={`bg-${color}/20 text-${color} border-${color}/30 text-xs`}>
            {material.type.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {material.description && (
          <p className="text-[#E0E0E0] mb-3 text-sm md:text-base line-clamp-2">{material.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span>Added {new Date(material.created_at).toLocaleDateString()}</span>
        </div>
        {material.content_url ? (
          renderEmbeddedContent(material.content_url, material.title, material.type)
        ) : (
          <div className="text-center py-8">
            <p className="text-[#666666]">Content not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Helper function to render local study materials with embedded content
  const renderLocalMaterialTab = (url: string | undefined, title: string, emptyMessage: string) => {
    if (url) {
      return renderEmbeddedContent(url, title, 'local');
    }
    
    return (
      <div className="text-center py-12">
        <div className="text-4xl md:text-6xl mb-4">
          <BookOpen className="h-16 w-16 mx-auto text-[#666666]" />
        </div>
        <h3 className="text-lg md:text-xl text-[#E0E0E0] mb-2">No content available yet</h3>
        <p className="text-[#666666] text-sm md:text-base">{emptyMessage}</p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-[#00E676]" />
          <p className="text-[#E0E0E0] text-lg">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        {/* Header - Tablet Optimized */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/10 transition-all duration-200 touch-manipulation h-12 px-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Subjects
          </Button>
          <Button
            variant="outline"
            onClick={loadStudyMaterials}
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white h-12 px-4 touch-manipulation"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh Content
          </Button>
        </div>
        
        <Card className="bg-[#1A1A1A]/80 backdrop-blur-md border-[#2C2C2C] shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex flex-col md:flex-row md:items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${subjectData.gradient} flex-shrink-0`}>
                <span className="text-2xl">{subjectData.icon}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent leading-tight">
                  {subject} - {chapter}
                </h1>
                <p className="text-[#E0E0E0] text-sm md:text-base font-normal mt-1">
                  Class {selectedGrade} Study Material ({studyMaterials.length} items available)
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-[#2C2C2C] border border-[#424242] mb-6 h-auto">
                <TabsTrigger 
                  value="textbook" 
                  className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-[#E0E0E0] h-12 md:h-10 text-sm touch-manipulation"
                >
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden md:inline">Textbook</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="videos" 
                  className="data-[state=active]:bg-[#2979FF] data-[state=active]:text-white text-[#E0E0E0] h-12 md:h-10 text-sm touch-manipulation"
                >
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span className="hidden md:inline">Videos</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="summary" 
                  className="data-[state=active]:bg-[#FFA726] data-[state=active]:text-black text-[#E0E0E0] h-12 md:h-10 text-sm touch-manipulation"
                >
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Summary</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="ppt" 
                  className="data-[state=active]:bg-[#FF7043] data-[state=active]:text-white text-[#E0E0E0] h-12 md:h-10 text-sm touch-manipulation"
                >
                  <div className="flex items-center gap-1">
                    <FileSliders className="h-4 w-4" />
                    <span className="hidden md:inline">PPT</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz" 
                  className="data-[state=active]:bg-[#E91E63] data-[state=active]:text-white text-[#E0E0E0] h-12 md:h-10 text-sm touch-manipulation"
                >
                  <div className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    <span className="hidden md:inline">Quiz</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="textbook" className="space-y-6">
                {renderLocalMaterialTab(
                  localStudyMaterial?.pdfUrl,
                  `${chapter} - Textbook`,
                  `Textbook materials for ${chapter} will be uploaded by teachers soon.`
                )}

                {/* Additional textbook materials from Supabase */}
                {textbookMaterials.length > 0 && (
                  <div className="grid md:grid-cols-1 gap-4 md:gap-6 mt-6">
                    {textbookMaterials.map(material => 
                      renderMaterialCard(material, '📚', '[#00E676]')
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                {renderLocalMaterialTab(
                  localStudyMaterial?.videoUrl,
                  `${chapter} - Video Lecture`,
                  `Video lectures for ${chapter} will be uploaded by teachers soon.`
                )}

                {/* Additional video materials from Supabase */}
                {videoMaterials.length > 0 && (
                  <div className="grid md:grid-cols-1 gap-4 md:gap-6 mt-6">
                    {videoMaterials.map(material => 
                      renderMaterialCard(material, '🎥', '[#2979FF]')
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-6">
                {renderLocalMaterialTab(
                  localStudyMaterial?.summaryUrl,
                  `${chapter} - Summary Notes`,
                  `Summary notes for ${chapter} will be uploaded by teachers soon.`
                )}

                {/* Additional summary materials from Supabase */}
                {summaryMaterials.length > 0 && (
                  <div className="grid md:grid-cols-1 gap-4 md:gap-6 mt-6">
                    {summaryMaterials.map(material => 
                      renderMaterialCard(material, '📝', '[#FFA726]')
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ppt" className="space-y-6">
                {renderLocalMaterialTab(
                  localStudyMaterial?.pptUrl,
                  `${chapter} - Presentation`,
                  `PowerPoint presentations for ${chapter} will be uploaded by teachers soon.`
                )}

                {/* Additional PPT materials from Supabase */}
                {pptMaterials.length > 0 && (
                  <div className="grid md:grid-cols-1 gap-4 md:gap-6 mt-6">
                    {pptMaterials.map(material => 
                      renderMaterialCard(material, '📊', '[#FF7043]')
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quiz" className="space-y-6">
                {renderLocalMaterialTab(
                  localStudyMaterial?.quizUrl,
                  `${chapter} - Quiz`,
                  `Quizzes and assessments for ${chapter} will be created by teachers soon.`
                )}

                {/* Additional quiz materials from Supabase */}
                {quizMaterials.length > 0 && (
                  <div className="grid md:grid-cols-1 gap-4 md:gap-6 mt-6">
                    {quizMaterials.map(material => 
                      renderMaterialCard(material, '🏆', '[#E91E63]')
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChapterStudyMaterial;
