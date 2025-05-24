
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SubjectsPageProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const SubjectsPage = ({ selectedGrade, onChapterSelect }: SubjectsPageProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const subjects = {
    'Mathematics': {
      icon: '🧮',
      chapters: [
        'Number Systems',
        'Algebra',
        'Geometry',
        'Trigonometry',
        'Statistics',
        'Probability'
      ]
    },
    'Science': {
      icon: '🔬',
      chapters: [
        'Physics - Motion',
        'Physics - Energy',
        'Chemistry - Atoms',
        'Biology - Life Processes',
        'Environmental Science'
      ]
    },
    'Social Science': {
      icon: '🌍',
      chapters: [
        'History - Ancient India',
        'Geography - Resources',
        'Civics - Democracy',
        'Economics - Development'
      ]
    },
    'English': {
      icon: '📖',
      chapters: [
        'Grammar',
        'Literature',
        'Writing Skills',
        'Poetry',
        'Comprehension'
      ]
    },
    'Hindi': {
      icon: '🇮🇳',
      chapters: [
        'व्याकरण',
        'साहित्य',
        'लेखन कौशल',
        'कविता'
      ]
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

  // If a chapter is selected, show study material
  if (selectedChapter && selectedSubject) {
    return (
      <div className="p-6 min-h-screen bg-[#121212]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToSubjects}
              className="text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </div>
          
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <span className="text-2xl">{subjects[selectedSubject as keyof typeof subjects]?.icon}</span>
                <div>
                  <h1 className="text-2xl">{selectedSubject} - {selectedChapter}</h1>
                  <p className="text-[#E0E0E0] text-sm font-normal">Class {selectedGrade} Study Material</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#2C2C2C] border-[#424242]">
                  <CardHeader>
                    <CardTitle className="text-[#00E676] text-lg">📚 Theory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Comprehensive theory notes and explanations for {selectedChapter}.
                    </p>
                    <Button className="w-full bg-[#00E676] hover:bg-[#00E676]/80 text-black">
                      Read Theory
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C] border-[#424242]">
                  <CardHeader>
                    <CardTitle className="text-[#2979FF] text-lg">🎥 Video Lessons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Interactive video lessons with detailed explanations.
                    </p>
                    <Button className="w-full bg-[#2979FF] hover:bg-[#2979FF]/80 text-white">
                      Watch Videos
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C] border-[#424242]">
                  <CardHeader>
                    <CardTitle className="text-[#00E676] text-lg">📝 Practice Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Solve practice questions to test your understanding.
                    </p>
                    <Button className="w-full bg-[#00E676] hover:bg-[#00E676]/80 text-black">
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C] border-[#424242]">
                  <CardHeader>
                    <CardTitle className="text-[#2979FF] text-lg">🏆 Quiz</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Take a quiz to evaluate your knowledge of this chapter.
                    </p>
                    <Button className="w-full bg-[#2979FF] hover:bg-[#2979FF]/80 text-white">
                      Take Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#121212]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Class {selectedGrade} Subjects</h1>
          <p className="text-[#E0E0E0]">
            Choose a subject and explore its chapters to start learning
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(subjects).map(([subject, data]) => (
            <Card key={subject} className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-3">
                  <span className="text-2xl">{data.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl">{subject}</h3>
                    <p className="text-[#E0E0E0] text-sm font-normal">
                      {data.chapters.length} chapters available
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={subject} className="border-[#2C2C2C]">
                    <AccordionTrigger className="text-[#00E676] hover:text-[#00E676]/80 font-medium">
                      View All Chapters
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-2 mt-4">
                        {data.chapters.map((chapter, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            onClick={() => {
                              setSelectedSubject(subject);
                              handleChapterClick(subject, chapter);
                            }}
                            className="justify-start text-[#E0E0E0] hover:bg-[#2979FF]/10 hover:text-[#2979FF] p-3 h-auto"
                          >
                            <Play className="h-4 w-4 mr-3" />
                            <div className="flex-1 text-left">
                              <span className="block">{chapter}</span>
                              <span className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded mt-1 inline-block">
                                Ch.{index + 1}
                              </span>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
