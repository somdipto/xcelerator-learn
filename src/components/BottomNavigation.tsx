
import React from 'react';
import { BookOpen, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/95 backdrop-blur-lg border-t border-[#2C2C2C] z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 p-3 h-auto min-w-[70px] relative transition-all duration-300 touch-manipulation ${
                isActive 
                  ? 'text-[#00E676] bg-[#00E676]/10 scale-105' 
                  : 'text-[#CCCCCC] hover:text-[#00E676] hover:bg-[#00E676]/5 hover:scale-105 active:scale-95'
              }`}
            >
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-[#00E676] rounded-full"></div>
              )}
              <Icon className={`h-5 w-5 transition-all duration-200 ${
                isActive ? 'text-[#00E676] scale-110' : ''
              }`} />
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-[#00E676]' : ''
              }`}>
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
