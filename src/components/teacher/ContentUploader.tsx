
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { dataService, StudyMaterial } from '@/services/dataService';
import { googleDriveService } from '@/services/googleDriveService';
import { chapterSyncService } from '@/services/chapterSyncService';
import SecureStudyMaterialForm from './StudyMaterialManager/SecureStudyMaterialForm';
import ContentList from './ContentUploader/ContentList';
import StatusCards from './ContentUploader/StatusCards';
import { Upload, List, Globe, RefreshCw, Sync } from 'lucide-react';

const ContentUploader = () => {
  const [contentList, setContentList] = useState<(StudyMaterial & { subjects?: any; chapters?: any })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
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

      // Cast the type property to the correct union type
      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'
      }));

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

  const handleSyncChapters = async () => {
    setIsSyncing(true);
    try {
      console.log('Starting chapter synchronization...');
      
      const result = await chapterSyncService.fullSync();
      
      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${result.created + result.updated} chapters`,
        });
      } else {
        toast({
          title: "Sync Issues",
          description: `Completed with ${result.errors.length} errors. Check console for details.`,
          variant: "destructive",
        });
        console.error('Sync errors:', result.errors);
      }
      
      // Reload counts after sync
      await loadCounts();
    } catch (error) {
      console.error('Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync chapters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Globe className="h-8 w-8 text-[#00E676]" />
              Content Management System
            </h1>
            <p className="text-[#E0E0E0]">
              Class → Subject → Chapter → Study Material Structure
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSyncChapters}
              variant="outline"
              className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black"
              disabled={isSyncing}
            >
              <Sync className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Chapters
            </Button>
            <Button
              onClick={loadContent}
              variant="outline"
              className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <StatusCards 
          subjectsCount={subjectsCount}
          chaptersCount={chaptersCount}
          contentCount={contentList.length}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#2C2C2C] border-[#424242]">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Content
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white"
            >
              <List className="h-4 w-4 mr-2" />
              My Content ({contentList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                  <CardHeader>
                    <CardTitle className="text-white">Upload Study Material</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SecureStudyMaterialForm
                      onSubmit={handleFormSubmit}
                      onCancel={() => {}}
                    />
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Uploads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ContentList
                      contentList={contentList.slice(0, 5)} // Show recent uploads
                      onRefresh={loadContent}
                      onDelete={handleDeleteContent}
                      showActions={false}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white">All Study Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <ContentList
                  contentList={contentList}
                  onRefresh={loadContent}
                  onDelete={handleDeleteContent}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentUploader;
