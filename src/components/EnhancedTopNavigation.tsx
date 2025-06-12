
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Video, Book, GraduationCap, Search, Bell, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EnhancedTopNavigationProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
  onClassChange?: () => void;
  onSearch?: (query: string) => void;
}

const EnhancedTopNavigation = ({
  selectedGrade,
  onClassChange,
  onSearch
}: EnhancedTopNavigationProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

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

  const handleTeacherLogin = () => {
    navigate('/teacher-login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <nav className="bg-[#1A1A1A]/95 backdrop-blur-lg border-b border-[#2C2C2C] p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section with Back Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/10"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-[#00E676]">Xcel</span>
              <span className="text-white">erator</span>
            </div>
          </div>
          
          <button 
            onClick={handleClassClick} 
            className="text-xs text-[#CCCCCC] bg-[#2C2C2C] px-3 py-1.5 rounded-full hover:bg-[#00E676] hover:text-black transition-colors cursor-pointer touch-manipulation"
          >
            Class {selectedGrade}
          </button>
        </div>

        {/* Center Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
              <Input
                type="text"
                placeholder="Search subjects, chapters, materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
              />
            </div>
          </form>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-[#00E676] hover:bg-[#00E676]/10 relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#FF7043] rounded-full text-xs"></span>
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
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
            <Button
              variant="ghost"
              onClick={handleTeacherLogin}
              className="text-[#00E676] hover:text-white hover:bg-[#00E676]/10 transition-all duration-200 border border-[#00E676]/30"
            >
              <GraduationCap className="h-4 w-4 mr-2" />
              Teacher Portal
            </Button>
          </div>

          {/* User Avatar */}
          <Avatar className="h-8 w-8 border-2 border-[#2979FF]">
            <AvatarFallback className="bg-[#2979FF] text-white font-bold">
              S
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Search - Shows below main nav on mobile */}
      <div className="md:hidden mt-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666666]" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
            />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default EnhancedTopNavigation;
