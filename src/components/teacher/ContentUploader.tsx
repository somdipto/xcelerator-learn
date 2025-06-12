
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, RefreshCw, CheckCircle, AlertCircle, BookOpen, Video, FileText, FileSliders, Trophy, FileAudio } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDemoAuth } from '@/components/auth/DemoAuthProvider';
import { subjects } from '@/data/subjects';

interface UploadData {
  title: string;
  description: string;
  subject: string;
  chapter: string;
  grade: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  summaryType: 'pdf' | 'audio';
}

interface ContentItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  chapter: string;
  grade: string;
  type: string;
  url?: string;
  filePath?: string;
  createdAt: string;
}

const ContentUploader = () => {
  const { user } = useDemoAuth();
  const [uploadData, setUploadData] = useState<UploadData>({
    title: '',
    description: '',
    subject: '',
    chapter: '',
    grade: '',
    type: 'textbook',
    summaryType: 'pdf'
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  
  // Get available subjects and chapters based on selected grade
  const availableSubjects = uploadData.grade ? 
    Object.keys(subjects).filter(subject => 
      subjects[subject as keyof typeof subjects].chapters[parseInt(uploadData.grade) as keyof typeof subjects[keyof typeof subjects]['chapters']]
    ) : [];

  const availableChapters = uploadData.subject && uploadData.grade ? 
    subjects[uploadData.subject as keyof typeof subjects]?.chapters[parseInt(uploadData.grade) as keyof typeof subjects[keyof typeof subjects]['chapters']] || [] : [];

  useEffect(() => {
    // Load existing content from localStorage
    const savedContent = localStorage.getItem('teacherContent');
    if (savedContent) {
      try {
        setContentList(JSON.parse(savedContent));
      } catch (error) {
        console.error('Error loading content:', error);
      }
    }
  }, []);

  const contentTypes = [
    { value: 'textbook', label: 'Textbook/PDF', icon: BookOpen },
    { value: 'video', label: 'Video Lecture', icon: Video },
    { value: 'summary', label: 'Summary Notes', icon: FileText },
    { value: 'ppt', label: 'Presentation (PPT)', icon: FileSliders },
    { value: 'quiz', label: 'Quiz/Assessment', icon: Trophy }
  ];

  const summaryTypes = [
    { value: 'pdf', label: 'PDF Summary', icon: FileText },
    { value: 'audio', label: 'Audio Summary', icon: FileAudio }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setLinkUrl(''); // Clear URL if file is selected
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload content",
        variant: "destructive"
      });
      return;
    }

    // Validation
    if (!uploadData.title || !uploadData.subject || !uploadData.chapter || !uploadData.grade) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const needsFile = uploadData.type !== 'quiz' && uploadData.type !== 'video';
    const needsUrl = uploadData.type === 'quiz' || uploadData.type === 'video';

    if (needsFile && !selectedFile && !linkUrl) {
      toast({
        title: "Missing Content",
        description: "Please provide either a file or a link",
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

    setUploading(true);
    setSyncStatus('syncing');

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));

      let description = uploadData.description;
      if (uploadData.type === 'summary') {
        const summaryTypeLabel = uploadData.summaryType === 'audio' ? 'Audio Summary' : 'PDF Summary';
        description = description ? `${summaryTypeLabel}: ${description}` : summaryTypeLabel;
      }

      const newContent: ContentItem = {
        id: `content-${Date.now()}`,
        title: uploadData.title,
        description: description || '',
        subject: uploadData.subject,
        chapter: uploadData.chapter,
        grade: uploadData.grade,
        type: uploadData.type,
        url: linkUrl || undefined,
        filePath: selectedFile ? `uploads/${selectedFile.name}` : undefined,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage (simulating database)
      const updatedContent = [...contentList, newContent];
      setContentList(updatedContent);
      localStorage.setItem('teacherContent', JSON.stringify(updatedContent));

      // Also save to subject-specific storage for student access
      const studentContentKey = `studentContent_${uploadData.subject}_${uploadData.grade}`;
      const existingStudentContent = JSON.parse(localStorage.getItem(studentContentKey) || '[]');
      existingStudentContent.push({
        ...newContent,
        teacherName: user.name,
        embedInChapter: uploadData.chapter
      });
      localStorage.setItem(studentContentKey, JSON.stringify(existingStudentContent));

      toast({
        title: "Upload Successful! 🎉",
        description: `${uploadData.title} has been uploaded and synced to student portal`,
      });

      // Reset form
      setUploadData({
        title: '',
        description: '',
        subject: '',
        chapter: '',
        grade: '',
        type: 'textbook',
        summaryType: 'pdf'
      });
      setSelectedFile(null);
      setLinkUrl('');

      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setSyncStatus('synced');
      
      // Reset sync status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000);

    } catch (error) {
      console.error('Upload error:', error);
      setSyncStatus('idle');
      toast({
        title: "Upload Failed",
        description: "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      const updatedContent = contentList.filter(item => item.id !== contentId);
      setContentList(updatedContent);
      localStorage.setItem('teacherContent', JSON.stringify(updatedContent));
      
      toast({
        title: "Content Deleted",
        description: "Content has been removed from the system",
      });
    }
  };

  const getAcceptedFileTypes = () => {
    if (uploadData.type === 'video') return 'video/*';
    if (uploadData.type === 'textbook' || uploadData.type === 'ppt') return '.pdf,.ppt,.pptx';
    if (uploadData.type === 'summary') {
      return uploadData.summaryType === 'audio' ? 'audio/*,.mp3,.wav,.m4a' : '.pdf';
    }
    return '*/*';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Content Upload & Management</h1>
        <p className="text-[#E0E0E0] mb-4">Upload and manage educational content with real-time sync to student portal</p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#E0E0E0]">Total Content</p>
                  <p className="text-2xl font-bold text-[#00E676]">{contentList.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-[#00E676]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#E0E0E0]">Active Subjects</p>
                  <p className="text-2xl font-bold text-[#2979FF]">{availableSubjects.length}</p>
                </div>
                <Video className="h-8 w-8 text-[#2979FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#E0E0E0]">Sync Status</p>
                  <div className="flex items-center gap-2">
                    {syncStatus === 'syncing' && <RefreshCw className="h-4 w-4 animate-spin text-[#FFA726]" />}
                    {syncStatus === 'synced' && <CheckCircle className="h-4 w-4 text-[#00E676]" />}
                    {syncStatus === 'idle' && <div className="h-4 w-4 rounded-full bg-[#666666]" />}
                    <span className="text-sm text-white capitalize">{syncStatus}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload New Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Grade Selection */}
            <div>
              <Label className="text-[#E0E0E0]">Step 1: Select Grade *</Label>
              <Select value={uploadData.grade} onValueChange={(value) => setUploadData({...uploadData, grade: value, subject: '', chapter: ''})}>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Choose class/grade first" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {[8, 9, 10, 11, 12].map(grade => (
                    <SelectItem key={grade} value={grade.toString()} className="text-white">
                      Class {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            <div>
              <Label className="text-[#E0E0E0]">Step 2: Select Subject *</Label>
              <Select 
                value={uploadData.subject} 
                onValueChange={(value) => setUploadData({...uploadData, subject: value, chapter: ''})}
                disabled={!uploadData.grade}
              >
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder={uploadData.grade ? "Choose subject" : "Select grade first"} />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {availableSubjects.map(subject => (
                    <SelectItem key={subject} value={subject} className="text-white">
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Chapter Selection */}
            <div>
              <Label className="text-[#E0E0E0]">Step 3: Select Chapter *</Label>
              <Select 
                value={uploadData.chapter} 
                onValueChange={(value) => setUploadData({...uploadData, chapter: value})}
                disabled={!uploadData.subject}
              >
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder={uploadData.subject ? "Choose chapter" : "Select subject first"} />
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

            {/* Content Details */}
            <div>
              <Label htmlFor="title" className="text-[#E0E0E0]">Step 4: Content Title *</Label>
              <Input
                id="title"
                value={uploadData.title}
                onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Introduction to Algebra"
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
              />
            </div>

            {/* Content Type */}
            <div>
              <Label className="text-[#E0E0E0]">Step 5: Content Type</Label>
              <Select value={uploadData.type} onValueChange={(value: any) => setUploadData({...uploadData, type: value})}>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                  {contentTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value} className="text-white">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Summary Type Selection */}
            {uploadData.type === 'summary' && (
              <div>
                <Label className="text-[#E0E0E0]">Step 5b: Summary Type *</Label>
                <Select 
                  value={uploadData.summaryType} 
                  onValueChange={(value: any) => setUploadData({...uploadData, summaryType: value})}
                >
                  <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                    <SelectValue placeholder="Choose summary type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2C2C2C]">
                    {summaryTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value} className="text-white">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* File Upload or Link */}
            <div className="space-y-3">
              <Label className="text-[#E0E0E0]">Step 6: Upload Content *</Label>

              {/* Link Input */}
              <div>
                <Label htmlFor="url" className="text-[#E0E0E0] text-sm">
                  Link/URL {(uploadData.type === 'quiz' || uploadData.type === 'video') && '(Required)'}
                </Label>
                <Input
                  id="url"
                  type="url"
                  placeholder={uploadData.type === 'quiz' ? 
                    "https://forms.google.com/quiz-link" :
                    "https://drive.google.com/file/d/your-file-id/view"
                  }
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="bg-[#121212] border-[#424242] text-white"
                />
              </div>

              {/* File Upload */}
              {uploadData.type !== 'quiz' && uploadData.type !== 'video' && (
                <div>
                  <Label htmlFor="file" className="text-[#E0E0E0] text-sm">
                    Or Upload File Directly
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    className="bg-[#121212] border-[#424242] text-white file:bg-[#2979FF] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                    accept={getAcceptedFileTypes()}
                  />
                  {selectedFile && (
                    <p className="text-sm text-[#00E676] mt-1">
                      File selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleUpload}
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
              disabled={uploading || !uploadData.title || !uploadData.subject || !uploadData.chapter || !uploadData.grade || (!linkUrl && !selectedFile)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Uploaded Content</span>
              <span className="text-sm bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded">
                {contentList.length} items
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {contentList.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-[#666666] mx-auto mb-4" />
                  <p className="text-[#666666]">No content uploaded yet</p>
                </div>
              ) : (
                contentList.map((item) => (
                  <div key={item.id} className="bg-[#2C2C2C] p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.title}</h4>
                        <p className="text-sm text-[#E0E0E0]">{item.description}</p>
                        <div className="text-xs text-[#999999] mt-1">
                          Class {item.grade} • {item.subject} • {item.chapter}
                        </div>
                        <div className="text-xs text-[#666666]">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      {syncStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 bg-[#1A1A1A] border border-[#2C2C2C] rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            {syncStatus === 'syncing' && (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-[#FFA726]" />
                <span className="text-white">Syncing with student portal...</span>
              </>
            )}
            {syncStatus === 'synced' && (
              <>
                <CheckCircle className="h-5 w-5 text-[#00E676]" />
                <span className="text-white">Content synced successfully!</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentUploader;
