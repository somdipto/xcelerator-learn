
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Video, Image, File, Trash2, Eye, RefreshCw, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabaseService, StudyMaterial, Subject } from '@/services/supabaseService';
import { subjects } from '@/data/subjects';

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
    type: 'video' as 'video' | 'pdf' | 'link' | 'other'
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
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);

  const contentTypes = [
    { value: 'video', label: 'Video Lecture', icon: Video },
    { value: 'pdf', label: 'PDF Document', icon: FileText },
    { value: 'link', label: 'External Link', icon: Image },
    { value: 'other', label: 'Other File', icon: File }
  ];

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
      // Reset subject and chapter when grade changes
      setUploadData(prev => ({ ...prev, subject_id: '', chapter_id: '' }));
      setAvailableChapters([]);
    } else {
      setFilteredSubjects([]);
    }
  }, [uploadData.grade, dbSubjects]);

  // Filter chapters when subject changes
  useEffect(() => {
    if (uploadData.subject_id && uploadData.grade) {
      // Find the subject from our static data
      const selectedSubject = dbSubjects.find(s => s.id === uploadData.subject_id);
      if (selectedSubject) {
        // Get chapters from our static subjects data
        const subjectData = subjects[selectedSubject.name as keyof typeof subjects];
        if (subjectData && subjectData.chapters[parseInt(uploadData.grade) as keyof typeof subjectData.chapters]) {
          const chaptersList = subjectData.chapters[parseInt(uploadData.grade) as keyof typeof subjectData.chapters];
          setAvailableChapters(chaptersList || []);
        } else {
          setAvailableChapters([]);
        }
      }
      // Reset chapter when subject changes
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
      
      // Type-safe transformation
      const typedData: ContentItem[] = (data || []).map(item => ({
        ...item,
        type: item.type as 'video' | 'pdf' | 'link' | 'other'
      }));
      
      setContentList(typedData);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const getFileForUpload = () => {
    if (uploadData.type === 'link') {
      // For links, create a dummy file object with the URL as the name
      return { name: linkUrl } as File;
    }
    return selectedFile;
  };

  const handleUpload = async () => {
    const fileToUpload = getFileForUpload();
    
    if (!fileToUpload && uploadData.type !== 'link') {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file or provide a link",
        variant: "destructive"
      });
      return;
    }

    if (!uploadData.title || !uploadData.subject_id || !uploadData.chapter_id || !uploadData.grade) {
      toast({
        title: "Missing Information", 
        description: "Please fill in all required fields: title, grade, subject, and chapter",
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

    setUploading(true);
    setSyncStatus('syncing');
    
    try {
      const materialData = {
        teacher_id: currentUser.id,
        title: uploadData.title,
        description: uploadData.description || undefined,
        type: uploadData.type,
        url: uploadData.type === 'link' ? linkUrl : undefined,
        file_path: uploadData.type !== 'link' ? `content/${Date.now()}-${fileToUpload?.name}` : undefined,
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
        type: 'video'
      });
      setSelectedFile(null);
      setLinkUrl('');
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setSyncStatus('synced');
      await loadContent();
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload content. Please try again.",
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

  const getSyncStatusIndicator = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center gap-2 text-[#FFA726]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Syncing to student portal...</span>
          </div>
        );
      case 'synced':
        return (
          <div className="flex items-center gap-2 text-[#00E676]">
            <Users className="h-4 w-4" />
            <span className="text-sm">✓ Synced with student portal</span>
          </div>
        );
      default:
        return null;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    const iconMap = {
      video: Video,
      pdf: FileText,
      link: Image,
      other: File
    };
    return iconMap[type as keyof typeof iconMap] || File;
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
        <p className="text-[#E0E0E0]">Upload and manage educational content with real-time sync to student portal</p>
        {getSyncStatusIndicator()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Upload Form */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Grade Selection */}
            <div>
              <Label className="text-[#E0E0E0]">Step 1: Select Grade *</Label>
              <Select value={uploadData.grade} onValueChange={(value) => setUploadData({...uploadData, grade: value})}>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Choose class/grade first" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {Array.from({length: 12}, (_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()} className="text-white">
                      Class {i+1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Subject Selection */}
            <div>
              <Label className="text-[#E0E0E0]">Step 2: Select Subject *</Label>
              <Select 
                value={uploadData.subject_id} 
                onValueChange={(value) => setUploadData({...uploadData, subject_id: value})}
                disabled={!uploadData.grade}
              >
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder={uploadData.grade ? "Choose subject" : "Select grade first"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {filteredSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id} className="text-white">
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Chapter Selection */}
            <div>
              <Label className="text-[#E0E0E0]">Step 3: Select Chapter *</Label>
              <Select 
                value={uploadData.chapter_id} 
                onValueChange={(value) => setUploadData({...uploadData, chapter_id: value})}
                disabled={!uploadData.subject_id}
              >
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder={uploadData.subject_id ? "Choose chapter" : "Select subject first"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {availableChapters.map((chapter, index) => (
                    <SelectItem key={index} value={chapter} className="text-white">
                      {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 4: Content Details */}
            <div>
              <Label htmlFor="title" className="text-[#E0E0E0]">Step 4: Content Title *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Introduction Video"
                disabled={!uploadData.chapter_id}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-[#E0E0E0]">Description</Label>
              <Textarea
                id="description"
                value={uploadData.description}
                onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="Brief description of the content"
                disabled={!uploadData.chapter_id}
              />
            </div>

            {/* Step 5: Content Type */}
            <div>
              <Label className="text-[#E0E0E0]">Step 5: Content Type</Label>
              <Select value={uploadData.type} onValueChange={(value: 'video' | 'pdf' | 'link' | 'other') => setUploadData({...uploadData, type: value})}>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 6: File Upload or Link */}
            <div>
              <Label htmlFor="file" className="text-[#E0E0E0]">
                Step 6: {uploadData.type === 'link' ? 'Content URL *' : 'Choose File *'}
              </Label>
              {uploadData.type === 'link' ? (
                <Input
                  type="url"
                  placeholder="https://example.com/video-or-resource"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-[#121212] border-[#424242] text-white"
                />
              ) : (
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  className="bg-[#121212] border-[#424242] text-white file:bg-[#2979FF] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                  accept={uploadData.type === 'video' ? 'video/*' : uploadData.type === 'pdf' ? '.pdf' : '*/*'}
                />
              )}
              {((uploadData.type === 'link' && linkUrl) || (uploadData.type !== 'link' && selectedFile)) && (
                <p className="text-sm text-[#00E676] mt-1">
                  {uploadData.type === 'link' ? 'URL ready' : `Selected: ${selectedFile?.name} (${selectedFile ? formatFileSize(selectedFile.size) : ''})`}
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
              disabled={uploading || !uploadData.title || !uploadData.subject_id || !uploadData.chapter_id || !uploadData.grade || (uploadData.type === 'link' ? !linkUrl : !selectedFile)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Content List */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Uploaded Content ({contentList.length})</span>
              <Button
                onClick={loadContent}
                variant="outline"
                size="sm"
                className="border-[#424242] text-[#2979FF] hover:bg-[#2979FF]/10"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contentList.length === 0 ? (
              <div className="text-center text-[#E0E0E0] py-8">
                <Upload className="h-12 w-12 mx-auto mb-4 text-[#666666]" />
                <p>No content uploaded yet</p>
                <p className="text-sm text-[#666666]">Upload your first content using the form on the left</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contentList.map((content) => {
                  const IconComponent = getFileIcon(content.type);
                  return (
                    <div key={content.id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg">
                      <IconComponent className="h-8 w-8 text-[#2979FF] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{content.title}</div>
                        <div className="text-sm text-[#E0E0E0]">
                          {content.subjects?.name} • Class {content.subjects?.grade}
                          {content.chapters?.name && ` • ${content.chapters.name}`}
                        </div>
                        <div className="text-xs text-[#666666] flex items-center gap-2">
                          <span className="bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded text-xs">
                            {content.type.toUpperCase()}
                          </span>
                          <span>{new Date(content.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {content.url && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[#00E676] hover:bg-[#00E676]/10"
                            onClick={() => window.open(content.url, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#FF7043] hover:bg-[#FF7043]/10"
                          onClick={() => handleDelete(content.id, content.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Banner */}
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[#E0E0E0] font-medium mb-1">Real-time Sync Status</h4>
              <p className="text-[#999999] text-sm">
                All content changes are automatically synced to the student portal in real-time.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[#00E676]">
              <div className="w-2 h-2 bg-[#00E676] rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Sync Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentUploader;
