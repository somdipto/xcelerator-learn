
import React, { useState, useEffect, Suspense } from 'react';
import OnboardingModal from '@/components/OnboardingModal';
import EnhancedTopNavigation from '@/components/EnhancedTopNavigation';
import BottomNavigation from '@/components/BottomNavigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import { LazyProfilePage } from '@/components/LazyComponents';
import EnhancedSubjectsPage from '@/components/EnhancedSubjectsPage';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState('subjects');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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
      title: "Welcome! 🎉",
      description: `Class ${grade} is ready!`,
    });
  };

  const handleClassChange = () => {
    setShowOnboarding(true);
  };

  const handleChapterSelect = (subject: string, chapter: string) => {
    console.log(`Selected: ${subject} - ${chapter}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchQuery(''); // Clear search when changing tabs
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (activeTab !== 'subjects') {
      setActiveTab('subjects'); // Switch to subjects tab when searching
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
        <LoadingSpinner message="Setting up..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <EnhancedTopNavigation 
        selectedGrade={selectedGrade} 
        onChapterSelect={handleChapterSelect}
        onClassChange={handleClassChange}
        onSearch={handleSearch}
      />
      
      <main className="pb-20">
        <Suspense fallback={<LoadingSpinner message="Loading..." />}>
          {activeTab === 'subjects' && (
            <EnhancedSubjectsPage 
              selectedGrade={selectedGrade} 
              onChapterSelect={handleChapterSelect}
              onClassChange={handleClassChange}
              searchQuery={searchQuery}
            />
          )}
          
          {activeTab === 'quizzes' && (
            <div className="p-6 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-white mb-4">Practice Quizzes</h2>
                  <p className="text-[#E0E0E0] text-lg">
                    Challenge yourself with interactive quizzes!
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
                    <p className="text-[#E0E0E0] mb-4">Comprehensive tests</p>
                    <button className="bg-[#2979FF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#2979FF]/90 transition-colors">
                      Browse Tests
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <LazyProfilePage selectedGrade={selectedGrade} />
          )}
        </Suspense>
      </main>

      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default Index;
