
import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubjectCard from './SubjectCard';
import ChapterStudyMaterial from './ChapterStudyMaterial';
import { supabaseService, Subject } from '@/services/supabaseService';
import { subjects as subjectsData } from '@/data/subjects';
import { toast } from '@/hooks/use-toast';

interface SubjectsPageProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
  onClassChange?: () => void;
}

const SubjectsPage = ({ selectedGrade, onChapterSelect, onClassChange }: SubjectsPageProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    loadSubjects();
    
    // Subscribe to real-time updates from teacher content management
    const channel = supabaseService.subscribeToStudyMaterials((payload) => {
      console.log('New content from teachers detected:', payload);
      setLastSyncTime(new Date());
      // Optionally reload subjects if new materials affect subject availability
      if (payload.eventType === 'INSERT') {
        toast({
          title: "New Content Available",
          description: "New study materials have been added by teachers",
        });
      }
    }, 'subjects-page');

    return () => {
      supabaseService.removeChannel(channel);
    };
  }, [selectedGrade]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      // Load subjects from Supabase
      const { data: supabaseSubjects, error } = await supabaseService.getSubjects(selectedGrade);
      if (error) {
        console.error('Error loading subjects from Supabase:', error);
      }

      // Load study materials count for each subject
      const { data: studyMaterials } = await supabaseService.getStudyMaterials({
        grade: selectedGrade
      });

      // Merge Supabase subjects with local subjects data
      const mergedSubjects: Subject[] = [];
      
      // Add subjects from local data with their chapters
      Object.entries(subjectsData).forEach(([subjectName, subjectInfo]) => {
        const existingSupabaseSubject = supabaseSubjects?.find(s => s.name === subjectName);
        
        // Count available study materials for this subject
        const materialCount = studyMaterials?.filter(material => {
          const materialTitle = material.title.toLowerCase();
          return materialTitle.includes(subjectName.toLowerCase()) || 
                 material.subject_id === subjectName;
        }).length || 0;
        
        mergedSubjects.push({
          id: existingSupabaseSubject?.id || `local-${subjectName}`,
          name: subjectName,
          description: existingSupabaseSubject?.description || 
                      `${subjectName} for Class ${selectedGrade} (${materialCount} materials available)`,
          grade: selectedGrade,
          icon: subjectInfo.icon,
          color: existingSupabaseSubject?.color || '#2979FF',
          created_by: existingSupabaseSubject?.created_by,
          created_at: existingSupabaseSubject?.created_at || new Date().toISOString(),
          updated_at: existingSupabaseSubject?.updated_at || new Date().toISOString()
        });
      });

      // Add any additional Supabase subjects that aren't in local data
      supabaseSubjects?.forEach(supabaseSubject => {
        if (!Object.keys(subjectsData).includes(supabaseSubject.name)) {
          mergedSubjects.push(supabaseSubject);
        }
      });

      setSubjects(mergedSubjects);
      console.log('Subjects loaded with study material counts:', mergedSubjects);
    } catch (error) {
      console.error('Failed to load subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChapterClick = (subject: string, chapter: string) => {
    setSelectedSubject(subject);
    setSelectedChapter(chapter);
    onChapterSelect(subject, chapter);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const handleClassChange = () => {
    if (onClassChange) {
      onClassChange();
      toast({
        title: "Change Class",
        description: "Select your new class to continue learning",
      });
    }
  };

  const handleRefresh = () => {
    loadSubjects();
    toast({
      title: "Content Refreshed",
      description: "Checking for latest updates from teachers",
    });
  };

  // If a chapter is selected, show study material
  if (selectedChapter && selectedSubject) {
    return (
      <ChapterStudyMaterial
        subject={selectedSubject as any}
        chapter={selectedChapter}
        selectedGrade={selectedGrade}
        onBack={handleBackToSubjects}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] px-4 sm:px-6 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading subjects and latest content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-[#E0E0E0] to-[#00E676] bg-clip-text text-transparent leading-tight">
                Class {selectedGrade} Subjects
              </h1>
              <p className="text-sm text-[#999999] mt-2">
                Last updated: {lastSyncTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-2 self-center sm:self-auto">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleClassChange}
                variant="outline"
                className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all duration-200 h-10 px-4 touch-manipulation"
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Class
              </Button>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-[#CCCCCC] text-base sm:text-lg text-center sm:text-left leading-relaxed max-w-2xl mx-auto sm:mx-0">
            Choose a subject and explore its chapters. All content is synchronized in real-time with teacher uploads.
          </p>
        </div>

        {/* Real-time Sync Indicator */}
        <div className="mb-6 p-4 bg-[#2C2C2C]/30 rounded-lg border border-[#424242]">
          <div className="flex items-center justify-center gap-2 text-[#00E676]">
            <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse"></div>
            <span className="text-sm">Live sync with teacher content - updates automatically</span>
          </div>
        </div>

        {/* Subjects Grid - Mobile Responsive */}
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl text-[#E0E0E0] mb-2">No subjects available yet</h3>
            <p className="text-[#666666]">Subjects for Class {selectedGrade} will be added by teachers soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((subject) => {
              const subjectData = subjectsData[subject.name as keyof typeof subjectsData];
              const displayData = subjectData || {
                icon: subject.icon || '📚',
                gradient: `from-[${subject.color || '#2979FF'}] to-[${subject.color || '#2979FF'}]/70`,
                chapters: {
                  8: [],
                  9: [],
                  10: []
                }
              };

              return (
                <div key={subject.id} className="w-full">
                  <SubjectCard
                    subject={subject.name as any}
                    data={displayData}
                    selectedGrade={selectedGrade}
                    onSubjectSelect={setSelectedSubject}
                    onChapterSelect={handleChapterClick}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;
