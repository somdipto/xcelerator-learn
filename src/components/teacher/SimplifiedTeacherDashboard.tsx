
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, List, BarChart3, Book, Plus, RefreshCw } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { toast } from '@/hooks/use-toast';
import SecureStudyMaterialForm from './StudyMaterialManager/SecureStudyMaterialForm';
import ContentList from './ContentUploader/ContentList';

const SimplifiedTeacherDashboard = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Mock teacher ID - in real app this would come from auth context
  const teacherId = 'mock-teacher-id';

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
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

  const handleFormSubmit = async (formData: FormData) => {
    try {
      const url = formData.get('url') as string;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const type = formData.get('type') as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
      const grade = parseInt(formData.get('grade') as string);
      const subjectId = formData.get('subjectId') as string;
      const chapterId = formData.get('chapterId') as string;

      const materialData = {
        teacher_id: teacherId,
        title,
        description,
        type,
        url,
        grade,
        subject_id: subjectId,
        chapter_id: chapterId,
        is_public: true, // Always public for universal access
      };

      const { data, error } = await dataService.createStudyMaterial(materialData);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Success",
        description: "Study material uploaded successfully",
      });

      setShowUploadForm(false);
      await loadAllData(); // Reload all data
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload study material",
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
      value: 0, // Set to 0 as requested
      icon: BarChart3,
      color: 'text-[#FFA726]',
      bgColor: 'bg-[#FFA726]/10'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
            <p className="text-[#E0E0E0]">Manage your study materials with universal access</p>
          </div>
          <Button
            onClick={loadAllData}
            variant="outline"
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-[#E0E0E0]">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2C2C2C] border-[#424242]">
            <TabsTrigger 
              value="materials" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <List className="h-4 w-4 mr-2" />
              My Materials
            </TabsTrigger>
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>Study Materials ({materials.length})</span>
                  <Button
                    onClick={() => setShowUploadForm(true)}
                    className="bg-[#00E676] text-black hover:bg-[#00E676]/90"
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

          <TabsContent value="upload" className="mt-6">
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white">Upload Study Material</CardTitle>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#1A1A1A] border border-[#2C2C2C] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Upload Study Material</h2>
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
