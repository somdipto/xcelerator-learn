
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Trophy, RefreshCw, BookOpen, FileText, Video, FileSliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { subjects, SubjectName } from '@/data/subjects';
import { getStudyMaterial } from '@/data/studyMaterials';
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
  const [hasSupabaseError, setHasSupabaseError] = useState(false);
  const [showError, setShowError] = useState(false);
  
  const subjectData = subjects[subject];
  const localStudyMaterial = getStudyMaterial(subject, selectedGrade, chapter);

  useEffect(() => {
    loadStudyMaterials();
  }, [subject, chapter, selectedGrade]);

  const loadStudyMaterials = async () => {
    setIsLoading(true);
    try {
      // First try to load from Supabase
      if (supabaseService.client) {
        const { data, error } = await supabaseService.getStudyMaterials({
          grade: selectedGrade
        });

        if (error) {
          console.error('Error loading study materials:', error);
          setHasSupabaseError(true);
          setShowError(true);
          return;
        }

        const transformedMaterials: StudyMaterial[] = (data || [])
          .filter(material => {
            const materialTitle = material.title.toLowerCase();
            const subjectMatch = materialTitle.includes(subject.toLowerCase()) || 
                               material.subject_id === subject;
            const chapterMatch = materialTitle.includes(chapter.toLowerCase()) || 
                               material.chapter_id === chapter;
            return subjectMatch && chapterMatch;
          })
          .map(material => ({
            id: material.id,
            teacher_id: material.teacher_id,
            title: material.title,
            description: material.description,
            type: ['textbook', 'video', 'summary', 'ppt', 'quiz'].includes(material.type) 
              ? material.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'
              : 'textbook',
            url: material.url,
            file_path: material.file_path,
            subject_id: material.subject_id,
            chapter_id: material.chapter_id,
            grade: material.grade,
            is_public: material.is_public,
            created_at: material.created_at,
            updated_at: material.updated_at
          }));
        
        setStudyMaterials(transformedMaterials);
        setShowError(false);
      } else {
        // If no Supabase client, just use local data
        setShowError(false);
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
      setHasSupabaseError(true);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // If there's an error but we have local data, show the local data
  if (hasSupabaseError && localStudyMaterial) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-4">Database Connection Error</h2>
          <p className="text-[#E0E0E0] mb-6">
            We're having trouble connecting to the database. Showing local content instead.
          </p>
          <div className="space-y-2 text-[#E0E0E0] mb-6">
            <div className="flex items-center gap-2">
              <span className="text-[#00E676]">1.</span>
              <span>Make sure you have internet connection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00E676]">2.</span>
              <span>Check if the database is properly configured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#00E676]">3.</span>
              <span>Try refreshing the page</span>
            </div>
          </div>
          <Button 
            onClick={() => {
              setHasSupabaseError(false);
              loadStudyMaterials();
            }}
            className="bg-[#00E676] text-black hover:bg-[#00E676]/90"
          >
            Try Again
          </Button>
          <Button 
            onClick={onBack}
            variant="outline"
            className="mt-4"
          >
            Back to Subjects
          </Button>
        </div>
      </div>
    );
  }

  // If we have local data, show it regardless of Supabase status
  if (localStudyMaterial) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <Button 
                onClick={onBack}
                variant="outline"
                className="text-[#00E676] hover:bg-[#00E676]/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {subject}
              </Button>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#00E676] to-[#2979FF] bg-clip-text text-transparent">
                {chapter}
              </h2>
            </div>
            <p className="text-[#CCCCCC] mt-2">
              {localStudyMaterial.description || `Chapter ${chapter.split(' ')[1]} of ${subject} for Class ${selectedGrade}`}
            </p>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="textbook" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="textbook" className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black">
                <BookOpen className="h-4 w-4 mr-2" />
                Textbook
              </TabsTrigger>
              <TabsTrigger value="videos" className="data-[state=active]:bg-[#2979FF] data-[state=active]:text-black">
                <Video className="h-4 w-4 mr-2" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="summaries" className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black">
                <FileText className="h-4 w-4 mr-2" />
                Summaries
              </TabsTrigger>
              <TabsTrigger value="quizzes" className="data-[state=active]:bg-[#2979FF] data-[state=active]:text-black">
                <Trophy className="h-4 w-4 mr-2" />
                Quizzes
              </TabsTrigger>
            </TabsList>
            <TabsContent value="textbook" className="mt-4">
              <div className="space-y-4">
                {localStudyMaterial.pdfUrl && (
                  <PDFViewer url={localStudyMaterial.pdfUrl} />
                )}
              </div>
            </TabsContent>
            <TabsContent value="videos" className="mt-4">
              <div className="space-y-4">
                {localStudyMaterial.videoUrls?.map((url, index) => (
                  <div key={index} className="aspect-video">
                    <iframe 
                      src={url} 
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="summaries" className="mt-4">
              <div className="space-y-4">
                {localStudyMaterial.summary && (
                  <div className="prose prose-invert max-w-none">
                    {localStudyMaterial.summary}
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="quizzes" className="mt-4">
              <div className="space-y-4">
                {localStudyMaterial.quizzes?.map((quiz, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-[#00E676] mb-2">Quiz {index + 1}</h3>
                    {/* Quiz content would go here */}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Categorize materials by type
  const textbookMaterials = studyMaterials.filter(m => m.type === 'textbook');
  const videoMaterials = studyMaterials.filter(m => m.type === 'video');
  const summaryMaterials = studyMaterials.filter(m => m.type === 'summary');
  const pptMaterials = studyMaterials.filter(m => m.type === 'ppt');
  const quizMaterials = studyMaterials.filter(m => m.type === 'quiz');

  // Get the primary textbook for theory tab (prioritize teacher uploads)
  const primaryTextbook = textbookMaterials[0] || (localStudyMaterial?.pdfUrl ? {
    id: 'local-pdf',
    title: `${chapter} - Textbook`,
    url: localStudyMaterial.pdfUrl,
    type: 'textbook' as const,
    teacher_id: '',
    is_public: true,
    created_at: '',
    updated_at: ''
  } : null);

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
        <Button 
          onClick={() => {
            if (material.url) {
              window.open(material.url, '_blank');
            } else if (material.file_path) {
              // Use Supabase storage URL for uploaded files
              const fileUrl = supabaseService.getFileUrl('study-materials', material.file_path);
              window.open(fileUrl, '_blank');
            }
          }}
          className={`w-full bg-${color} text-black hover:bg-${color}/90 font-medium h-11 md:h-12 touch-manipulation`}
        >
          {material.type === 'video' ? 'Watch Video' : 
           material.type === 'textbook' ? 'View Textbook' :
           material.type === 'summary' ? 'Read Summary' :
           material.type === 'ppt' ? 'View Presentation' :
           material.type === 'quiz' ? 'Take Quiz' :
           'Open Content'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderComingSoonCard = (title: string, description: string, icon: string, color: string, estimatedTime: string) => (
    <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className={`text-${color} text-base md:text-lg flex items-center gap-2`}>
          <span className="text-xl">{icon}</span>
          <span className="flex-1">{title}</span>
          <Badge variant="secondary" className="bg-[#666666]/20 text-[#666666] border-[#666666]/30 text-xs">
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-[#E0E0E0] mb-3 text-sm md:text-base">{description}</p>
        <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
          <Clock className="h-3 w-3" />
          <span>{estimatedTime}</span>
        </div>
        <Button disabled className="w-full bg-[#666666] text-[#CCCCCC] font-medium h-11 md:h-12">
          Coming Soon
        </Button>
      </CardContent>
    </Card>
  );

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
                {primaryTextbook ? (
                  <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242]">
                    <CardHeader>
                      <CardTitle className="text-[#00E676] text-lg md:text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {primaryTextbook.title}
                        <Badge variant="secondary" className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30">
                          TEXTBOOK
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PDFViewer 
                        pdfUrl={primaryTextbook.url || supabaseService.getFileUrl('study-materials', primaryTextbook.file_path || '')} 
                        title={primaryTextbook.title}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl md:text-6xl mb-4"><BookOpen className="h-16 w-16 mx-auto text-[#666666]" /></div>
                    <h3 className="text-lg md:text-xl text-[#E0E0E0] mb-2">No textbook materials yet</h3>
                    <p className="text-[#666666] text-sm md:text-base">Textbook materials for {chapter} will be uploaded by teachers soon.</p>
                  </div>
                )}

                {/* Additional textbook materials */}
                {textbookMaterials.length > 1 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {textbookMaterials.slice(1).map(material => 
                      renderMaterialCard(material, '📚', '[#00E676]')
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                {videoMaterials.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {videoMaterials.map(material => 
                      renderMaterialCard(material, '🎥', '[#2979FF]')
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl md:text-6xl mb-4"><Video className="h-16 w-16 mx-auto text-[#666666]" /></div>
                    <h3 className="text-lg md:text-xl text-[#E0E0E0] mb-2">No video materials yet</h3>
                    <p className="text-[#666666] text-sm md:text-base">Video lectures for {chapter} will be uploaded by teachers soon.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="summary" className="space-y-6">
                {summaryMaterials.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {summaryMaterials.map(material => 
                      renderMaterialCard(material, '📝', '[#FFA726]')
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl md:text-6xl mb-4"><FileText className="h-16 w-16 mx-auto text-[#666666]" /></div>
                    <h3 className="text-lg md:text-xl text-[#E0E0E0] mb-2">No summary materials yet</h3>
                    <p className="text-[#666666] text-sm md:text-base">Summary notes for {chapter} will be uploaded by teachers soon.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ppt" className="space-y-6">
                {pptMaterials.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {pptMaterials.map(material => 
                      renderMaterialCard(material, '📊', '[#FF7043]')
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl md:text-6xl mb-4"><FileSliders className="h-16 w-16 mx-auto text-[#666666]" /></div>
                    <h3 className="text-lg md:text-xl text-[#E0E0E0] mb-2">No presentation materials yet</h3>
                    <p className="text-[#666666] text-sm md:text-base">PowerPoint presentations for {chapter} will be uploaded by teachers soon.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quiz" className="space-y-6">
                {quizMaterials.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {quizMaterials.map(material => 
                      renderMaterialCard(material, '🏆', '[#E91E63]')
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl md:text-6xl mb-4"><Trophy className="h-16 w-16 mx-auto text-[#666666]" /></div>
                    <h3 className="text-lg md:text-xl text-[#E0E0E0] mb-2">No quizzes available yet</h3>
                    <p className="text-[#666666] text-sm md:text-base">Quizzes and assessments for {chapter} will be created by teachers soon.</p>
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
