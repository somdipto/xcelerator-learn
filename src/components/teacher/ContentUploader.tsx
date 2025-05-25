
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Video, Image, File } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ContentUploader = () => {
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    subject: '',
    chapter: '',
    grade: '',
    type: 'video'
  });

  const contentTypes = [
    { value: 'video', label: 'Video Lecture', icon: Video },
    { value: 'document', label: 'Document/PDF', icon: FileText },
    { value: 'image', label: 'Image/Diagram', icon: Image },
    { value: 'file', label: 'Other File', icon: File }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully`
      });

      // Save to localStorage for sync with student app
      const contentData = {
        id: Date.now().toString(),
        ...uploadData,
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString()
      };

      const existingContent = JSON.parse(localStorage.getItem('teacherContent') || '[]');
      const updatedContent = [...existingContent, contentData];
      localStorage.setItem('teacherContent', JSON.stringify(updatedContent));
      localStorage.setItem('studentContent', JSON.stringify(updatedContent)); // Sync with student app

      // Reset form
      setUploadData({
        title: '',
        description: '',
        subject: '',
        chapter: '',
        grade: '',
        type: 'video'
      });
    }
  };

  return (
    <div className="p-6">
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
              <Label htmlFor="title" className="text-[#E0E0E0]">Content Title</Label>
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
                <Label className="text-[#E0E0E0]">Grade</Label>
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
              <Label htmlFor="subject" className="text-[#E0E0E0]">Subject</Label>
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
              <Label htmlFor="file" className="text-[#E0E0E0]">Choose File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileUpload}
                className="bg-[#121212] border-[#424242] text-white file:bg-[#2979FF] file:text-white file:border-0 file:rounded file:px-4 file:py-2"
                accept="video/*,image/*,.pdf,.doc,.docx,.ppt,.pptx"
              />
            </div>

            <Button
              className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
              disabled={!uploadData.title || !uploadData.subject}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
          </CardContent>
        </Card>

        {/* Recent Uploads */}
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-3 p-3 bg-[#121212] rounded-lg">
                  <Video className="h-8 w-8 text-[#2979FF]" />
                  <div className="flex-1">
                    <div className="font-medium text-white">Math Lesson {item}</div>
                    <div className="text-sm text-[#E0E0E0]">Class 10 • Mathematics</div>
                    <div className="text-xs text-[#666666]">Uploaded 2 hours ago</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentUploader;
