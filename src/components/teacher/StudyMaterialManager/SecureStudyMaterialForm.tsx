
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SecureInput from '@/components/security/SecureInput';
import { validateFileUpload, validateUrlSafety, sanitizeFileName } from '@/utils/secureValidation';
import { toast } from '@/hooks/use-toast';
import { Upload, Link as LinkIcon, X } from 'lucide-react';

interface SecureStudyMaterialFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: any;
  onCancel: () => void;
}

const SecureStudyMaterialForm: React.FC<SecureStudyMaterialFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'textbook',
    url: initialData?.url || '',
    grade: initialData?.grade?.toString() || '',
    subjectId: initialData?.subject_id || '',
    chapterId: initialData?.chapter_id || ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file securely
    const validation = await validateFileUpload(selectedFile, 'teacher');
    if (!validation.valid) {
      toast({
        title: "File Upload Error",
        description: validation.error || "Invalid file",
        variant: "destructive",
      });
      e.target.value = ''; // Clear the input
      return;
    }

    // Sanitize filename
    const sanitizedFile = new File(
      [selectedFile],
      sanitizeFileName(selectedFile.name),
      { type: selectedFile.type }
    );

    setFile(sanitizedFile);
  };

  const validateForm = async (): Promise<boolean> => {
    const errors: string[] = [];

    if (!formData.title.trim()) {
      errors.push('Title is required');
    }

    if (!formData.type) {
      errors.push('Type is required');
    }

    // Validate URL if provided
    if (formData.url.trim()) {
      const isValidUrl = await validateUrlSafety(formData.url);
      if (!isValidUrl) {
        errors.push('Invalid or unsafe URL provided');
      }
    }

    // Check if URL is required for certain types
    if (['video', 'quiz'].includes(formData.type) && !formData.url.trim()) {
      errors.push('URL is required for video and quiz content');
    }

    // Check if either file or URL is provided for file-based types
    if (['textbook', 'summary', 'ppt'].includes(formData.type) && !file && !formData.url.trim()) {
      errors.push('Either a file upload or URL is required for this content type');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('type', formData.type);
      submitData.append('url', formData.url.trim());
      submitData.append('grade', formData.grade);
      submitData.append('subjectId', formData.subjectId);
      submitData.append('chapterId', formData.chapterId);
      
      if (file) {
        submitData.append('file', file);
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-[#2C2C2C] border-[#424242]">
      <CardHeader>
        <CardTitle className="text-white">
          {initialData ? 'Edit Study Material' : 'Add New Study Material'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <h4 className="text-red-400 font-medium mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-300 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <Label htmlFor="title" className="text-[#E0E0E0]">
              Title *
            </Label>
            <SecureInput
              type="text"
              value={formData.title}
              onChange={(value) => handleInputChange('title', value)}
              placeholder="Enter material title"
              required
              maxLength={200}
              className="bg-[#1A1A1A] border-[#424242] text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-[#E0E0E0]">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description (optional)"
              className="bg-[#1A1A1A] border-[#424242] text-white"
              maxLength={1000}
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-[#E0E0E0]">
              Type *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger className="bg-[#1A1A1A] border-[#424242] text-white">
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="textbook">Textbook</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="ppt">Presentation</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="url" className="text-[#E0E0E0]">
              URL {['video', 'quiz'].includes(formData.type) && '*'}
            </Label>
            <SecureInput
              type="url"
              value={formData.url}
              onChange={(value) => handleInputChange('url', value)}
              placeholder="Enter URL (optional)"
              className="bg-[#1A1A1A] border-[#424242] text-white"
              maxLength={2048}
            />
          </div>

          <div>
            <Label htmlFor="file" className="text-[#E0E0E0]">
              File Upload
            </Label>
            <div className="mt-1">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.webm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file')?.click()}
                className="border-[#424242] text-[#E0E0E0] hover:bg-[#424242]"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? 'Change File' : 'Choose File'}
              </Button>
              {file && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[#00E676] text-sm">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00E676] text-black hover:bg-[#00E676]/90"
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update' : 'Add')} Material
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-[#424242] text-[#E0E0E0] hover:bg-[#424242]"
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
