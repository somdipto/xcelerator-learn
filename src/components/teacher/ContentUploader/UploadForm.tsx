
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, RefreshCw, BookOpen, Video, FileText, FileSliders, Trophy, FileAudio } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import type { Subject } from '@/services/dataService';

interface UploadData {
  title: string;
  description: string;
  subject_id: string;
  chapter_id: string;
  grade: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  summaryType: 'pdf' | 'audio';
}

interface UploadFormProps {
  uploadData: UploadData;
  setUploadData: React.Dispatch<React.SetStateAction<UploadData>>;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  uploading: boolean;
  filteredSubjects: Subject[];
  availableChapters: string[];
  onUpload: () => void;
  onSyncChapters: () => void;
  syncStatus: 'idle' | 'syncing' | 'synced';
}

const UploadForm: React.FC<UploadFormProps> = ({
  uploadData,
  setUploadData,
  selectedFile,
  setSelectedFile,
  linkUrl,
  setLinkUrl,
  uploading,
  filteredSubjects,
  availableChapters,
  onUpload,
  onSyncChapters,
  syncStatus
}) => {
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
          <Select value={uploadData.type} onValueChange={(value: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz') => setUploadData({...uploadData, type: value})}>
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
              onValueChange={(value: 'pdf' | 'audio') => setUploadData({...uploadData, summaryType: value})}
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

        {/* Step 6: File Upload or Link */}
        <div className="space-y-3">
          <Label className="text-[#E0E0E0]">
            Step 6: Upload Content *
          </Label>

          {/* Google Drive URL Input */}
          <div>
            <Label htmlFor="url" className="text-[#E0E0E0] text-sm">
              Google Drive Link (Recommended - saves database space)
            </Label>
            <Input
              id="url"
              type="url"
              placeholder={uploadData.type === 'quiz' ?
                "https://forms.google.com/quiz-link" :
                uploadData.type === 'video' ?
                "https://drive.google.com/file/d/your-video-id/view" :
                "https://drive.google.com/file/d/your-file-id/view"
              }
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="bg-[#121212] border-[#424242] text-white"
            />
            {linkUrl && supabaseService.isGoogleDriveUrl(linkUrl) && (
              <p className="text-sm text-[#00E676] mt-1 flex items-center gap-2">
                <span>✓ Valid Google Drive link detected</span>
              </p>
            )}
            {linkUrl && !supabaseService.isGoogleDriveUrl(linkUrl) && uploadData.type !== 'quiz' && (
              <p className="text-sm text-[#FFA726] mt-1">
                ⚠ For best compatibility, use Google Drive links
              </p>
            )}
          </div>

          {/* File Upload - Alternative option */}
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
              {uploadData.type === 'summary' && (
                <p className="text-xs text-[#999999] mt-1">
                  {uploadData.summaryType === 'audio'
                    ? 'Accepted formats: MP3, WAV, M4A'
                    : 'Accepted format: PDF'}
                </p>
              )}
            </div>
          )}

          {/* Status indicators */}
          {selectedFile && (
            <p className="text-sm text-[#00E676] mt-1">
              File selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </p>
          )}

          {/* Help text */}
          <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg p-3">
            <p className="text-xs text-[#E0E0E0] mb-2">
              <strong>💡 Pro Tip:</strong> Use Google Drive links to:
            </p>
            <ul className="text-xs text-[#CCCCCC] space-y-1 ml-4">
              <li>• Save database storage space</li>
              <li>• Enable easy content updates</li>
              <li>• Share large files efficiently</li>
              <li>• Maintain version control</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onUpload}
            className="w-full bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
            disabled={uploading || !uploadData.title || !uploadData.subject_id || !uploadData.chapter_id || !uploadData.grade || (!linkUrl && !selectedFile)}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Content'}
          </Button>

          <Button
            onClick={onSyncChapters}
            variant="outline"
            className="w-full border-[#00E676] text-[#00E676] hover:bg-[#00E676]/10"
            disabled={syncStatus === 'syncing'}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            {syncStatus === 'syncing' ? 'Syncing Chapters...' : 'Sync Chapters from Curriculum'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
