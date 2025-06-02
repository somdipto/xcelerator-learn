
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TopNavigationProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
  onClassChange?: () => void;
}

const TopNavigation = ({ selectedGrade, onClassChange }: TopNavigationProps) => {
  const handleLiveClasses = () => {
    toast({
      title: "Live Classes",
      description: "No live classes scheduled for today. Check back later!",
    });
  };

  const handlePracticeTests = () => {
    toast({
      title: "Practice Tests",
      description: "Opening practice test section...",
    });
  };

  const handleClassClick = () => {
    if (onClassChange) {
      onClassChange();
    }
  };

  return (
    <nav className="bg-[#1A1A1A]/95 backdrop-blur-lg border-b border-[#2C2C2C] p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="text-xl sm:text-2xl font-bold">
            <span className="text-[#00E676]">Xcel</span>
            <span className="text-white">erator</span>
          </div>
          <button 
            onClick={handleClassClick}
            className="text-xs text-[#CCCCCC] bg-[#2C2C2C] px-3 py-1.5 rounded-full hover:bg-[#00E676] hover:text-black transition-colors cursor-pointer touch-manipulation"
          >
            Class {selectedGrade}
          </button>
        </div>

        {/* Center Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleLiveClasses}
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10 transition-all duration-200 touch-manipulation"
          >
            <Video className="h-4 w-4 mr-2" />
            Live Classes
          </Button>
          <Button 
            variant="ghost" 
            onClick={handlePracticeTests}
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10 transition-all duration-200 touch-manipulation"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Practice Tests
          </Button>
        </div>

        {/* Avatar */}
        <div className="flex items-center">
          <Avatar className="h-9 w-9 border-2 border-[#00E676] cursor-pointer hover:border-[#2979FF] transition-colors duration-200 touch-manipulation">
            <AvatarFallback className="bg-gradient-to-r from-[#00E676] to-[#2979FF] text-black font-bold text-sm">
              S
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
