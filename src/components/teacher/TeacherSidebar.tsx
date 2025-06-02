
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  Upload, 
  Users, 
  Video, 
  FileQuestion,
  FileText, // Added for Study Materials
  GraduationCap,
  Menu,
  X
} from 'lucide-react';

interface TeacherSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const TeacherSidebar = ({ activeSection, onSectionChange }: TeacherSidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'content', label: 'Content Upload', icon: Upload },
    { id: 'study-materials', label: 'Study Materials', icon: FileText }, // Added this line
    { id: 'students', label: 'Student Analytics', icon: Users },
    { id: 'live-classes', label: 'Live Classes', icon: Video },
    { id: 'quizzes', label: 'Quiz Manager', icon: FileQuestion },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1A1A1A] border border-[#2C2C2C] text-white hover:bg-[#2C2C2C]"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-[#1A1A1A] border-r border-[#2C2C2C] min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#2C2C2C] mt-16 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#2979FF] rounded-lg p-2">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">Xcelerator</div>
              <div className="text-xs text-[#E0E0E0]">Teacher Portal</div>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                variant="ghost"
                className={`w-full justify-start text-left ${
                  activeSection === item.id
                    ? 'bg-[#2979FF]/20 text-[#2979FF] border-r-2 border-[#2979FF]'
                    : 'text-[#E0E0E0] hover:text-white hover:bg-[#2C2C2C]'
                }`}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default TeacherSidebar;
