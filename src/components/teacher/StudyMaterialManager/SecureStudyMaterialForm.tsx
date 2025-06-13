
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, ExternalLink, Globe } from 'lucide-react';
import { dataService, Subject, Chapter } from '../../../services/dataService';
import { googleDriveService } from '../../../services/googleDriveService';
import { toast } from '@/hooks/use-toast';

interface StudyMaterialFormProps {
  onSubmit: (formData: FormData) => void;
  initialData?: any;
  onCancel: () => void;
}

const SecureStudyMaterialForm: React.FC<StudyMaterialFormProps> = ({ 
  onSubmit, 
  initialData, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'>('textbook');
  const [url, setUrl] = useState('');
  const [grade, setGrade] = useState<number>(10);
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [enableUniversalAccess, setEnableUniversalAccess] = useState(true);
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isValidGoogleDriveUrl, setIsValidGoogleDriveUrl] = useState(false);
  const [urlValidation, setUrlValidation] = useState<{ isValid: boolean; normalizedUrl?: string; fileId?: string }>({ isValid: false });

  useEffect(() => {
    loadSubjects();
    
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || 'textbook');
      setUrl(initialData.url || '');
      setGrade(initialData.grade || 10);
      setSubjectId(initialData.subject_id || '');
      setChapterId(initialData.chapter_id || '');
      setEnableUniversalAccess(initialData.is_public !== false);
    }
  }, [initialData]);

  useEffect(() => {
    if (subjectId) {
      loadChapters();
    } else {
      setChapters([]);
      setChapterId('');
    }
  }, [subjectId]);

  useEffect(() => {
    const validation = googleDriveService.validateAndNormalizeUrl(url);
    setUrlValidation(validation);
    setIsValidGoogleDriveUrl(validation.isValid);
  }, [url]);

  const loadSubjects = async () => {
    try {
      const { data, error } = await dataService.getSubjects(grade);
      if (error) {
        console.error('Error loading subjects:', error);
        return;
      }
      setSubjects(data || []);
    } catch (error) {
      console.error('Failed to load subjects:', error);
    }
  };

  const loadChapters = async () => {
    try {
      const { data, error } = await dataService.getChapters({ subject_id: subjectId });
      if (error) {
        console.error('Error loading chapters:', error);
        return;
      }
      setChapters(data || []);
    } catch (error) {
      console.error('Failed to load chapters:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate Google Drive URL
    if (url && !isValidGoogleDriveUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Drive URL",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('url', urlValidation.normalizedUrl || url); // Use normalized URL
    formData.append('grade', grade.toString());
    formData.append('subjectId', subjectId);
    formData.append('chapterId', chapterId);
    formData.append('universalAccess', enableUniversalAccess.toString());

    if (initialData?.id) {
      formData.append('id', initialData.id);
    }

    onSubmit(formData);
  };

  const handleGradeChange = (newGrade: string) => {
    const gradeNum = parseInt(newGrade);
    setGrade(gradeNum);
    setSubjectId('');
    setChapterId('');
    loadSubjects();
  };

  const previewUrl = isValidGoogleDriveUrl ? googleDriveService.getEmbeddableUrl(url) : '';

  const handleTestUniversalAccess = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      toast({
        title: "Testing Universal Access",
        description: "Opening preview in new tab to test accessibility",
      });
    }
  };

  return (
    <Card className="bg-[#2C2C2C] border-[#424242]">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Globe className="h-5 w-5 text-[#00E676]" />
          {initialData ? 'Edit Study Material' : 'Add New Study Material'}
          <span className="text-sm bg-[#00E676]/20 text-[#00E676] px-2 py-1 rounded-full font-medium">
            Universal Access
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grade and Subject Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade" className="text-[#E0E0E0]">Grade *</Label>
              <Select value={grade.toString()} onValueChange={handleGradeChange} required>
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

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[#E0E0E0]">Subject *</Label>
              <Select value={subjectId} onValueChange={setSubjectId} required>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id} className="text-white hover:bg-[#424242]">
                      {subject.icon} {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chapter Selection */}
          <div className="space-y-2">
            <Label htmlFor="chapter" className="text-[#E0E0E0]">Chapter *</Label>
            <Select value={chapterId} onValueChange={setChapterId} disabled={!subjectId} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder={subjectId ? "Select chapter" : "Select subject first"} />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                {chapters.map(chapter => (
                  <SelectItem key={chapter.id} value={chapter.id} className="text-white hover:bg-[#424242]">
                    {chapter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content Details */}
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

          {/* Content Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-[#E0E0E0]">Material Type *</Label>
            <Select value={type} onValueChange={(value: any) => setType(value)} required>
              <SelectTrigger className="bg-[#121212] border-[#424242] text-white focus:border-[#2979FF]">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C2C2C] border-[#424242]">
                <SelectItem value="textbook" className="text-white hover:bg-[#424242]">📚 Textbook/PDF</SelectItem>
                <SelectItem value="video" className="text-white hover:bg-[#424242]">🎥 Video Lecture</SelectItem>
                <SelectItem value="summary" className="text-white hover:bg-[#424242]">📝 Summary Notes</SelectItem>
                <SelectItem value="ppt" className="text-white hover:bg-[#424242]">📊 Presentation</SelectItem>
                <SelectItem value="quiz" className="text-white hover:bg-[#424242]">🏆 Quiz/Assessment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Google Drive URL */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[#E0E0E0]">
              Google Drive Link * (Universal Access Enabled)
            </Label>
            <div className="relative">
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="bg-[#121212] border-[#424242] text-white placeholder:text-[#666666] focus:border-[#2979FF] pr-10"
                placeholder="https://drive.google.com/file/d/your-file-id/view"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {url && (
                  isValidGoogleDriveUrl ? (
                    <CheckCircle className="h-5 w-5 text-[#00E676]" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-[#FF7043]" />
                  )
                )}
              </div>
            </div>
            
            {url && !isValidGoogleDriveUrl && (
              <p className="text-sm text-[#FF7043]">
                Please enter a valid Google Drive URL for universal accessibility
              </p>
            )}
            
            {isValidGoogleDriveUrl && (
              <div className="space-y-2">
                <p className="text-sm text-[#00E676] flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Valid Google Drive link detected - Universal access enabled
                </p>
                
                {previewUrl && (
                  <div className="bg-[#121212] border border-[#424242] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#E0E0E0]">Universal Access Preview:</span>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleTestUniversalAccess}
                          className="text-[#00E676] hover:bg-[#00E676]/10"
                        >
                          <Globe className="h-4 w-4 mr-1" />
                          Test Access
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                          className="text-[#2979FF] hover:bg-[#2979FF]/10"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    </div>
                    <iframe
                      src={previewUrl}
                      className="w-full h-40 rounded border border-[#424242]"
                      title="Google Drive Preview"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Universal Access Notice */}
          <div className="bg-[#00E676]/10 border border-[#00E676]/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-[#00E676] mt-0.5" />
              <div>
                <h4 className="text-[#00E676] font-medium mb-1">Universal Access Enabled</h4>
                <p className="text-sm text-[#E0E0E0]">
                  This material will be accessible to all students across all devices once uploaded. 
                  Google Drive links ensure optimal compatibility and universal access.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="bg-[#00E676] text-black hover:bg-[#00E676]/90 flex-1"
              disabled={!title || !type || !url || !isValidGoogleDriveUrl || !subjectId || !chapterId}
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

export default SecureStudyMaterialForm;
