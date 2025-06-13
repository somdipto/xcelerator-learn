
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { dataService, StudyMaterial } from '@/services/dataService';
import { googleDriveService } from '@/services/googleDriveService';
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
      console.log('Loading content from Supabase...');
      const { data, error } = await dataService.getStudyMaterials({
        teacher_id: teacherId
      });

      if (error) {
        console.error('Error loading content from Supabase:', error);
        toast({
          title: "Loading Error",
          description: "Failed to load your content from database",
          variant: "destructive",
        });
        return;
      }

      console.log('Raw data from Supabase:', data);

      // Cast the type property to the correct union type
      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'
      }));

      console.log('Processed content data:', typedData);
      setContentList(typedData);
      
      toast({
        title: "Content Loaded",
        description: `Loaded ${typedData.length} items from database`,
      });
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
      console.log('Processing form submission...');
      
      const url = formData.get('url') as string;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const type = formData.get('type') as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
      const grade = parseInt(formData.get('grade') as string);
      const subjectId = formData.get('subjectId') as string;
      const chapterId = formData.get('chapterId') as string;

      // Check if it's a Google Drive URL and process it through the enhanced service
      if (url && dataService.isGoogleDriveUrl(url)) {
        console.log('Processing Google Drive URL:', url);
        
        // Get subject and chapter names for Google Drive service
        let subjectName = 'General';
        let chapterName = 'General';
        
        if (subjectId) {
          const { data: subjects } = await dataService.getSubjects();
          const subject = subjects?.find(s => s.id === subjectId);
          subjectName = subject?.name || 'General';
        }
        
        if (chapterId) {
          const { data: chapters } = await dataService.getChapters();
          const chapter = chapters?.find(c => c.id === chapterId);
          chapterName = chapter?.name || 'General';
        }

        // Use Google Drive service for enhanced processing
        const result = await googleDriveService.ingestGoogleDriveLink({
          url,
          title,
          description,
          type,
          subject: subjectName,
          chapter: chapterName,
          grade,
          teacherId,
          isPublic: true // Always public for universal access
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to process Google Drive link');
        }

        console.log('Google Drive link processed successfully:', result.data);
        
        toast({
          title: "Google Drive Content Added",
          description: "Link processed and saved to database with universal access",
        });
      } else {
        // Handle non-Google Drive content with standard flow
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

        console.log('Creating standard material:', materialData);

        const { data, error } = await dataService.createStudyMaterial(materialData);

        if (error) {
          throw new Error(error.message);
        }

        console.log('Standard material created successfully:', data);
        
        toast({
          title: "Content Added",
          description: "Content saved to database successfully",
        });
      }

      // Reload content to show the new item
      await loadContent();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to save content to database",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContent = async (id: string, title: string) => {
    try {
      console.log('Deleting content:', id);
      
      const { error } = await dataService.deleteStudyMaterial(id);

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Content Deleted",
        description: `"${title}" has been removed from database`,
      });

      // Reload content to update the list
      await loadContent();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Error",
        description: error.message || "Failed to delete content from database",
        variant: "destructive",
      });
    }
  };

  const handleBatchUploadComplete = async (result: any) => {
    console.log('Batch upload completed:', result);
    
    // Reload content list after batch upload
    await loadContent();
    
    if (result.success) {
      toast({
        title: "Batch Upload Complete",
        description: `Successfully processed ${result.summary.successful} Google Drive links and saved to database`,
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
            Upload Google Drive content with universal accessibility across all devices
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
                    <CardTitle className="text-white">Database Storage Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-[#00E676] mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Universal Access</div>
                        <div className="text-sm text-[#999999]">All links saved to Supabase database for cross-device access</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Upload className="h-5 w-5 text-[#2979FF] mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Real-time Sync</div>
                        <div className="text-sm text-[#999999]">Content instantly available on all devices</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-[#FFA726] mt-0.5" />
                      <div>
                        <div className="text-white font-medium">Persistent Storage</div>
                        <div className="text-sm text-[#999999]">No cache issues - data stored permanently in database</div>
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
