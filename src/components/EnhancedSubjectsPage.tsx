
import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, TrendingUp, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SubjectCard from './SubjectCard';
import ChapterStudyMaterial from './ChapterStudyMaterial';
import EnhancedBreadcrumb from './EnhancedBreadcrumb';
import ContentPreviewCard from './ContentPreviewCard';
import { dataService, Subject } from '@/services/dataService';
import { subjects as subjectsData } from '@/data/subjects';
import { toast } from '@/hooks/use-toast';

interface EnhancedSubjectsPageProps {
  selectedGrade: number;
  onChapterSelect: (subject: string, chapter: string) => void;
  onClassChange?: () => void;
  searchQuery?: string;
}

const EnhancedSubjectsPage = ({ 
  selectedGrade, 
  onChapterSelect, 
  onClassChange,
  searchQuery 
}: EnhancedSubjectsPageProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentContent, setRecentContent] = useState<any[]>([]);

  useEffect(() => {
    loadSubjects();
    loadRecentContent();
  }, [selectedGrade]);

  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject => 
    !searchQuery || 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const fallbackSubjects = createFallbackSubjects();
      setSubjects(fallbackSubjects);
      setIsLoading(false);

      const { data: supabaseSubjects, error } = await dataService.getSubjects(selectedGrade);
      
      if (!error && supabaseSubjects?.length) {
        const mergedSubjects = fallbackSubjects.map(fallback => {
          const existing = supabaseSubjects.find(s => s.name === fallback.name);
          return existing ? { ...fallback, ...existing } : fallback;
        });
        
        supabaseSubjects.forEach(supabaseSubject => {
          if (!fallbackSubjects.find(f => f.name === supabaseSubject.name)) {
            mergedSubjects.push(supabaseSubject);
          }
        });
        
        setSubjects(mergedSubjects);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadRecentContent = async () => {
    try {
      // Mock recent content - in real app this would come from Supabase
      const mockContent = [
        {
          id: '1',
          title: 'Linear Equations Practice',
          type: 'quiz' as const,
          subject: 'Mathematics',
          chapter: 'Chapter 2: Linear Equations',
          uploadedBy: 'Ms. Sharma',
          uploadedAt: '2 hours ago',
          isNew: true
        },
        {
          id: '2',
          title: 'Cell Structure Video',
          type: 'video' as const,
          subject: 'Science',
          chapter: 'Chapter 1: Cell Biology',
          uploadedBy: 'Mr. Kumar',
          uploadedAt: '1 day ago',
          isNew: false
        }
      ];
      setRecentContent(mockContent);
    } catch (error) {
      console.error('Failed to load recent content:', error);
    }
  };

  const createFallbackSubjects = (): Subject[] => {
    return Object.entries(subjectsData).map(([subjectName, subjectInfo]) => ({
      id: `local-${subjectName}`,
      name: subjectName,
      description: `${subjectName} for Class ${selectedGrade}`,
      grade: selectedGrade,
      icon: subjectInfo.icon,
      color: '#2979FF',
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  const handleChapterClick = (subject: string, chapter: string) => {
    setSelectedSubject(subject);
    setSelectedChapter(chapter);
    onChapterSelect(subject, chapter);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const handleRefresh = () => {
    loadSubjects();
    loadRecentContent();
    toast({
      title: "Content Refreshed",
      description: "Checking for latest updates",
    });
  };

  const getBreadcrumbItems = () => {
    const items = [
      { label: `Class ${selectedGrade}`, href: `/class/${selectedGrade}` }
    ];
    
    if (selectedSubject) {
      items.push({ label: selectedSubject, href: `/class/${selectedGrade}/${selectedSubject}` });
    }
    
    if (selectedChapter) {
      items.push({ label: selectedChapter, isActive: true });
    } else {
      items.push({ label: 'Subjects', isActive: true });
    }
    
    return items;
  };

  if (selectedChapter && selectedSubject) {
    return (
      <>
        <EnhancedBreadcrumb items={getBreadcrumbItems()} />
        <ChapterStudyMaterial
          subject={selectedSubject as any}
          chapter={selectedChapter}
          selectedGrade={selectedGrade}
          onBack={handleBackToSubjects}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A]">
      <EnhancedBreadcrumb items={getBreadcrumbItems()} />
      
      <div className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-[#E0E0E0] to-[#00E676] bg-clip-text text-transparent leading-tight">
                  Class {selectedGrade} Subjects
                  {searchQuery && (
                    <span className="block text-lg text-[#E0E0E0] mt-1">
                      Search results for "{searchQuery}"
                    </span>
                  )}
                </h1>
              </div>
              <div className="flex gap-2 self-center sm:self-auto">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white transition-all duration-200"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={onClassChange}
                  variant="outline"
                  className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black transition-all duration-200 h-10 px-4"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Change Class
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#E0E0E0] flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#2979FF]" />
                    Total Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{subjects.length}</div>
                  <p className="text-xs text-[#666666]">Available for Class {selectedGrade}</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#E0E0E0] flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#00E676]" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">78%</div>
                  <p className="text-xs text-[#666666]">Overall completion</p>
                </CardContent>
              </Card>

              <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-[#E0E0E0] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#FFA726]" />
                    New Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{recentContent.filter(c => c.isNew).length}</div>
                  <p className="text-xs text-[#666666]">Added this week</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Content Section */}
          {recentContent.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#00E676]" />
                Recently Added Content
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentContent.map((content) => (
                  <ContentPreviewCard
                    key={content.id}
                    {...content}
                    onClick={() => handleChapterClick(content.subject, content.chapter)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
              <p className="text-[#E0E0E0]">Loading subjects...</p>
            </div>
          ) : (
            /* Subjects Grid */
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                {searchQuery ? 'Search Results' : 'All Subjects'}
                {searchQuery && (
                  <span className="text-sm text-[#666666] ml-2">
                    ({filteredSubjects.length} found)
                  </span>
                )}
              </h2>
              
              {filteredSubjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#E0E0E0]">
                    {searchQuery ? 'No subjects found matching your search.' : 'No subjects available.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredSubjects.map((subject) => {
                    const subjectData = subjectsData[subject.name as keyof typeof subjectsData];
                    const displayData = subjectData || {
                      icon: subject.icon || '📚',
                      gradient: `from-[${subject.color || '#2979FF'}] to-[${subject.color || '#2979FF'}]/70`,
                      chapters: {
                        8: [],
                        9: [],
                        10: []
                      }
                    };

                    return (
                      <div key={subject.id} className="w-full">
                        <SubjectCard
                          subject={subject.name as any}
                          data={displayData}
                          selectedGrade={selectedGrade}
                          onSubjectSelect={setSelectedSubject}
                          onChapterSelect={handleChapterClick}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedSubjectsPage;
