
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { dataService, StudyMaterial } from '@/services/dataService';
import { googleDriveService } from '@/services/googleDriveService';
import { chapterSyncService } from '@/services/chapterSyncService';
import { subjects } from '@/data/subjects';
import SecureStudyMaterialForm from './StudyMaterialManager/SecureStudyMaterialForm';
import ContentList from './ContentUploader/ContentList';
import StatusCards from './ContentUploader/StatusCards';
import { Upload, List, Globe, RefreshCw, RefreshCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ContentUploader = () => {
  const [contentList, setContentList] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [subjectsCount, setSubjectsCount] = useState(0);
  const [chaptersCount, setChaptersCount] = useState(0);
  const isMobile = useIsMobile();

  // Mock teacher ID - in real app this would come from auth context
  const teacherId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

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

      const typedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
        created_at: item.created_at || new Date().toISOString(),
        is_public: item.is_public ?? true
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
      console.log('Starting chapter synchronization with NCERT curriculum...');
      
      // Sync chapters from the frontend subjects data to ensure correct NCERT chapters
      const syncResult = await syncNCERTChapters();
      
      if (syncResult.success) {
        toast({
          title: "NCERT Sync Complete",
          description: `Successfully synced ${syncResult.total} NCERT chapters`,
        });
      } else {
        toast({
          title: "Sync Issues",
          description: `Completed with some errors. Check console for details.`,
          variant: "destructive",
        });
      }
      
      await loadCounts();
    } catch (error) {
      console.error('NCERT Sync failed:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync NCERT chapters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const syncNCERTChapters = async () => {
    try {
      let totalSynced = 0;
      
      // Sync all subjects and chapters from the frontend data
      for (const [subjectName, subjectData] of Object.entries(subjects)) {
        for (const [gradeKey, chapters] of Object.entries(subjectData.chapters)) {
          const grade = parseInt(gradeKey);
          
          // Create or get subject
          const { data: existingSubjects } = await dataService.getSubjects();
          let subject = existingSubjects?.find(s => s.name === subjectName && s.grade === grade);
          
          if (!subject) {
            const { data: newSubject } = await dataService.createSubject({
              name: subjectName,
              grade,
              created_by: teacherId, // Add the required created_by field
              description: `${subjectName} curriculum for Class ${grade}`,
              icon: subjectData.icon,
              color: subjectData.gradient.split(' ')[1] // Extract color from gradient
            });
            subject = newSubject;
          }
          
          if (subject) {
            // Sync chapters for this subject
            for (let i = 0; i < chapters.length; i++) {
              const chapterName = chapters[i];
              
              const { data: existingChapters } = await dataService.getChapters();
              const chapterExists = existingChapters?.find(c => 
                c.name === chapterName && c.subject_id === subject.id
              );
              
              if (!chapterExists) {
                await dataService.createChapter({
                  name: chapterName,
                  subject_id: subject.id,
                  order_index: i + 1,
                  description: `${chapterName} for ${subjectName} Class ${grade}`
                });
                totalSynced++;
              }
            }
          }
        }
      }
      
      return { success: true, total: totalSynced };
    } catch (error) {
      console.error('Error syncing NCERT chapters:', error);
      return { success: false, total: 0 };
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

      if (url && dataService.isGoogleDriveUrl(url)) {
        console.log('Processing Google Drive URL:', url);
        
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

        const result = await googleDriveService.ingestGoogleDriveLink({
          url,
          title,
          description,
          type,
          subject: subjectName,
          chapter: chapterName,
          grade,
          teacherId,
          isPublic: true
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
        const materialData = {
          teacher_id: teacherId,
          title,
          description,
          type,
          url,
          grade,
          subject_id: subjectId,
          chapter_id: chapterId,
          is_public: true,
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
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2 md:gap-3">
              <Globe className="h-6 w-6 md:h-8 md:w-8 text-[#00E676]" />
              <span className={isMobile ? 'text-xl' : ''}>Content Management</span>
            </h1>
            <p className="text-[#E0E0E0] text-sm md:text-base">
              Class → Subject → Chapter → Study Material Structure
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Button
              onClick={handleSyncChapters}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-[#00E676] text-[#00E676] hover:bg-[#00E676] hover:text-black"
              disabled={isSyncing}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              {isMobile ? 'Sync' : 'Sync NCERT Chapters'}
            </Button>
            <Button
              onClick={loadContent}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <StatusCards 
          subjectsCount={subjectsCount}
          chaptersCount={chaptersCount}
          contentCount={contentList.length}
        />

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 bg-[#2C2C2C] border-[#424242] ${isMobile ? 'h-12' : ''}`}>
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white text-sm md:text-base"
            >
              <Upload className="h-4 w-4 mr-1 md:mr-2" />
              <span className={isMobile ? 'text-xs' : ''}>Upload</span>
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white text-sm md:text-base"
            >
              <List className="h-4 w-4 mr-1 md:mr-2" />
              <span className={isMobile ? 'text-xs' : ''}>Content ({contentList.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4 md:mt-6">
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-3 gap-6'}`}>
              <div className={isMobile ? 'col-span-1' : 'lg:col-span-2'}>
                <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white text-lg md:text-xl">Upload Study Material</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SecureStudyMaterialForm
                      onSubmit={handleFormSubmit}
                      onCancel={() => {}}
                    />
                  </CardContent>
                </Card>
              </div>
              {!isMobile && (
                <div className="lg:col-span-1">
                  <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
                    <CardHeader>
                      <CardTitle className="text-white">Recent Uploads</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ContentList
                        contentList={contentList.slice(0, 5)}
                        onRefresh={loadContent}
                        onDelete={handleDeleteContent}
                        showActions={false}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="content" className="mt-4 md:mt-6">
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">All Study Materials</CardTitle>
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
