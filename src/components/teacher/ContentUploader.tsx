
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { dataService, StudyMaterial } from '@/services/dataService';
import SecureStudyMaterialForm from './StudyMaterialManager/SecureStudyMaterialForm';
import ContentList from './ContentUploader/ContentList';
import BatchUploadManager from './ContentUploader/BatchUploadManager';
import ContentAnalytics from './ContentUploader/ContentAnalytics';
import SyncStatusBanner from './ContentUploader/SyncStatusBanner';
import StatusCards from './ContentUploader/StatusCards';
import { Upload, BarChart3, List, Globe } from 'lucide-react';

const ContentUploader = () => {
  const [contentList, setContentList] = useState<(StudyMaterial & { subjects?: any; chapters?: any })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [chaptersCount, setChaptersCount] = useState(0);

  // Mock teacher ID - in real app this would come from auth context
  const teacherId = 'mock-teacher-id';

  useEffect(() => {
    loadContent();
    loadCounts();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await dataService.getStudyMaterials({
        teacher_id: teacherId
      });

      if (error) {
        console.error('Error loading content:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load your content",
          variant: "destructive",
        });
        return;
      }

      setContentList(data || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const [subjectsResult, chaptersResult] = await Promise.all([
        dataService.getSubjects(),
        dataService.getChapters()
      ]);

      setSubjectsCount(subjectsResult.data?.length || 0);
      setChaptersCount(chaptersResult.data?.length || 0);
    } catch (error) {
      console.error('Failed to load counts:', error);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    try {
      const materialData = {
        teacher_id: teacherId,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        type: formData.get('type') as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
        url: formData.get('url') as string,
        grade: parseInt(formData.get('grade') as string),
        subject_id: formData.get('subjectId') as string,
        chapter_id: formData.get('chapterId') as string,
        is_public: formData.get('universalAccess') === 'true',
      };

      const { data, error } = await dataService.createStudyMaterial(materialData);

      if (error) {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Content Uploaded Successfully",
        description: "Your content is now available with universal access",
      });

      loadContent(); // Refresh the content list
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload content",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (id: string, title: string) => {
    try {
      const { error } = await dataService.deleteStudyMaterial(id);

      if (error) {
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Content Deleted",
        description: `"${title}" has been removed`,
      });

      loadContent(); // Refresh the content list
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const handleBatchUploadComplete = (result: any) => {
    loadContent(); // Refresh content list after batch upload
    
    if (result.success) {
      toast({
        title: "Batch Upload Complete",
        description: `Successfully processed ${result.summary.successful} items with universal access`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Globe className="h-8 w-8 text-[#00E676]" />
            Universal Content Management
          </h1>
          <p className="text-[#E0E0E0]">
            Upload and manage Google Drive content with universal accessibility across all devices
          </p>
        </div>

        {/* Sync Status Banner */}
        <SyncStatusBanner />

        {/* Status Cards */}
        <StatusCards 
          subjectsCount={subjectsCount}
          chaptersCount={chaptersCount}
          contentCount={contentList.length}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#2C2C2C] border-[#424242]">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Single Upload
            </TabsTrigger>
            <TabsTrigger 
              value="batch" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Batch Upload
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <List className="h-4 w-4 mr-2" />
              My Content
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SecureStudyMaterialForm
                  onSubmit={handleFormSubmit}
                  onCancel={() => {}}
                />
              </div>
              <div className="lg:col-span-1">
                <ContentList
                  contentList={contentList.slice(0, 5)} // Show recent uploads
                  onRefresh={loadContent}
                  onDelete={handleDeleteContent}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BatchUploadManager
                  teacherId={teacherId}
                  onUploadComplete={handleBatchUploadComplete}
                />
              </div>
              <div className="lg:col-span-1">
                <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                  <CardHeader>
                    <CardTitle className="text-white">Batch Upload Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-[#00E676] mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Universal Access</div>
                        <div className="text-sm text-[#999999]">All links automatically configured for universal accessibility</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Upload className="h-5 w-5 text-[#2979FF] mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Bulk Processing</div>
                        <div className="text-sm text-[#999999]">Upload multiple Google Drive links at once</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-[#FFA726] mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Auto Organization</div>
                        <div className="text-sm text-[#999999]">Content automatically organized by subject and chapter</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ContentList
              contentList={contentList}
              onRefresh={loadContent}
              onDelete={handleDeleteContent}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <ContentAnalytics teacherId={teacherId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentUploader;
