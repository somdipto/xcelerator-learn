
import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubjectCard from './SubjectCard';
import ChapterStudyMaterial from './ChapterStudyMaterial';
import { dataService, Subject } from '@/services/dataService';
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

  useEffect(() => {
    loadSubjects();
  }, [selectedGrade]);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      // Create fallback subjects immediately for faster UI
      const fallbackSubjects = createFallbackSubjects();
      setSubjects(fallbackSubjects);
      setIsLoading(false);

      // Then try to load from Supabase in background
      const { data: supabaseSubjects, error } = await dataService.getSubjects(selectedGrade);
      
      if (!error && supabaseSubjects?.length) {
        // Merge with local data efficiently
        const mergedSubjects = fallbackSubjects.map(fallback => {
          const existing = supabaseSubjects.find(s => s.name === fallback.name);
          return existing ? { ...fallback, ...existing } : fallback;
        });
        
        // Add any additional Supabase subjects
        supabaseSubjects.forEach(supabaseSubject => {
          if (!fallbackSubjects.find(f => f.name === supabaseSubject.name)) {
            mergedSubjects.push(supabaseSubject);
          }
        });
        
        setSubjects(mergedSubjects);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
      // Already showing fallback, no need to toast
    }
  };

  const createFallbackSubjects = (): Subject[] => {
    return Object.entries(subjectsData).map(([subjectName, subjectInfo]) => ({
      id: `local-${subjectName}`,
      name: subjectName,
      description: `${subjectName} for Class ${selectedGrade}`,
      grade: selectedGrade,
      icon: subjectInfo.icon,
      color: '#2979FF',
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
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
    }
  };

  const handleRefresh = () => {
    loadSubjects();
    toast({
      title: "Content Refreshed",
      description: "Checking for latest updates",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-[#E0E0E0] to-[#00E676] bg-clip-text text-transparent leading-tight">
                Class {selectedGrade} Subjects
              </h1>
            </div>
            <div className="flex gap-2 self-center sm:self-auto">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white transition-all duration-200"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleClassChange}
                variant="outline"
                className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all duration-200 h-10 px-4"
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Class
              </Button>
            </div>
          </div>
          
          <p className="text-[#CCCCCC] text-base sm:text-lg text-center sm:text-left leading-relaxed max-w-2xl mx-auto sm:mx-0">
            Choose a subject and explore its chapters.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
            <p className="text-[#E0E0E0]">Loading subjects...</p>
          </div>
        ) : (
          /* Subjects Grid */
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
