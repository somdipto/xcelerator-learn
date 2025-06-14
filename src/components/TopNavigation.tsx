import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Video, Book, GraduationCap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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
  return <nav className="bg-[#1A1A1A]/95 backdrop-blur-lg border-b border-[#2C2C2C] p-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Section with Book Icon */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {/* Book Logo Icon */}
            
            <div className="text-xl sm:text-2xl font-bold">
              <span className="text-[#00E676]">Xcel</span>
              <span className="text-white">erator</span>
            </div>
          </div>
          <button onClick={handleClassClick} className="text-xs text-[#CCCCCC] bg-[#2C2C2C] px-3 py-1.5 rounded-full hover:bg-[#00E676] hover:text-black transition-colors cursor-pointer touch-manipulation">
            Class {selectedGrade}
          </button>
        </div>

        {/* Center Navigation - Hidden on mobile */}
        

        {/* Right Section */}
        
      </div>
    </nav>;
};
export default TopNavigation;