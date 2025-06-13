
import React, { useState } from 'react';
import { Play, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SubjectName, SubjectData } from '@/data/subjects';

interface SubjectCardProps {
  subject: SubjectName;
  data: SubjectData;
  selectedGrade: number;
  onSubjectSelect: (subject: string) => void;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const SubjectCard = ({ subject, data, selectedGrade, onSubjectSelect, onChapterSelect }: SubjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const gradeChapters = data.chapters[selectedGrade as keyof typeof data.chapters] || [];

  const handleStartLearning = () => {
    setIsExpanded(!isExpanded);
  };

  const handleShowMoreChapters = () => {
    setShowAllChapters(true);
  };

  return (
    <Card className="bg-[#1A1A1A]/90 backdrop-blur-md border-[#2C2C2C] hover:border-[#00E676]/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#00E676]/5 group cursor-pointer">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 sm:p-4 rounded-xl bg-gradient-to-r ${data.gradient} shadow-lg group-hover:scale-105 transition-transform duration-300`}>
              <span className="text-2xl sm:text-3xl">{data.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-[#E0E0E0] bg-clip-text text-transparent truncate">
                {subject}
              </h3>
              <p className="text-[#999999] text-sm font-normal mt-1">
                {gradeChapters.length} chapters
              </p>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="px-4 sm:px-6 pb-4">
        <div className="space-y-4">
          {/* Features Grid - Mobile Optimized */}
          <div className="grid grid-cols-3 gap-2 py-3 bg-[#2C2C2C]/30 rounded-lg">
            <div className="text-center py-2">
              <div className="text-[#00E676] text-lg mb-1">📚</div>
              <div className="text-xs text-[#999999] font-medium">Theory</div>
            </div>
            <div className="text-center py-2">
              <div className="text-[#2979FF] text-lg mb-1">🎥</div>
              <div className="text-xs text-[#999999] font-medium">Videos</div>
            </div>
            <div className="text-center py-2">
              <div className="text-[#00E676] text-lg mb-1">🏆</div>
              <div className="text-xs text-[#999999] font-medium">Quizzes</div>
            </div>
          </div>

          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                onClick={handleStartLearning}
                className="w-full h-12 bg-gradient-to-r from-[#00E676] to-[#2979FF] hover:from-[#00E676]/90 hover:to-[#2979FF]/90 text-black font-semibold transition-all duration-300 text-base touch-manipulation"
              >
                <Play className="h-5 w-5 mr-2" />
                {isExpanded ? 'Hide Chapters' : 'Start Learning'}
                {isExpanded ? <ChevronUp className="h-5 w-5 ml-2" /> : <ChevronDown className="h-5 w-5 ml-2" />}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-4">
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                <div className="text-sm text-[#E0E0E0] font-semibold mb-3 px-1">
                  All Chapters ({gradeChapters.length})
                </div>
                {gradeChapters.length > 0 ? (
                  gradeChapters.map((chapter, index) => (
                    <button 
                      key={index}
                      onClick={() => onChapterSelect(subject, chapter)}
                      className="w-full text-left text-sm text-[#CCCCCC] hover:text-[#00E676] cursor-pointer transition-all duration-200 flex items-center gap-3 p-3 rounded-lg hover:bg-[#2C2C2C]/50 active:bg-[#2C2C2C]/70 touch-manipulation"
                    >
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 leading-relaxed">{chapter}</span>
                      <span className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded-full font-medium flex-shrink-0">
                        {index + 1}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4 text-[#666666]">
                    No chapters available for Class {selectedGrade}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {!isExpanded && gradeChapters.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-[#E0E0E0] font-semibold mb-2 px-1">Preview</div>
              {gradeChapters.slice(0, showAllChapters ? gradeChapters.length : 2).map((chapter, index) => (
                <button 
                  key={index}
                  onClick={() => onChapterSelect(subject, chapter)}
                  className="w-full text-left text-sm text-[#CCCCCC] hover:text-[#00E676] cursor-pointer transition-all duration-200 flex items-center gap-3 p-3 rounded-lg hover:bg-[#2C2C2C]/50 active:bg-[#2C2C2C]/70 touch-manipulation"
                >
                  <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 leading-relaxed truncate">{chapter}</span>
                </button>
              ))}
              {gradeChapters.length > 2 && !showAllChapters && (
                <button
                  onClick={handleShowMoreChapters}
                  className="w-full text-sm text-[#2979FF] text-center py-2 font-medium hover:text-[#00E676] transition-colors duration-200 cursor-pointer"
                >
                  +{gradeChapters.length - 2} more chapters
                </button>
              )}
            </div>
          )}

          {!isExpanded && gradeChapters.length === 0 && (
            <div className="text-center py-4 text-[#666666]">
              No chapters available for Class {selectedGrade}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;
