
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SubjectCard from './SubjectCard';
import ChapterStudyMaterial from './ChapterStudyMaterial';
import { subjects, SubjectName } from '@/data/subjects';
import { toast } from '@/hooks/use-toast';

interface SubjectsPageProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
  onClassChange?: () => void;
}

const SubjectsPage = ({ selectedGrade, onChapterSelect, onClassChange }: SubjectsPageProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

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
        subject={selectedSubject as SubjectName}
        chapter={selectedChapter}
        selectedGrade={selectedGrade}
        onBack={handleBackToSubjects}
      />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Object.entries(subjects).map(([subject, data]) => (
            <div key={subject} className="w-full">
              <SubjectCard
                subject={subject as SubjectName}
                data={data}
                selectedGrade={selectedGrade}
                onSubjectSelect={setSelectedSubject}
                onChapterSelect={handleChapterClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
