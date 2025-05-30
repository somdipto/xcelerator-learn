
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BookOpen, GraduationCap, Users, School, Book, Calculator, Globe, Microscope, Rocket, Target, Trophy, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onSelectGrade: (grade: number) => void;
}

const OnboardingModal = ({ isOpen, onSelectGrade }: OnboardingModalProps) => {
  const navigate = useNavigate();
  
  const grades = [
    { number: 1, label: 'Class I', icon: BookOpen, color: 'text-pink-400' },
    { number: 2, label: 'Class II', icon: Book, color: 'text-purple-400' },
    { number: 3, label: 'Class III', icon: School, color: 'text-blue-400' },
    { number: 4, label: 'Class IV', icon: Calculator, color: 'text-cyan-400' },
    { number: 5, label: 'Class V', icon: Microscope, color: 'text-green-400' },
    { number: 6, label: 'Class VI', icon: Globe, color: 'text-yellow-400' },
    { number: 7, label: 'Class VII', icon: Calculator, color: 'text-orange-400' },
    { number: 8, label: 'Class VIII', icon: Microscope, color: 'text-red-400' },
    { number: 9, label: 'Class IX', icon: Rocket, color: 'text-indigo-400' },
    { number: 10, label: 'Class X', icon: Target, color: 'text-violet-400' },
    { number: 11, label: 'Class XI', icon: Trophy, color: 'text-amber-400' },
    { number: 12, label: 'Class XII', icon: Crown, color: 'text-emerald-400' },
  ];

  const enabledClasses = [8, 9, 10];

  const handleGradeClick = (grade: number) => {
    if (enabledClasses.includes(grade)) {
      onSelectGrade(grade);
    } else {
      // Show coming soon notification with consistent styling
      toast({
        title: "Coming Soon! 🚀",
        description: `Class ${grade} content is being prepared. Stay tuned for updates!`,
      });
    }
  };

  const handleTeacherLogin = () => {
    navigate('/teacher-login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-[#1A1A1A] border-[#2C2C2C] max-w-2xl">
        <DialogHeader className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[#00E676] rounded-full p-3">
              <GraduationCap className="h-8 w-8 text-black" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white mb-2">
            Welcome to Xcelerator! 🎉
          </DialogTitle>
          <p className="text-[#E0E0E0] text-lg">
            Which class are you in? Let's personalize your learning journey!
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {grades.map((grade) => {
            const IconComponent = grade.icon;
            const isEnabled = enabledClasses.includes(grade.number);
            
            return (
              <Button
                key={grade.number}
                onClick={() => handleGradeClick(grade.number)}
                variant="outline"
                className={`h-20 bg-[#121212] border-[#424242] text-white transition-all duration-200 flex flex-col items-center gap-2 group ${
                  isEnabled 
                    ? 'hover:border-[#00E676] hover:bg-[#00E676]/10 hover:text-[#00E676] opacity-100 cursor-pointer' 
                    : 'opacity-30 cursor-not-allowed hover:opacity-40'
                }`}
              >
                <IconComponent className={`h-6 w-6 ${grade.color} ${isEnabled ? 'group-hover:text-[#00E676]' : ''} transition-colors`} />
                <span className="text-sm font-medium">{grade.label}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-[#2C2C2C]">
          <p className="text-center text-[#E0E0E0] text-sm mb-4">
            Don't worry, you can change this anytime!
          </p>
          
          {/* Teacher Login Link */}
          <div className="text-center">
            <Button
              onClick={handleTeacherLogin}
              variant="link"
              className="text-[#2979FF] hover:text-[#2979FF]/80 text-sm flex items-center gap-2 mx-auto"
            >
              <Users className="h-4 w-4" />
              Are you a teacher? Login here
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
