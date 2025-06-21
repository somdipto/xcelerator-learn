import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, List, BarChart3, Book, Plus, RefreshCw, LogOut } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SecureStudyMaterialForm from './StudyMaterialManager/SecureStudyMaterialForm';
import ContentList from './ContentUploader/ContentList';

const SimplifiedTeacherDashboard = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { user, profile, isTeacher, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!loading && (!user || !profile || (!isTeacher && !isAdmin))) {
      console.log('User not authenticated or not a teacher/admin, redirecting to login');
      navigate('/teacher-login');
      return;
    }
  }, [user, profile, isTeacher, isAdmin, loading, navigate]);

  const teacherId = user?.id;

  useEffect(() => {
    if (teacherId && (isTeacher || isAdmin)) {
      loadAllData();
    }
  }, [teacherId, isTeacher, isAdmin]);

  const loadAllData = async () => {
    if (!teacherId) return;
    
    setIsLoading(true);
    try {
      const [materialsResult, subjectsResult, chaptersResult] = await Promise.all([
        dataService.getStudyMaterials({ teacher_id: teacherId }),
        dataService.getSubjects(),
        dataService.getChapters()
      ]);

      setMaterials(materialsResult.data || []);
      setSubjects(subjectsResult.data || []);
      setChapters(chaptersResult.data || []);

      console.log('Loaded data:', {
        materials: materialsResult.data?.length || 0,
        subjects: subjectsResult.data?.length || 0,
        chapters: chaptersResult.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to find subject UUID by name and grade
  const findSubjectId = (subjectName: string, grade: number): string | null => {
    const subject = subjects.find(s => 
      s.name.toLowerCase() === subjectName.toLowerCase() && s.grade === grade
    );
    return subject?.id || null;
  };

  // Helper function to find chapter UUID by name and subject
  const findChapterId = (chapterName: string, subjectId: string): string | null => {
    const chapter = chapters.find(c => 
      c.name === chapterName && c.subject_id === subjectId
    );
    return chapter?.id || null;
  };

  const handleFormSubmit = async (formData: FormData) => {
    setUploadError(null);
    
    try {
      const url = formData.get('url') as string;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const type = formData.get('type') as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
      const grade = parseInt(formData.get('grade') as string);
      const subjectName = formData.get('subject') as string; // Changed from subjectId
      const chapterName = formData.get('chapter') as string; // Changed from chapterId

      console.log('Form submission data:', {
        url, title, description, type, grade, subjectName, chapterName
      });

      // Validate required fields
      if (!url || !title || !subjectName || !chapterName || !grade) {
        throw new Error('All required fields must be filled');
      }

      // Validate URL format for Google Drive
      if (!dataService.isGoogleDriveUrl(url)) {
        throw new Error('Please provide a valid Google Drive URL');
      }

      // Find subject UUID
      const subjectId = findSubjectId(subjectName, grade);
      if (!subjectId) {
        console.log('Creating new subject:', subjectName);
        const { data: newSubject, error: subjectError } = await dataService.createSubject({
          name: subjectName,
          grade: grade,
          created_by: teacherId,
        });
        
        if (subjectError) {
          throw new Error(`Failed to create subject: ${subjectError.message}`);
        }
        
        if (!newSubject) {
          throw new Error('Failed to create subject: No data returned');
        }
        
        // Reload subjects to get the new one
        const subjectsResult = await dataService.getSubjects();
        setSubjects(subjectsResult.data || []);
      }

      // Find chapter UUID (try again after potential subject creation)
      const finalSubjectId = subjectId || findSubjectId(subjectName, grade);
      if (!finalSubjectId) {
        throw new Error('Subject not found after creation attempt');
      }

      let chapterId = findChapterId(chapterName, finalSubjectId);
      if (!chapterId) {
        console.log('Creating new chapter:', chapterName);
        const { data: newChapter, error: chapterError } = await dataService.createChapter({
          name: chapterName,
          subject_id: finalSubjectId,
          order_index: chapters.filter(c => c.subject_id === finalSubjectId).length + 1,
        });
        
        if (chapterError) {
          throw new Error(`Failed to create chapter: ${chapterError.message}`);
        }
        
        if (!newChapter) {
          throw new Error('Failed to create chapter: No data returned');
        }
        
        chapterId = newChapter.id;
        
        // Reload chapters to get the new one
        const chaptersResult = await dataService.getChapters();
        setChapters(chaptersResult.data || []);
      }

      const materialData = {
        teacher_id: teacherId,
        title,
        description,
        type,
        url,
        grade,
        subject_id: finalSubjectId,
        chapter_id: chapterId,
        is_public: true, // Always public for universal access
      };

      console.log('Final material data for submission:', materialData);

      const { data, error } = await dataService.createStudyMaterial(materialData);

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Study material uploaded successfully",
      });

      setShowUploadForm(false);
      await loadAllData(); // Reload all data
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || "Failed to upload study material";
      setUploadError(errorMessage);
      
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (id: string, title: string) => {
    try {
      const { error } = await dataService.deleteStudyMaterial(id);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: `"${title}" has been deleted successfully`,
      });

      await loadAllData(); // Reload all data
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete study material",
        variant: "destructive",
      });
    }
  };

  const stats = [
    {
      title: 'Total Subjects',
      value: subjects.length,
      icon: Book,
      color: 'text-[#2979FF]',
      bgColor: 'bg-[#2979FF]/10'
    },
    {
      title: 'Total Chapters',
      value: chapters.length,
      icon: List,
      color: 'text-[#00E676]',
      bgColor: 'bg-[#00E676]/10'
    },
    {
      title: 'Study Materials',
      value: materials.length,
      icon: Upload,
      color: 'text-[#FF7043]',
      bgColor: 'bg-[#FF7043]/10'
    },
    {
      title: 'Active Students',
      value: 0,
      icon: BarChart3,
      color: 'text-[#FFA726]',
      bgColor: 'bg-[#FFA726]/10'
    }
  ];

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user || !profile || (!isTeacher && !isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
            <p className="text-[#E0E0E0] text-sm md:text-base">
              Welcome {profile?.full_name || profile?.email || 'Teacher'} - Manage your study materials
            </p>
          </div>
          <div className="flex gap-2 self-start md:self-auto">
            <Button
              onClick={loadAllData}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={async () => {
                try {
                  await signOut();
                  navigate('/teacher-login');
                } catch (error) {
                  console.error('Sign out error:', error);
                }
              }}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {uploadError && (
          <Card className="bg-red-900/20 border-red-500/50">
            <CardContent className="p-4">
              <div className="text-red-400">
                <strong>Upload Error:</strong> {uploadError}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs md:text-sm text-[#E0E0E0] leading-tight">{stat.title}</CardTitle>
                  <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 bg-[#2C2C2C] border-[#424242] ${isMobile ? 'h-12' : ''}`}>
            <TabsTrigger 
              value="materials" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white text-sm md:text-base"
            >
              <List className="h-4 w-4 mr-1 md:mr-2" />
              <span className={isMobile ? 'text-xs' : ''}>Materials</span>
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white text-sm md:text-base"
            >
              <Upload className="h-4 w-4 mr-1 md:mr-2" />
              <span className={isMobile ? 'text-xs' : ''}>Upload</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-4 md:mt-6">
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-lg md:text-xl">Study Materials ({materials.length})</span>
                  <Button
                    onClick={() => setShowUploadForm(true)}
                    className="bg-[#00E676] text-black hover:bg-[#00E676]/90 self-start sm:self-auto"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContentList
                  contentList={materials}
                  onRefresh={loadAllData}
                  onDelete={handleDeleteContent}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="mt-4 md:mt-6">
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Upload Study Material</CardTitle>
              </CardHeader>
              <CardContent>
                <SecureStudyMaterialForm
                  onSubmit={handleFormSubmit}
                  onCancel={() => setShowUploadForm(false)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-white">Upload Study Material</h2>
                <Button
                  onClick={() => setShowUploadForm(false)}
                  variant="outline"
                  size="sm"
                  className="border-[#424242] text-[#E0E0E0]"
                >
                  Cancel
                </Button>
              </div>
              <SecureStudyMaterialForm
                onSubmit={handleFormSubmit}
                onCancel={() => setShowUploadForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplifiedTeacherDashboard;
