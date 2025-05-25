
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Video, Image, File, Trash2, Download, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DatabaseService from '@/services/database';

interface ContentItem {
  _id: string;
  title: string;
  description: string;
  subject: string;
  chapter: string;
  grade: number;
  type: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  uploadDate: string;
}

const ContentUploader = () => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subject: '',
    chapter: '',
    grade: '',
    type: 'video'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const contentTypes = [
    { value: 'video', label: 'Video Lecture', icon: Video },
    { value: 'document', label: 'Document/PDF', icon: FileText },
    { value: 'image', label: 'Image/Diagram', icon: Image },
    { value: 'file', label: 'Other File', icon: File }
  ];

  useEffect(() => {
    loadContent();
    
    // Real-time listeners
    DatabaseService.onContentUploaded((content) => {
      setContentList(prev => [content, ...prev]);
    });
    
    DatabaseService.onContentDeleted((id) => {
      setContentList(prev => prev.filter(item => item._id !== id));
    });

    return () => {
      DatabaseService.disconnect();
    };
  }, []);

  const loadContent = async () => {
    try {
      const content = await DatabaseService.getContent();
      setContentList(content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.title || !uploadData.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('subject', uploadData.subject);
      formData.append('chapter', uploadData.chapter);
      formData.append('grade', uploadData.grade);
      formData.append('type', uploadData.type);

      await DatabaseService.uploadContent(formData);
      
      toast({
        title: "Upload Successful",
        description: `${uploadData.title} has been uploaded successfully`
      });

      // Reset form
      setUploadData({
        title: '',
        description: '',
        subject: '',
        chapter: '',
        grade: '',
        type: 'video'
      });
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
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
    try {
      await DatabaseService.deleteContent(id);
      toast({
        title: "Content Deleted",
        description: `${title} has been deleted successfully`
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete content",
        variant: "destructive"
      });
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
      document: FileText,
      image: Image,
      file: File
    };
    return iconMap[type as keyof typeof iconMap] || File;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Content Upload</h1>
        <p className="text-[#E0E0E0]">Upload videos, documents, and other learning materials</p>
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
            <div>
              <Label htmlFor="title" className="text-[#E0E0E0]">Content Title *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-[#E0E0E0]">Grade *</Label>
                <Select value={uploadData.grade} onValueChange={(value) => setUploadData({...uploadData, grade: value})}>
                  <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                    <SelectValue placeholder="Select grade" />
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

              <div>
                <Label className="text-[#E0E0E0]">Content Type</Label>
                <Select value={uploadData.type} onValueChange={(value) => setUploadData({...uploadData, type: value})}>
                  <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                    <SelectValue placeholder="Select type" />
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
            </div>

            <div>
              <Label htmlFor="subject" className="text-[#E0E0E0]">Subject *</Label>
              <Input
                id="subject"
                value={uploadData.subject}
                onChange={(e) => setUploadData({...uploadData, subject: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Mathematics"
              />
            </div>

            <div>
              <Label htmlFor="chapter" className="text-[#E0E0E0]">Chapter</Label>
              <Input
                id="chapter"
                value={uploadData.chapter}
                onChange={(e) => setUploadData({...uploadData, chapter: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Linear Equations"
              />
            </div>

            <div>
              <Label htmlFor="file" className="text-[#E0E0E0]">Choose File *</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                className="bg-[#121212] border-[#424242] text-white file:bg-[#2979FF] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx"
              />
              {selectedFile && (
                <p className="text-sm text-[#00E676] mt-1">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <Button
              onClick={handleUpload}
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
              disabled={uploading || !uploadData.title || !uploadData.subject || !selectedFile}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Uploaded Content ({contentList.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-[#E0E0E0] py-8">Loading content...</div>
            ) : contentList.length === 0 ? (
              <div className="text-center text-[#E0E0E0] py-8">No content uploaded yet</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {contentList.map((content) => {
                  const IconComponent = getFileIcon(content.type);
                  return (
                    <div key={content._id} className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg">
                      <IconComponent className="h-8 w-8 text-[#2979FF] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{content.title}</div>
                        <div className="text-sm text-[#E0E0E0]">
                          Class {content.grade} • {content.subject}
                          {content.chapter && ` • ${content.chapter}`}
                        </div>
                        <div className="text-xs text-[#666666]">
                          {formatFileSize(content.fileSize)} • {new Date(content.uploadDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#00E676] hover:bg-[#00E676]/10"
                          onClick={() => window.open(`http://localhost:3001/${content.filePath}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#FF7043] hover:bg-[#FF7043]/10"
                          onClick={() => handleDelete(content._id, content.title)}
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
    </div>
  );
};

export default ContentUploader;
