
import React from 'react';
import { ArrowLeft, Clock, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { subjects, SubjectName } from '@/data/subjects';

interface ChapterStudyMaterialProps {
  subject: SubjectName;
  chapter: string;
  selectedGrade: number;
  onBack: () => void;
}

const ChapterStudyMaterial = ({ subject, chapter, selectedGrade, onBack }: ChapterStudyMaterialProps) => {
  const subjectData = subjects[subject];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/10 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
        </div>
        
        <Card className="bg-[#1A1A1A]/80 backdrop-blur-md border-[#2C2C2C] shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${subjectData.gradient}`}>
                <span className="text-2xl">{subjectData.icon}</span>
              </div>
              <div>
                <h1 className="text-2xl bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent">
                  {subject} - {chapter}
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
                    Comprehensive theory notes and explanations for {chapter}.
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
};

export default ChapterStudyMaterial;
