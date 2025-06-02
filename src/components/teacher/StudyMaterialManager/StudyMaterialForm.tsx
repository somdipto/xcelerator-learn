import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../../../data/studyMaterial';
// import { Button } from '../../ui/button';
// import { Input } from '../../ui/input';
// import { Textarea } from '../../ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
// import { Label } from '../../ui/label';

interface StudyMaterialFormProps {
  onSubmit: (formData: FormData) => void; // FormData for potential file uploads
  initialData?: StudyMaterial | null;
  onCancel: () => void;
}

const StudyMaterialForm: React.FC<StudyMaterialFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'video' | 'pdf' | 'link' | 'other'>('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState(''); // Optional: Add UI for this if needed
  const [chapterId, setChapterId] = useState(''); // Optional: Add UI for this if needed


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setType(initialData.type);
      setUrl(initialData.url || '');
      setSubjectId(initialData.subjectId || '');
      setChapterId(initialData.chapterId || '');
      // Note: File input cannot be programmatically set for editing for security reasons.
      // User would need to re-select the file if they want to change it.
    } else {
      // Reset form for new entry
      setTitle('');
      setDescription('');
      setType('link');
      setUrl('');
      setFile(null);
      setSubjectId('');
      setChapterId('');
    }
  }, [initialData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    if (subjectId) formData.append('subjectId', subjectId);
    if (chapterId) formData.append('chapterId', chapterId);

    if (type === 'link' || type === 'video') {
      formData.append('url', url);
    } else if (file) {
      formData.append('file', file);
    }

    // If editing, and we have an ID, append it.
    // The backend will use this to identify the record to update.
    if (initialData?.id) {
      formData.append('id', initialData.id);
    }

    onSubmit(formData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      // If a file is selected, clear the URL field for non-link/video types
      if (type !== 'link' && type !== 'video') {
        setUrl('');
      }
    }
  };

    const handleTypeChange = (value: string) => {
    const newType = value as 'video' | 'pdf' | 'link' | 'other';
    setType(newType);
    // Reset relevant fields when type changes
    setUrl('');
    setFile(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title*</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="type">Type*</label>
        <select id="type" value={type} onChange={(e) => handleTypeChange(e.target.value)} required>
          <option value="link">Link</option>
          <option value="video">Video (URL)</option>
          <option value="pdf">PDF (Upload)</option>
          <option value="other">Other (Upload)</option>
        </select>
        {/* Example using ShadCN Select (if available & imported)
        <Select value={type} onValueChange={handleTypeChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select material type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="link">Link</SelectItem>
            <SelectItem value="video">Video (URL)</SelectItem>
            <SelectItem value="pdf">PDF (Upload)</SelectItem>
            <SelectItem value="other">Other (Upload)</SelectItem>
          </SelectContent>
        </Select>
        */}
      </div>

      {(type === 'link' || type === 'video') && (
        <div>
          <label htmlFor="url">URL*</label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required={type === 'link' || type === 'video'}
          />
        </div>
      )}

      {(type === 'pdf' || type === 'other') && (
        <div>
          <label htmlFor="file">{initialData?.filePath ? 'Replace File' : 'File* (PDF, Image, etc.)'}</label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept={type === 'pdf' ? '.pdf' : '*/*'} // Be more specific with accept types if needed
            required={!initialData && (type === 'pdf' || type === 'other')} // Required if new and not a link/video
          />
          {initialData?.filePath && <p>Current file: {initialData.filePath.split('/').pop()}</p>}
        </div>
      )}

      {/* TODO: Add inputs for subjectId and chapterId if needed, potentially dropdowns fetching from an API */}

      <div>
        <button type="submit">{initialData ? 'Update' : 'Add'} Material</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: '8px' }}>Cancel</button>
        {/* Example using ShadCN Button (if available & imported)
        <Button type="submit">{initialData ? 'Update' : 'Add'} Material</Button>
        <Button type="button" variant="outline" onClick={onCancel} style={{ marginLeft: '8px' }}>Cancel</Button>
        */}
      </div>
    </form>
  );
};

export default StudyMaterialForm;
