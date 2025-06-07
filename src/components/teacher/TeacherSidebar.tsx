
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  Upload, 
  Users, 
  Video, 
  FileQuestion, 
  GraduationCap,
  Menu,
  X,
  Settings,
  BarChart3,
  Book
} from 'lucide-react';

interface TeacherSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const TeacherSidebar = ({ activeSection, onSectionChange }: TeacherSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'content-manager', label: 'Content Manager', icon: Settings },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'study-materials', label: 'Study Materials', icon: Upload },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'live-classes', label: 'Live Classes', icon: Video },
    { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { id: 'content', label: 'Content Upload', icon: GraduationCap },
  ];

  const handleItemClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false); // Close mobile menu
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#2979FF] hover:bg-[#2979FF]/90"
        size="icon"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1A1A1A] border-r border-[#2C2C2C] z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#2C2C2C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-[#2979FF] to-[#00E676] rounded-lg flex items-center justify-center">
              <Book className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Teacher CMS</h2>
              <p className="text-xs text-[#E0E0E0]">Content Management</p>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  variant={isActive ? "default" : "ghost"}
                  className={`
                    w-full justify-start text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-[#2979FF] text-white hover:bg-[#2979FF]/90' 
                      : 'text-[#E0E0E0] hover:text-white hover:bg-[#2C2C2C]'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Real-time sync indicator */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-[#2C2C2C]/50 rounded-lg p-3 border border-[#424242]">
            <div className="flex items-center gap-2 text-[#00E676]">
              <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse"></div>
              <span className="text-xs">Live sync with student portal</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherSidebar;
