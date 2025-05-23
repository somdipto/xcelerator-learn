
import React from 'react';
import { Home, BookOpen, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2C2C2C] z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-3 h-auto min-w-[60px] ${
                isActive 
                  ? 'text-[#00E676] bg-[#00E676]/10' 
                  : 'text-[#E0E0E0] hover:text-[#00E676] hover:bg-[#00E676]/5'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#00E676]' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-[#00E676]' : ''}`}>
                {tab.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
