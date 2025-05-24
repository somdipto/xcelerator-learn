
import React, { useState, useEffect } from 'react';
import OnboardingModal from '@/components/OnboardingModal';
import Dashboard from '@/components/Dashboard';
import TopNavigation from '@/components/TopNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import SubjectsPage from '@/components/SubjectsPage';
import ProfilePage from '@/components/ProfilePage';
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
    
    // Show appropriate toast for each tab with better messaging
    const tabMessages = {
      home: "Welcome back to your personalized dashboard!",
      subjects: "Explore your subjects and dive into new chapters",
      quizzes: "Ready to test your knowledge? Let's go!",
      profile: "View your progress and achievements"
    };
    
    if (tab !== 'home') {
      toast({
        title: `${tab.charAt(0).toUpperCase() + tab.slice(1)}`,
        description: tabMessages[tab as keyof typeof tabMessages],
      });
    }
  };

  // Loading state
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

  // Grade selection loading
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
          <div className="p-6 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold text-white mb-4">Practice Quizzes</h2>
                <p className="text-[#E0E0E0] text-lg">
                  Challenge yourself with interactive quizzes and track your progress!
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
                  <h3 className="text-xl font-semibold text-white mb-2">Daily Quiz</h3>
                  <p className="text-[#E0E0E0] mb-4">Quick 10-question quiz</p>
                  <button className="bg-[#00E676] text-black px-6 py-2 rounded-lg font-medium hover:bg-[#00E676]/90 transition-colors">
                    Start Quiz
                  </button>
                </div>
                
                <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
                  <h3 className="text-xl font-semibold text-white mb-2">Subject Test</h3>
                  <p className="text-[#E0E0E0] mb-4">Comprehensive chapter tests</p>
                  <button className="bg-[#2979FF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2979FF]/90 transition-colors">
                    Browse Tests
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <ProfilePage selectedGrade={selectedGrade} />
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
