
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#E0E0E0] to-[#00E676] bg-clip-text text-transparent">
              Class {selectedGrade} Subjects
            </h1>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={handleClassChange}
                variant="outline"
                className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Change Class
              </Button>
            </div>
          </div>
          <p className="text-[#E0E0E0] text-lg max-w-2xl mx-auto">
            Choose a subject and explore its chapters to start your personalized learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(subjects).map(([subject, data]) => (
            <SubjectCard
              key={subject}
              subject={subject as SubjectName}
              data={data}
              selectedGrade={selectedGrade}
              onSubjectSelect={setSelectedSubject}
              onChapterSelect={handleChapterClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
