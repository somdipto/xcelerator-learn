

import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TopNavigationProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const TopNavigation = ({ selectedGrade }: TopNavigationProps) => {
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

  return (
    <nav className="bg-[#1A1A1A] border-b border-[#2C2C2C] p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Text Logo */}
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold">
            <span className="text-[#00E676]">Xcel</span>
            <span className="text-white">erator</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-[#E0E0E0] bg-[#2C2C2C] px-2 py-1 rounded-full">
              Class {selectedGrade}
            </p>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleLiveClasses}
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10 transition-all duration-200"
          >
            <Video className="h-4 w-4 mr-2" />
            Live Classes
          </Button>
          <Button 
            variant="ghost" 
            onClick={handlePracticeTests}
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10 transition-all duration-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Practice Tests
          </Button>
        </div>

        {/* Right Actions - Only Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="h-9 w-9 border-2 border-[#00E676] cursor-pointer hover:border-[#2979FF] transition-colors duration-200">
            <AvatarFallback className="bg-gradient-to-r from-[#00E676] to-[#2979FF] text-black font-bold">
              S
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
