
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

interface SubjectsDropdownProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const SubjectsDropdown = ({ selectedGrade, onChapterSelect }: SubjectsDropdownProps) => {
  const [openSubject, setOpenSubject] = useState<string | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-white hover:text-[#00E676] hover:bg-[#00E676]/10 flex items-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Subjects
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 bg-[#1A1A1A] border-[#2C2C2C] z-50"
      >
        <div className="p-2 border-b border-[#2C2C2C]">
          <p className="text-[#E0E0E0] text-sm font-medium">
            Class {selectedGrade} Subjects
          </p>
        </div>
        
        {Object.entries(subjects).map(([subject, data]) => {
          const gradeChapters = data.chapters[selectedGrade as keyof typeof data.chapters] || [];
          
          return (
            <DropdownMenuSub key={subject}>
              <DropdownMenuSubTrigger className="text-white hover:bg-[#00E676]/10 hover:text-[#00E676] flex items-center gap-2">
                <span className="text-lg">{data.icon}</span>
                {subject}
                <ChevronRight className="h-4 w-4 ml-auto" />
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className="bg-[#1A1A1A] border-[#2C2C2C] w-56"
              >
                <div className="p-2 border-b border-[#2C2C2C]">
                  <p className="text-[#00E676] text-sm font-medium flex items-center gap-2">
                    <span>{data.icon}</span>
                    {subject} Chapters
                  </p>
                </div>
                {gradeChapters.map((chapter, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => onChapterSelect(subject, chapter)}
                    className="text-[#E0E0E0] hover:bg-[#2979FF]/10 hover:text-[#2979FF] cursor-pointer flex items-center gap-2 py-3"
                  >
                    <Play className="h-3 w-3" />
                    <span className="flex-1">{chapter}</span>
                    <span className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded">
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
