
import React from 'react';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SubjectName, SubjectData } from '@/data/subjects';

interface SubjectCardProps {
  subject: SubjectName;
  data: SubjectData;
  onSubjectSelect: (subject: string) => void;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const SubjectCard = ({ subject, data, onSubjectSelect, onChapterSelect }: SubjectCardProps) => {
  return (
    <Card className="bg-[#1A1A1A]/80 backdrop-blur-md border-[#2C2C2C] hover:border-[#00E676]/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00E676]/10 group cursor-pointer">
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
            onClick={() => onSubjectSelect(subject)}
            className="w-full mt-4 bg-gradient-to-r from-[#00E676] to-[#2979FF] hover:from-[#00E676]/90 hover:to-[#2979FF]/90 text-black font-medium transition-all duration-300 group-hover:shadow-lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Learning
          </Button>

          <div className="mt-4 space-y-2">
            <div className="text-sm text-[#E0E0E0] font-medium">Quick Preview:</div>
            {data.chapters.slice(0, 3).map((chapter, index) => (
              <div 
                key={index}
                onClick={() => onChapterSelect(subject, chapter)}
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
  );
};

export default SubjectCard;
