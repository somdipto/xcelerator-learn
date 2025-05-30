
import React, { useState } from 'react';
import SubjectCard from './SubjectCard';
import ChapterStudyMaterial from './ChapterStudyMaterial';
import { subjects, SubjectName } from '@/data/subjects';

interface SubjectsPageProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const SubjectsPage = ({ selectedGrade, onChapterSelect }: SubjectsPageProps) => {
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#E0E0E0] to-[#00E676] bg-clip-text text-transparent mb-4">
            Class {selectedGrade} Subjects
          </h1>
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
