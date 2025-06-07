import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Trophy, RefreshCw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('theory');
  
  const subjectData = subjects[subject];
  const localStudyMaterial = getStudyMaterial(subject, selectedGrade, chapter);

  useEffect(() => {
    loadStudyMaterials();
    
    // Subscribe to real-time updates from teacher uploads
    const channel = supabaseService.subscribeToStudyMaterials((payload) => {
      console.log('Real-time study material update:', payload);
      loadStudyMaterials(); // Reload materials when changes occur
      
      if (payload.eventType === 'INSERT') {
        toast({
          title: "New Content Available",
          description: "New study materials have been added by teachers",
        });
      } else if (payload.eventType === 'UPDATE') {
        toast({
          title: "Content Updated",
          description: "Study materials have been updated by teachers",
        });
      } else if (payload.eventType === 'DELETE') {
        toast({
          title: "Content Removed",
          description: "Some study materials have been removed",
        });
      }
    });

    return () => {
      supabaseService.supabase.removeChannel(channel);
    };
  }, [subject, chapter, selectedGrade]);

  const loadStudyMaterials = async () => {
    setIsLoading(true);
    try {
      // Fetch study materials from Supabase that match current context
      const { data, error } = await supabaseService.getStudyMaterials({
        grade: selectedGrade
      });

      if (error) {
        console.error('Error loading study materials:', error);
        toast({
          title: "Error",
          description: "Failed to load study materials",
          variant: "destructive",
        });
      } else {
        // Filter and transform materials to match our type
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
            type: material.type as 'video' | 'pdf' | 'link' | 'other', // Type assertion
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
        console.log('Loaded and transformed study materials:', transformedMaterials);
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
      toast({
        title: "Error",
        description: "Failed to load study materials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Categorize materials by type
  const pdfMaterials = studyMaterials.filter(m => m.type === 'pdf');
  const videoMaterials = studyMaterials.filter(m => m.type === 'video');
  const linkMaterials = studyMaterials.filter(m => m.type === 'link');
  const otherMaterials = studyMaterials.filter(m => m.type === 'other');

  // Get the primary PDF for theory tab (prioritize teacher uploads)
  const primaryPDF = pdfMaterials[0] || (localStudyMaterial?.pdfUrl ? {
    id: 'local-pdf',
    title: `${chapter} - Theory`,
    url: localStudyMaterial.pdfUrl,
    type: 'pdf' as const,
    teacher_id: '',
    is_public: true,
    created_at: '',
    updated_at: ''
  } : null);

  const renderMaterialCard = (material: StudyMaterial, icon: string, color: string) => (
    <Card key={material.id} className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300">
      <CardHeader>
        <CardTitle className={`text-${color} text-lg flex items-center gap-2`}>
          <span className="text-xl">{icon}</span>
          {material.title}
          <Badge variant="secondary" className={`bg-${color}/20 text-${color} border-${color}/30`}>
            {material.type.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {material.description && (
          <p className="text-[#E0E0E0] mb-4">{material.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
          <Clock className="h-3 w-3" />
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
          className={`w-full bg-${color} text-black hover:bg-${color}/90 font-medium`}
        >
          {material.type === 'video' ? 'Watch Video' : 
           material.type === 'pdf' ? 'View PDF' : 
           'Open Content'}
        </Button>
      </CardContent>
    </Card>
  );

  const renderComingSoonCard = (title: string, description: string, icon: string, color: string, estimatedTime: string) => (
    <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300">
      <CardHeader>
        <CardTitle className={`text-${color} text-lg flex items-center gap-2`}>
          <span className="text-xl">{icon}</span>
          {title}
          <Badge variant="secondary" className="bg-[#666666]/20 text-[#666666] border-[#666666]/30">
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-[#E0E0E0] mb-4">{description}</p>
        <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
          <Clock className="h-3 w-3" />
          <span>{estimatedTime}</span>
        </div>
        <Button disabled className="w-full bg-[#666666] text-[#CCCCCC] font-medium">
          Coming Soon
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-[#00E676]" />
          <p className="text-[#E0E0E0]">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/10 transition-all duration-200 touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadStudyMaterials}
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Content
          </Button>
        </div>
        
        <Card className="bg-[#1A1A1A]/80 backdrop-blur-md border-[#2C2C2C] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${subjectData.gradient}`}>
                <span className="text-2xl">{subjectData.icon}</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">
                  {subject} - {chapter}
                </h1>
                <p className="text-[#E0E0E0] text-sm font-normal">
                  Class {selectedGrade} Study Material ({studyMaterials.length} items available)
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#2C2C2C] border border-[#424242] mb-6">
                <TabsTrigger 
                  value="theory" 
                  className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-[#E0E0E0]"
                >
                  📚 Theory
                </TabsTrigger>
                <TabsTrigger 
                  value="videos" 
                  className="data-[state=active]:bg-[#2979FF] data-[state=active]:text-white text-[#E0E0E0]"
                >
                  🎥 Videos
                </TabsTrigger>
                <TabsTrigger 
                  value="practice" 
                  className="data-[state=active]:bg-[#FFA726] data-[state=active]:text-black text-[#E0E0E0]"
                >
                  📝 Practice
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz" 
                  className="data-[state=active]:bg-[#E91E63] data-[state=active]:text-white text-[#E0E0E0]"
                >
                  🏆 Quiz
                </TabsTrigger>
              </TabsList>

              <TabsContent value="theory" className="space-y-6">
                {primaryPDF ? (
                  <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242]">
                    <CardHeader>
                      <CardTitle className="text-[#00E676] text-lg flex items-center gap-2">
                        📚 {primaryPDF.title}
                        <Badge variant="secondary" className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30">
                          PDF
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PDFViewer 
                        pdfUrl={primaryPDF.url || supabaseService.getFileUrl('study-materials', primaryPDF.file_path || '')} 
                        title={primaryPDF.title}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-xl text-[#E0E0E0] mb-2">No theory materials yet</h3>
                    <p className="text-[#666666]">Theory materials for {chapter} will be uploaded by teachers soon.</p>
                  </div>
                )}

                {/* Additional PDF materials */}
                {pdfMaterials.length > 1 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pdfMaterials.slice(1).map(material => 
                      renderMaterialCard(material, '📄', '[#00E676]')
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="space-y-6">
                {videoMaterials.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videoMaterials.map(material => 
                      renderMaterialCard(material, '🎥', '[#2979FF]')
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderComingSoonCard(
                      'Video Lectures',
                      'Interactive video lessons with detailed explanations.',
                      '🎥',
                      '[#2979FF]',
                      'Expert teachers'
                    )}
                    {renderComingSoonCard(
                      'Animated Concepts',
                      'Visual animations to understand complex topics.',
                      '🎬',
                      '[#2979FF]',
                      'Interactive content'
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="practice" className="space-y-6">
                {otherMaterials.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {otherMaterials.map(material => 
                      renderMaterialCard(material, '📝', '[#FFA726]')
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderComingSoonCard(
                      'Practice Questions',
                      'Solve practice questions to test your understanding.',
                      '📝',
                      '[#FFA726]',
                      'Multiple difficulty levels'
                    )}
                    {renderComingSoonCard(
                      'Worksheets',
                      'Downloadable worksheets for offline practice.',
                      '📋',
                      '[#FFA726]',
                      'Printable resources'
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="quiz" className="space-y-6">
                {linkMaterials.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {linkMaterials.map(material => 
                      renderMaterialCard(material, '🏆', '[#E91E63]')
                    )}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderComingSoonCard(
                      'Chapter Quiz',
                      'Take a quiz to evaluate your knowledge of this chapter.',
                      '🏆',
                      '[#E91E63]',
                      '20 min quiz'
                    )}
                    {renderComingSoonCard(
                      'Assessment Test',
                      'Comprehensive assessment for the entire chapter.',
                      '📊',
                      '[#E91E63]',
                      'Detailed analysis'
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
