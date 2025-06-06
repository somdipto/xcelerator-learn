
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubjectCard from './SubjectCard';
import ChapterStudyMaterial from './ChapterStudyMaterial';
import { supabaseService, Subject } from '@/services/supabaseService';
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
      const { data, error } = await supabaseService.getSubjects(selectedGrade);
      if (error) {
        console.error('Error loading subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load subjects",
          variant: "destructive",
        });
        return;
      }
      setSubjects(data || []);
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
          <p className="text-[#E0E0E0]">Loading subjects...</p>
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
            </div>
            <Button
              onClick={handleClassChange}
              variant="outline"
              className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all duration-200 h-10 px-4 touch-manipulation self-center sm:self-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Change Class
            </Button>
          </div>
          
          {/* Description */}
          <p className="text-[#CCCCCC] text-base sm:text-lg text-center sm:text-left leading-relaxed max-w-2xl mx-auto sm:mx-0">
            Choose a subject and explore its chapters to start your personalized learning journey
          </p>
        </div>

        {/* Subjects Grid - Mobile Responsive */}
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl text-[#E0E0E0] mb-2">No subjects available yet</h3>
            <p className="text-[#666666]">Subjects for Class {selectedGrade} will be added soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="w-full">
                <SubjectCard
                  subject={subject.name as any}
                  data={{
                    icon: subject.icon || '📚',
                    gradient: `from-[${subject.color || '#2979FF'}] to-[${subject.color || '#2979FF'}]/70`,
                    chapters: {
                      8: [],
                      9: [],
                      10: []
                    }
                  }}
                  selectedGrade={selectedGrade}
                  onSubjectSelect={setSelectedSubject}
                  onChapterSelect={handleChapterClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectsPage;
