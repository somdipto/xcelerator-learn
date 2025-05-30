
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Play, BookOpen, ArrowLeft, Clock, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      gradient: 'from-blue-500 to-purple-600',
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
      gradient: 'from-green-500 to-emerald-600',
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
      gradient: 'from-orange-500 to-red-600',
      chapters: [
        'History - Ancient India',
        'Geography - Resources',
        'Civics - Democracy',
        'Economics - Development'
      ]
    },
    'English': {
      icon: '📖',
      gradient: 'from-pink-500 to-rose-600',
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
      gradient: 'from-amber-500 to-yellow-600',
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
      <div className="p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToSubjects}
              className="text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/10 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Subjects
            </Button>
          </div>
          
          <Card className="bg-[#1A1A1A]/80 backdrop-blur-md border-[#2C2C2C] shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${subjects[selectedSubject as keyof typeof subjects]?.gradient}`}>
                  <span className="text-2xl">{subjects[selectedSubject as keyof typeof subjects]?.icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">
                    {selectedSubject} - {selectedChapter}
                  </h1>
                  <p className="text-[#E0E0E0] text-sm font-normal">Class {selectedGrade} Study Material</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="text-[#00E676] text-lg flex items-center gap-2">
                      📚 Theory
                      <Badge variant="secondary" className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30">
                        New
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Comprehensive theory notes and explanations for {selectedChapter}.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
                      <Clock className="h-3 w-3" />
                      <span>15 min read</span>
                    </div>
                    <Button className="w-full bg-[#00E676] hover:bg-[#00E676]/80 text-black font-medium transition-all duration-200 group-hover:scale-105">
                      Read Theory
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="text-[#2979FF] text-lg flex items-center gap-2">
                      🎥 Video Lessons
                      <Badge variant="secondary" className="bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/30">
                        HD
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Interactive video lessons with detailed explanations.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
                      <Users className="h-3 w-3" />
                      <span>Expert teachers</span>
                    </div>
                    <Button className="w-full bg-[#2979FF] hover:bg-[#2979FF]/80 text-white font-medium transition-all duration-200 group-hover:scale-105">
                      Watch Videos
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="text-[#00E676] text-lg flex items-center gap-2">
                      📝 Practice Questions
                      <Badge variant="secondary" className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30">
                        50+
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Solve practice questions to test your understanding.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
                      <Trophy className="h-3 w-3" />
                      <span>Difficulty levels</span>
                    </div>
                    <Button className="w-full bg-[#00E676] hover:bg-[#00E676]/80 text-black font-medium transition-all duration-200 group-hover:scale-105">
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C]/50 backdrop-blur-sm border-[#424242] hover:bg-[#2C2C2C]/70 transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="text-[#2979FF] text-lg flex items-center gap-2">
                      🏆 Quiz
                      <Badge variant="secondary" className="bg-[#2979FF]/20 text-[#2979FF] border-[#2979FF]/30">
                        Timed
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] mb-4">
                      Take a quiz to evaluate your knowledge of this chapter.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#666666] mb-4">
                      <Clock className="h-3 w-3" />
                      <span>20 min quiz</span>
                    </div>
                    <Button className="w-full bg-[#2979FF] hover:bg-[#2979FF]/80 text-white font-medium transition-all duration-200 group-hover:scale-105">
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
            <Card 
              key={subject} 
              className="bg-[#1A1A1A]/80 backdrop-blur-md border-[#2C2C2C] hover:border-[#00E676]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00E676]/10 group cursor-pointer"
            >
              <CardHeader className="pb-4">
                <CardTitle className="text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${data.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{data.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">
                        {subject}
                      </h3>
                      <p className="text-[#666666] text-sm font-normal mt-1">
                        {data.chapters.length} chapters • Interactive learning
                      </p>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#E0E0E0]">Progress</span>
                    <span className="text-[#00E676]">0% Complete</span>
                  </div>
                  <div className="w-full bg-[#2C2C2C] rounded-full h-2">
                    <div className="bg-gradient-to-r from-[#00E676] to-[#2979FF] h-2 rounded-full w-0 transition-all duration-500"></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center">
                      <div className="text-[#00E676] font-bold text-lg">📚</div>
                      <div className="text-xs text-[#666666]">Theory</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#2979FF] font-bold text-lg">🎥</div>
                      <div className="text-xs text-[#666666]">Videos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[#00E676] font-bold text-lg">🏆</div>
                      <div className="text-xs text-[#666666]">Quizzes</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      setSelectedSubject(subject);
                      // Show chapters in an expanded view
                    }}
                    className="w-full mt-4 bg-gradient-to-r from-[#00E676] to-[#2979FF] hover:from-[#00E676]/90 hover:to-[#2979FF]/90 text-black font-medium transition-all duration-300 group-hover:shadow-lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </Button>

                  {/* Chapter preview */}
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-[#E0E0E0] font-medium">Quick Preview:</div>
                    {data.chapters.slice(0, 3).map((chapter, index) => (
                      <div 
                        key={index}
                        onClick={() => handleChapterClick(subject, chapter)}
                        className="text-xs text-[#666666] hover:text-[#00E676] cursor-pointer transition-colors duration-200 flex items-center gap-2 p-2 rounded-lg hover:bg-[#2C2C2C]/50"
                      >
                        <ChevronRight className="h-3 w-3" />
                        {chapter}
                      </div>
                    ))}
                    {data.chapters.length > 3 && (
                      <div className="text-xs text-[#2979FF] text-center">
                        +{data.chapters.length - 3} more chapters
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubjectsPage;
