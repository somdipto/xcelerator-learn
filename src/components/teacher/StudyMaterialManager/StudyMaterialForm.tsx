
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseService, Subject } from '../../../services/supabaseService';

interface StudyMaterialFormProps {
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  onCancel: () => void;
}

const StudyMaterialForm: React.FC<StudyMaterialFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'pdf' | 'link' | 'other'>('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [grade, setGrade] = useState<number>(8);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    loadSubjects();
    
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setType(initialData.type);
      setUrl(initialData.url || '');
      setSubjectId(initialData.subjectId || '');
      setChapterId(initialData.chapterId || '');
      setGrade(initialData.grade || 8);
    } else {
      setTitle('');
      setDescription('');
      setType('link');
      setUrl('');
      setFile(null);
      setSubjectId('');
      setChapterId('');
      setGrade(8);
    }
  }, [initialData]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabaseService.getSubjects();
      if (error) {
        console.error('Error loading subjects:', error);
        return;
      }
      setSubjects(data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('grade', grade.toString());
    if (subjectId) formData.append('subjectId', subjectId);
    if (chapterId) formData.append('chapterId', chapterId);

    if (type === 'link' || type === 'video') {
      formData.append('url', url);
    } else if (file) {
      formData.append('file', file);
    }

    if (initialData?.id) {
      formData.append('id', initialData.id);
    }

    onSubmit(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      if (type !== 'link' && type !== 'video') {
        setUrl('');
      }
    }
  };

  const handleTypeChange = (value: string) => {
    const newType = value as 'video' | 'pdf' | 'link' | 'other';
    setType(newType);
    setUrl('');
    setFile(null);
  };

  // Filter subjects by selected grade
  const gradeSubjects = subjects.filter(subject => subject.grade === grade);

  return (
    <Card className="bg-[#2C2C2C] border-[#424242]">
      <CardHeader>
        <CardTitle className="text-white">
          {initialData ? 'Edit Study Material' : 'Add New Study Material'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#E0E0E0]">Title *</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
                placeholder="Enter material title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-[#E0E0E0]">Grade *</Label>
              <Select value={grade.toString()} onValueChange={(value) => setGrade(parseInt(value))} required>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                  {[8, 9, 10, 11, 12].map(g => (
                    <SelectItem key={g} value={g.toString()} className="text-white hover:bg-[#424242]">
                      Class {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#E0E0E0]">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
              placeholder="Enter material description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-[#E0E0E0]">Material Type *</Label>
            <Select value={type} onValueChange={handleTypeChange} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                <SelectItem value="link" className="text-white hover:bg-[#424242]">External Link</SelectItem>
                <SelectItem value="video" className="text-white hover:bg-[#424242]">Video (URL)</SelectItem>
                <SelectItem value="pdf" className="text-white hover:bg-[#424242]">PDF Document</SelectItem>
                <SelectItem value="other" className="text-white hover:bg-[#424242]">Other File</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(type === 'link' || type === 'video') && (
            <div className="space-y-2">
              <Label htmlFor="url" className="text-[#E0E0E0]">URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required={type === 'link' || type === 'video'}
                className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
                placeholder="Enter URL (e.g., https://example.com)"
              />
            </div>
          )}

          {(type === 'pdf' || type === 'other') && (
            <div className="space-y-2">
              <Label htmlFor="file" className="text-[#E0E0E0]">
                {initialData?.filePath ? 'Replace File' : 'Upload File *'}
              </Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                accept={type === 'pdf' ? '.pdf' : '*/*'}
                required={!initialData && (type === 'pdf' || type === 'other')}
                className="bg-[#121212] border-[#424242] text-white file:bg-[#2979FF] file:text-white file:border-0 file:rounded file:px-3 file:py-1"
              />
              {initialData?.filePath && (
                <p className="text-sm text-[#666666]">
                  Current file: {initialData.filePath.split('/').pop()}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subjectId" className="text-[#E0E0E0]">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select subject (optional)" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                {gradeSubjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id} className="text-white hover:bg-[#424242]">
                    {subject.icon} {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chapterId" className="text-[#E0E0E0]">Chapter ID</Label>
            <Input
              id="chapterId"
              type="text"
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
              placeholder="e.g., chapter-1 (optional)"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="bg-[#00E676] text-black hover:bg-[#00E676]/90 flex-1"
            >
              {initialData ? 'Update Material' : 'Add Material'}
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
      </CardContent>
    </Card>
  );
};

export default StudyMaterialForm;
