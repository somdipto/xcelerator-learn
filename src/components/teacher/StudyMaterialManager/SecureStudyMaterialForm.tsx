
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataService } from '@/services/dataService';
import { subjects } from '@/data/subjects';

interface SecureStudyMaterialFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
}

const SecureStudyMaterialForm: React.FC<SecureStudyMaterialFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'>('video');
  const [url, setUrl] = useState('');
  const [grade, setGrade] = useState<number>(8);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get available subjects and chapters from the hardcoded data
  const getAvailableSubjects = () => {
    return Object.keys(subjects);
  };

  const getAvailableChapters = () => {
    if (!selectedSubject || !subjects[selectedSubject as keyof typeof subjects]) {
      return [];
    }
    
    const subjectData = subjects[selectedSubject as keyof typeof subjects];
    return subjectData.chapters[grade as keyof typeof subjectData.chapters] || [];
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!title.trim()) errors.push('Title is required');
    if (!url.trim()) errors.push('URL is required');
    if (!selectedSubject) errors.push('Subject is required');
    if (!selectedChapter) errors.push('Chapter is required');
    
    // Validate Google Drive URL
    if (url && !dataService.isGoogleDriveUrl(url)) {
      errors.push('Please provide a valid Google Drive URL');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('type', type);
      formData.append('url', url.trim());
      formData.append('grade', grade.toString());
      formData.append('subject', selectedSubject); // Pass subject name, not ID
      formData.append('chapter', selectedChapter); // Pass chapter name, not ID
      
      console.log('SecureStudyMaterialForm submitting:', {
        title, description, type, url, grade, subject: selectedSubject, chapter: selectedChapter
      });
      
      await onSubmit(formData);
      
      // Reset form on successful submission
      setTitle('');
      setDescription('');
      setUrl('');
      setSelectedSubject('');
      setSelectedChapter('');
      setValidationErrors([]);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset chapter when subject changes
  useEffect(() => {
    setSelectedChapter('');
  }, [selectedSubject, grade]);

  return (
    <Card className="bg-[#2C2C2C] border-[#424242]">
      <CardHeader>
        <CardTitle className="text-white">Add New Study Material</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
              <div className="text-red-400 text-sm">
                <strong>Please fix the following errors:</strong>
                <ul className="list-disc list-inside mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

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
            <Label htmlFor="subject" className="text-[#E0E0E0]">Subject *</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                {getAvailableSubjects().map(subject => (
                  <SelectItem key={subject} value={subject} className="text-white hover:bg-[#424242]">
                    {subjects[subject as keyof typeof subjects].icon} {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                {getAvailableChapters().map((chapter, index) => (
                  <SelectItem key={index} value={chapter} className="text-white hover:bg-[#424242]">
                    {chapter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type" className="text-[#E0E0E0]">Material Type *</Label>
            <Select value={type} onValueChange={(value: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz') => setType(value)} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                <SelectItem value="video" className="text-white hover:bg-[#424242]">📹 Video Lecture</SelectItem>
                <SelectItem value="textbook" className="text-white hover:bg-[#424242]">📚 Textbook/PDF</SelectItem>
                <SelectItem value="summary" className="text-white hover:bg-[#424242]">📝 Summary Notes</SelectItem>
                <SelectItem value="ppt" className="text-white hover:bg-[#424242]">📊 Presentation</SelectItem>
                <SelectItem value="quiz" className="text-white hover:bg-[#424242]">🏆 Quiz/Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-[#E0E0E0]">Google Drive URL *</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF]"
              placeholder="https://drive.google.com/file/d/..."
            />
            <p className="text-xs text-[#999999]">
              Make sure your Google Drive link is set to "Anyone with the link can view"
            </p>
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

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="bg-[#00E676] text-black hover:bg-[#00E676]/90 flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Material'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="border-[#424242] text-[#E0E0E0] hover:bg-[#424242] flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SecureStudyMaterialForm;
