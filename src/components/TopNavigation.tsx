
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Settings } from 'lucide-react';
import SubjectsDropdown from './SubjectsDropdown';

interface TopNavigationProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
}

const TopNavigation = ({ selectedGrade, onChapterSelect }: TopNavigationProps) => {
  return (
    <nav className="bg-[#1A1A1A] border-b border-[#2C2C2C] p-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#00E676] to-[#2979FF] rounded-lg p-2">
            <span className="text-black font-bold text-xl">X</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Xcelerator</h1>
            <p className="text-xs text-[#E0E0E0]">Class {selectedGrade} Learning</p>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <SubjectsDropdown 
            selectedGrade={selectedGrade} 
            onChapterSelect={onChapterSelect}
          />
          <Button 
            variant="ghost" 
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10"
          >
            Live Classes
          </Button>
          <Button 
            variant="ghost" 
            className="text-white hover:text-[#2979FF] hover:bg-[#2979FF]/10"
          >
            Practice Tests
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:text-[#00E676] hover:bg-[#00E676]/10"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:text-[#00E676] hover:bg-[#00E676]/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8 border-2 border-[#00E676]">
            <AvatarFallback className="bg-[#00E676] text-black font-semibold">
              S
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </nav>
  );
};

export default TopNavigation;
