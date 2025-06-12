
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabaseService } from '@/services/supabaseService';
import { chapterSyncService } from '@/services/chapterSyncService';
import { subjects } from '@/data/subjects';
import type { Subject, StudyMaterial } from '@/services/dataService';

// Components
import StatusCards from './ContentUploader/StatusCards';
import SyncStatusIndicator from './ContentUploader/SyncStatusIndicator';
import UploadForm from './ContentUploader/UploadForm';
import ContentList from './ContentUploader/ContentList';
import SyncStatusBanner from './ContentUploader/SyncStatusBanner';

interface Chapter {
  id: string;
  name: string;
  description?: string;
  subject_id: string;
  order_index: number;
}

interface ContentItem extends StudyMaterial {
  subjects?: { name: string; grade: number };
  chapters?: { name: string };
}

const ContentUploader = () => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subject_id: '',
    chapter_id: '',
    grade: '',
    type: 'textbook' as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
    summaryType: 'pdf' as 'pdf' | 'audio'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  
  // Data states
  const [dbSubjects, setDbSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  
  // Filtered data based on selections
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  useEffect(() => {
    checkUser();
    loadAllData();
    
    // Real-time sync setup
    const channel = supabaseService.subscribeToStudyMaterials((payload) => {
      console.log('Real-time content update:', payload);
      setSyncStatus('syncing');
      loadContent();
      setTimeout(() => setSyncStatus('synced'), 1000);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 'content-uploader');

    return () => {
      supabaseService.removeChannel(channel);
    };
  }, []);

  // Filter subjects when grade changes
  useEffect(() => {
    if (uploadData.grade) {
      const filtered = dbSubjects.filter(subject => subject.grade === parseInt(uploadData.grade));
      setFilteredSubjects(filtered);
      setUploadData(prev => ({ ...prev, subject_id: '', chapter_id: '' }));
      setAvailableChapters([]);
    } else {
      setFilteredSubjects([]);
    }
  }, [uploadData.grade, dbSubjects]);

  // Filter chapters when subject changes
  useEffect(() => {
    if (uploadData.subject_id && uploadData.grade) {
      const selectedSubject = dbSubjects.find(s => s.id === uploadData.subject_id);
      if (selectedSubject) {
        const subjectData = subjects[selectedSubject.name as keyof typeof subjects];
        if (subjectData && subjectData.chapters[parseInt(uploadData.grade) as keyof typeof subjectData.chapters]) {
          const chaptersList = subjectData.chapters[parseInt(uploadData.grade) as keyof typeof subjectData.chapters];
          setAvailableChapters(chaptersList || []);
        } else {
          setAvailableChapters([]);
        }
      }
      setUploadData(prev => ({ ...prev, chapter_id: '' }));
    } else {
      setAvailableChapters([]);
    }
  }, [uploadData.subject_id, uploadData.grade, dbSubjects]);

  const checkUser = async () => {
    const { user } = await supabaseService.getCurrentUser();
    setCurrentUser(user);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSubjects(),
        loadChapters(),
        loadContent()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncChapters = async () => {
    setSyncStatus('syncing');
    try {
      const result = await chapterSyncService.fullSync();

      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Created ${result.created} items, updated ${result.updated} items`,
        });
        await loadAllData();
      } else {
        toast({
          title: "Sync Completed with Issues",
          description: `${result.errors.length} errors occurred. Check console for details.`,
          variant: "destructive"
        });
        console.error('Sync errors:', result.errors);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync chapters from curriculum data",
        variant: "destructive"
      });
    } finally {
      setSyncStatus('idle');
    }
  };

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabaseService.getSubjects();
      if (error) throw error;
      setDbSubjects(data || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadChapters = async () => {
    try {
      const { data, error } = await supabaseService.supabase
        .from('chapters')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const loadContent = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabaseService.getTeacherStudyMaterials(currentUser.id);
      if (error) throw error;
      
      const typedData: ContentItem[] = (data || []).map(item => ({
        ...item,
        type: item.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'
      }));
      
      setContentList(typedData);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleUpload = async () => {
    // Enhanced validation
    const validation = supabaseService.validateContentData({
      title: uploadData.title,
      type: uploadData.type,
      subject_id: uploadData.subject_id,
      chapter_id: uploadData.chapter_id,
      grade: parseInt(uploadData.grade),
      url: linkUrl
    });

    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    // Check file requirements
    const needsFile = uploadData.type !== 'quiz' && uploadData.type !== 'video';
    const needsUrl = uploadData.type === 'quiz' || uploadData.type === 'video';

    if (needsFile && !selectedFile && !linkUrl) {
      toast({
        title: "Missing File or URL",
        description: "Please provide either a file or a Google Drive link",
        variant: "destructive"
      });
      return;
    }

    if (needsUrl && !linkUrl) {
      toast({
        title: "Missing URL",
        description: `Please provide a URL for ${uploadData.type} content`,
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication Error",
        description: "Please log in to upload content",
        variant: "destructive"
      });
      return;
    }

    // File validation if file is provided
    if (selectedFile && selectedFile.size > 0) {
      const maxSize = uploadData.type === 'video' ? 500 : 50;
      if (!supabaseService.validateFileSize(selectedFile, maxSize)) {
        toast({
          title: "File Too Large",
          description: `File size must be less than ${maxSize}MB`,
          variant: "destructive"
        });
        return;
      }
    }

    setUploading(true);
    setSyncStatus('syncing');

    try {
      let description = uploadData.description;
      if (uploadData.type === 'summary') {
        const summaryTypeLabel = uploadData.summaryType === 'audio' ? 'Audio Summary' : 'PDF Summary';
        description = description ? `${summaryTypeLabel}: ${description}` : summaryTypeLabel;
      }

      let finalUrl = linkUrl;
      if (linkUrl && supabaseService.isGoogleDriveUrl(linkUrl)) {
        finalUrl = supabaseService.convertGoogleDriveUrl(linkUrl);
        toast({
          title: "Google Drive Link Detected",
          description: "Converting to proper sharing format...",
        });
      }

      const materialData = {
        teacher_id: currentUser.id,
        title: uploadData.title,
        description: description || undefined,
        type: uploadData.type,
        url: finalUrl || undefined,
        file_path: (!finalUrl && selectedFile) ? `content/${Date.now()}-${selectedFile.name}` : undefined,
        subject_id: uploadData.subject_id,
        chapter_id: uploadData.chapter_id,
        grade: parseInt(uploadData.grade),
        is_public: true
      };

      const { error } = await supabaseService.createStudyMaterial(materialData);
      if (error) throw error;

      toast({
        title: "Upload Successful",
        description: `${uploadData.title} has been uploaded and synced to student portal`,
      });

      // Reset form
      setUploadData({
        title: '',
        description: '',
        subject_id: '',
        chapter_id: '',
        grade: '',
        type: 'textbook',
        summaryType: 'pdf'
      });
      setSelectedFile(null);
      setLinkUrl('');

      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setSyncStatus('synced');
      await loadContent();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will remove it from the student portal immediately.`)) {
      return;
    }

    setSyncStatus('syncing');
    try {
      const { error } = await supabaseService.deleteStudyMaterial(id);
      if (error) throw error;
      
      toast({
        title: "Content Deleted",
        description: `${title} has been deleted and removed from student portal`,
      });
      
      setSyncStatus('synced');
      await loadContent();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete content",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#2979FF]" />
          <p className="text-[#E0E0E0]">Loading content management system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Content Upload & Management</h1>
        <p className="text-[#E0E0E0] mb-4">Upload and manage educational content with real-time sync to student portal</p>

        <StatusCards
          subjectsCount={dbSubjects.length}
          chaptersCount={chapters.length}
          contentCount={contentList.length}
        />

        <SyncStatusIndicator syncStatus={syncStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UploadForm
          uploadData={uploadData}
          setUploadData={setUploadData}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          linkUrl={linkUrl}
          setLinkUrl={setLinkUrl}
          uploading={uploading}
          filteredSubjects={filteredSubjects}
          availableChapters={availableChapters}
          onUpload={handleUpload}
          onSyncChapters={handleSyncChapters}
          syncStatus={syncStatus}
        />

        <ContentList
          contentList={contentList}
          onRefresh={loadContent}
          onDelete={handleDelete}
        />
      </div>

      <SyncStatusBanner />
    </div>
  );
};

export default ContentUploader;
