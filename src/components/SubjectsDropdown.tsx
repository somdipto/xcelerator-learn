
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { subjects } from '@/data/subjects';
import { useIsMobile } from '@/hooks/use-mobile';

interface SubjectsDropdownProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const SubjectsDropdown = ({ selectedGrade, onChapterSelect }: SubjectsDropdownProps) => {
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const isMobile = useIsMobile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white hover:text-[#00E676] hover:bg-[#00E676]/10 flex items-center gap-2 text-sm md:text-base"
        >
          <BookOpen className="h-4 w-4" />
          <span className={isMobile ? 'hidden sm:inline' : ''}>Subjects</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className={`${isMobile ? 'w-72' : 'w-64'} bg-[#1A1A1A] border-[#2C2C2C] z-50 max-h-[80vh] overflow-y-auto`}
      >
        <div className="p-3 border-b border-[#2C2C2C]">
          <p className="text-[#E0E0E0] text-sm font-medium">
            Class {selectedGrade} Subjects
          </p>
        </div>
        
        {Object.entries(subjects).map(([subject, data]) => {
          const gradeChapters = data.chapters[selectedGrade as keyof typeof data.chapters] || [];
          
          if (gradeChapters.length === 0) {
            return null;
          }
          
          return (
            <DropdownMenuSub key={subject}>
              <DropdownMenuSubTrigger className="text-white hover:bg-[#00E676]/10 hover:text-[#00E676] flex items-center gap-2 p-3">
                <span className="text-lg">{data.icon}</span>
                <span className="flex-1 text-left">{subject}</span>
                <ChevronRight className="h-4 w-4" />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className={`bg-[#1A1A1A] border-[#2C2C2C] ${isMobile ? 'w-80' : 'w-72'} max-h-[60vh] overflow-y-auto`}
              >
                <div className="p-3 border-b border-[#2C2C2C] sticky top-0 bg-[#1A1A1A]">
                  <p className="text-[#00E676] text-sm font-medium flex items-center gap-2">
                    <span>{data.icon}</span>
                    {subject} - {gradeChapters.length} Chapters
                  </p>
                </div>
                {gradeChapters.map((chapter, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => onChapterSelect(subject, chapter)}
                    className="text-[#E0E0E0] hover:bg-[#2979FF]/10 hover:text-[#2979FF] cursor-pointer flex items-center gap-2 p-3 border-b border-[#2C2C2C]/50 last:border-b-0"
                  >
                    <Play className="h-3 w-3 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm leading-relaxed">{chapter}</span>
                    <span className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded flex-shrink-0">
                      Ch.{index + 1}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubjectsDropdown;
