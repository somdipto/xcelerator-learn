
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Video, Book, GraduationCap, Menu, Trophy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopNavigationProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
  onClassChange?: () => void;
}

const TopNavigation = ({
  selectedGrade,
  onClassChange
}: TopNavigationProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLiveClasses = () => {
    toast({
      title: "Live Classes",
      description: "No live classes scheduled for today. Check back later!"
    });
  };

  const handlePracticeTests = () => {
    toast({
      title: "Practice Tests",
      description: "Opening practice test section..."
    });
  };

  const handleClassClick = () => {
    if (onClassChange) {
      onClassChange();
    }
  };

  return (
    <nav className="bg-[#1A1A1A]/95 backdrop-blur-lg border-b border-[#2C2C2C] p-3 md:p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1 md:gap-2">
            <div className="text-lg md:text-xl lg:text-2xl font-bold">
              <span className="text-[#00E676]">Xcel</span>
              <span className="text-white">erator</span>
            </div>
          </div>
          <button 
            onClick={handleClassClick} 
            className="text-xs text-[#CCCCCC] bg-[#2C2C2C] px-2 md:px-3 py-1 md:py-1.5 rounded-full hover:bg-[#00E676] hover:text-black transition-colors cursor-pointer touch-manipulation"
          >
            Class {selectedGrade}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleLiveClasses}
            variant="ghost"
            size="sm"
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10"
          >
            <Video className="h-4 w-4 mr-2" />
            {!isMobile && "Live Classes"}
          </Button>
          
          <Button
            onClick={handlePracticeTests}
            variant="ghost"
            size="sm"
            className="text-white hover:text-[#FFA726] hover:bg-[#FFA726]/10"
          >
            <Trophy className="h-4 w-4 mr-2" />
            {!isMobile && "Practice Tests"}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
