
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, BookOpen, Video, FileText, FileSliders, Trophy } from 'lucide-react';
import { subjects } from '@/data/subjects';
import { dataService } from '@/services/dataService';
import { useIsMobile } from '@/hooks/use-mobile';

interface SecureStudyMaterialFormProps {
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  onCancel: () => void;
}

const SecureStudyMaterialForm: React.FC<SecureStudyMaterialFormProps> = ({ 
  onSubmit, 
  initialData, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'>('textbook');
  const [url, setUrl] = useState('');
  const [grade, setGrade] = useState<number>(8);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setType(initialData.type);
      setUrl(initialData.url || '');
      setGrade(initialData.grade || 8);
      setSelectedSubject(initialData.subjectId || '');
      setSelectedChapter(initialData.chapterId || '');
    } else {
      // Reset form
      setTitle('');
      setDescription('');
      setType('textbook');
      setUrl('');
      setGrade(8);
      setSelectedSubject('');
      setSelectedChapter('');
    }
  }, [initialData]);

  useEffect(() => {
    // Load subjects for the selected grade from frontend data
    const gradeSubjects = Object.entries(subjects).filter(([subjectName, subjectData]) => {
      return subjectData.chapters[grade as keyof typeof subjectData.chapters];
    });
    
    setAvailableSubjects(gradeSubjects.map(([name, data], index) => ({
      id: `${name.toLowerCase().replace(' ', '-')}-${grade}`,
      name,
      icon: data.icon,
      grade
    })));
    
    // Reset selections when grade changes
    setSelectedSubject('');
    setSelectedChapter('');
    setAvailableChapters([]);
  }, [grade]);

  useEffect(() => {
    // Load chapters when subject is selected
    if (selectedSubject && grade) {
      const subjectName = selectedSubject.split('-')[0].replace('-', ' ');
      const subjectData = Object.entries(subjects).find(([name]) => 
        name.toLowerCase().replace(' ', '-') === subjectName
      );
      
      if (subjectData) {
        const [, data] = subjectData;
        const chapters = data.chapters[grade as keyof typeof data.chapters] || [];
        setAvailableChapters(chapters);
      }
    } else {
      setAvailableChapters([]);
    }
    setSelectedChapter('');
  }, [selectedSubject, grade]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('url', url);
    formData.append('grade', grade.toString());
    formData.append('subjectId', selectedSubject);
    formData.append('chapterId', selectedChapter);

    if (initialData?.id) {
      formData.append('id', initialData.id);
    }

    onSubmit(formData);
  };

  const contentTypes = [
    { value: 'textbook', label: 'Textbook/PDF', icon: BookOpen },
    { value: 'video', label: 'Video Lecture', icon: Video },
    { value: 'summary', label: 'Summary Notes', icon: FileText },
    { value: 'ppt', label: 'Presentation', icon: FileSliders },
    { value: 'quiz', label: 'Quiz/Assessment', icon: Trophy }
  ];

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Grade and Subject Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-[#E0E0E0]">Class/Grade *</Label>
            <Select value={grade.toString()} onValueChange={(value) => setGrade(parseInt(value))} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242] max-h-48 overflow-y-auto">
                {[8, 9, 10, 11, 12].map(g => (
                  <SelectItem key={g} value={g.toString()} className="text-white hover:bg-[#424242]">
                    Class {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-[#E0E0E0]">Subject *</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                {availableSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id} className="text-white hover:bg-[#424242]">
                    <div className="flex items-center gap-2">
                      <span>{subject.icon}</span>
                      <span>{subject.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chapter Selection */}
        <div className="space-y-2">
          <Label htmlFor="chapter" className="text-[#E0E0E0]">Chapter *</Label>
          <Select 
            value={selectedChapter} 
            onValueChange={setSelectedChapter} 
            required
            disabled={!selectedSubject}
          >
            <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
              <SelectValue placeholder={selectedSubject ? "Select chapter" : "Select subject first"} />
            </SelectTrigger>
            <SelectContent className="bg-[#2C2C2C] border-[#424242] max-h-60 overflow-y-auto">
              {availableChapters.map((chapter, index) => (
                <SelectItem key={index} value={chapter} className="text-white hover:bg-[#424242] py-3">
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded flex-shrink-0">
                      Ch.{index + 1}
                    </span>
                    <span className="flex-1 text-left text-sm">{chapter}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-[#E0E0E0]">Content Title *</Label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
            placeholder="Enter descriptive title for the study material"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-[#E0E0E0]">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
            placeholder="Brief description of the content"
            rows={3}
          />
        </div>

        {/* Content Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-[#E0E0E0]">Content Type *</Label>
          <Select value={type} onValueChange={(value: any) => setType(value)} required>
            <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent className="bg-[#2C2C2C] border-[#424242]">
              {contentTypes.map((contentType) => {
                const IconComponent = contentType.icon;
                return (
                  <SelectItem key={contentType.value} value={contentType.value} className="text-white hover:bg-[#424242]">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{contentType.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url" className="text-[#E0E0E0]">
            {type === 'quiz' ? 'Google Forms Quiz URL *' : 'Google Drive Link *'}
          </Label>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
            placeholder={
              type === 'quiz' 
                ? 'https://forms.google.com/...' 
                : 'https://drive.google.com/file/d/...'
            }
          />
          <p className="text-xs text-[#999999]">
            {type === 'quiz' 
              ? 'Paste your Google Forms quiz link here'
              : 'Share your file from Google Drive and paste the link here'
            }
          </p>
        </div>

        {/* Form Actions */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 pt-4`}>
          <Button 
            type="submit"
            className="bg-[#00E676] text-black hover:bg-[#00E676]/90 flex-1"
            disabled={!title || !selectedSubject || !selectedChapter || !url}
          >
            <Upload className="h-4 w-4 mr-2" />
            {initialData ? 'Update Material' : 'Upload Material'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-[#424242] text-[#E0E0E0] hover:bg-[#424242] flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SecureStudyMaterialForm;
