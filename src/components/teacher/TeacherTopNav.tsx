
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface TeacherTopNavProps {
  teacherData: any;
}

const TeacherTopNav = ({ teacherData }: TeacherTopNavProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('teacherAuth');
    localStorage.removeItem('teacherData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });
    navigate('/');
  };

  return (
    <nav className="bg-[#1A1A1A] border-b border-[#2C2C2C] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 ml-16 md:ml-0">
          <div className="text-xl font-bold">
            <span className="text-[#2979FF]">Teacher</span>
            <span className="text-white"> CMS</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:text-[#00E676] hover:bg-[#00E676]/10 hidden sm:flex"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">
                {teacherData?.name || 'Administrator'}
              </div>
              <div className="text-xs text-[#E0E0E0]">
                {teacherData?.email}
              </div>
            </div>
            
            <Avatar className="h-8 w-8 border-2 border-[#2979FF]">
              <AvatarFallback className="bg-[#2979FF] text-white font-bold">
                A
              </AvatarFallback>
            </Avatar>
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="text-[#FF7043] hover:text-[#FF7043]/80 hover:bg-[#FF7043]/10"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default TeacherTopNav;
