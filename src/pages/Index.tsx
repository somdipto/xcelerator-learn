
import React, { useState, useEffect } from 'react';
import OnboardingModal from '@/components/OnboardingModal';
import Dashboard from '@/components/Dashboard';
import TopNavigation from '@/components/TopNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import SubjectsPage from '@/components/SubjectsPage';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Check if user has already selected a grade
    const savedGrade = localStorage.getItem('selectedGrade');
    if (savedGrade) {
      setSelectedGrade(parseInt(savedGrade));
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const handleGradeSelection = (grade: number) => {
    setSelectedGrade(grade);
    localStorage.setItem('selectedGrade', grade.toString());
    setShowOnboarding(false);
    
    toast({
      title: "Welcome to Your Learning Journey! 🎉",
      description: `Class ${grade} curriculum is now ready for you. Let's start learning!`,
    });
  };

  const handleChapterSelect = (subject: string, chapter: string) => {
    toast({
      title: "Chapter Selected",
      description: `Opening ${subject} - ${chapter}`,
    });
    console.log(`Selected: ${subject} - ${chapter}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // Show appropriate toast for each tab
    const tabMessages = {
      home: "Welcome back to your dashboard!",
      subjects: "Explore your subjects and chapters",
      quizzes: "Time to test your knowledge!",
      profile: "Manage your learning profile"
    };
    
    if (tab !== 'home') {
      toast({
        title: `${tab.charAt(0).toUpperCase() + tab.slice(1)} Section`,
        description: tabMessages[tab as keyof typeof tabMessages],
      });
    }
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <OnboardingModal 
          isOpen={showOnboarding} 
          onSelectGrade={handleGradeSelection}
        />
      </div>
    );
  }

  if (!selectedGrade) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Setting up your personalized learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <TopNavigation 
        selectedGrade={selectedGrade} 
        onChapterSelect={handleChapterSelect}
      />
      
      <main className="pb-20">
        {activeTab === 'home' && <Dashboard selectedGrade={selectedGrade} />}
        
        {activeTab === 'subjects' && (
          <SubjectsPage 
            selectedGrade={selectedGrade} 
            onChapterSelect={handleChapterSelect}
          />
        )}
        
        {activeTab === 'quizzes' && (
          <div className="p-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Practice Quizzes</h2>
            <p className="text-[#E0E0E0]">
              Challenge yourself with interactive quizzes coming soon!
            </p>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div className="p-6 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
            <p className="text-[#E0E0E0]">
              Track your progress and manage settings - Class {selectedGrade}
            </p>
          </div>
        )}
      </main>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Index;
