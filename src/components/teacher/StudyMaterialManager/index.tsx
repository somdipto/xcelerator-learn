import React, { useState, useEffect } from 'react';
import StudyMaterialList from './StudyMaterialList';
import StudyMaterialForm from './StudyMaterialForm';
import { StudyMaterial } from '../../../data/studyMaterial';
// import { Button } from '../../ui/button'; // Assuming a button component

// Mock API call functions - replace with actual API calls
const fetchStudyMaterials = async (): Promise<StudyMaterial[]> => {
  console.log('Fetching study materials...');
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  // Retrieve from localStorage or return mock if not present
  const storedMaterials = localStorage.getItem('studyMaterials');
  if (storedMaterials) {
    return JSON.parse(storedMaterials).map((m: any) => ({ ...m, createdAt: new Date(m.createdAt), updatedAt: new Date(m.updatedAt) }));
  }
  return [
    { id: '1', teacherId: 'teacher1', title: 'Intro to Physics', type: 'pdf', filePath: 'physics.pdf', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', teacherId: 'teacher1', title: 'Chemistry Basics Video', type: 'video', url: 'http://example.com/chem_video', createdAt: new Date(), updatedAt: new Date() },
  ];
};

const addStudyMaterial = async (formData: FormData): Promise<StudyMaterial> => {
  console.log('Adding study material:', Object.fromEntries(formData.entries()));
  // Simulate API call and file upload
  await new Promise(resolve => setTimeout(resolve, 500));
  const newId = Math.random().toString(36).substring(2, 15);
  const material = {
    id: newId,
    teacherId: 'teacher1', // Replace with actual teacher ID from auth
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    type: formData.get('type') as 'video' | 'pdf' | 'link' | 'other',
    url: formData.get('url') as string || undefined,
    filePath: formData.get('file') ? (formData.get('file') as File).name : undefined, // Simplification for mock
    subjectId: formData.get('subjectId') as string || undefined,
    chapterId: formData.get('chapterId') as string || undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Persist to localStorage for mock
  const materials = await fetchStudyMaterials();
  localStorage.setItem('studyMaterials', JSON.stringify([...materials, material]));
  return material;
};

const updateStudyMaterial = async (formData: FormData): Promise<StudyMaterial> => {
  const materialId = formData.get('id') as string;
  console.log('Updating study material:', materialId, Object.fromEntries(formData.entries()));
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  let materials = await fetchStudyMaterials();
  const updatedMaterial = {
    id: materialId,
    teacherId: 'teacher1', // Replace with actual teacher ID
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    type: formData.get('type') as 'video' | 'pdf' | 'link' | 'other',
    url: formData.get('url') as string || undefined,
    // File handling for updates is complex; this mock simplifies it.
    // In a real app, you'd check if a new file was uploaded.
    filePath: formData.get('file') ? (formData.get('file') as File).name : materials.find(m=>m.id === materialId)?.filePath,
    subjectId: formData.get('subjectId') as string || undefined,
    chapterId: formData.get('chapterId') as string || undefined,
    createdAt: materials.find(m=>m.id === materialId)?.createdAt || new Date(), // Keep original creation date
    updatedAt: new Date(),
  };

  materials = materials.map(m => m.id === materialId ? updatedMaterial : m);
  localStorage.setItem('studyMaterials', JSON.stringify(materials));
  return updatedMaterial;
};

const deleteStudyMaterial = async (id: string): Promise<void> => {
  console.log('Deleting study material:', id);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  let materials = await fetchStudyMaterials();
  materials = materials.filter(m => m.id !== id);
  localStorage.setItem('studyMaterials', JSON.stringify(materials));
};


const StudyMaterialManager: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);

  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudyMaterials();
      setMaterials(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
      setError('Failed to load study materials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleAddClick = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleEdit = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setShowForm(true);
  };

  const handleDelete = async (materialId: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteStudyMaterial(materialId);
        loadMaterials(); // Refresh list
      } catch (err) {
        console.error("Failed to delete material:", err);
        setError('Failed to delete material. Please try again.');
        // Potentially show a toast notification here
      }
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      if (editingMaterial) {
        formData.append('id', editingMaterial.id); // Ensure ID is on formData for update
        await updateStudyMaterial(formData);
      } else {
        await addStudyMaterial(formData);
      }
      setShowForm(false);
      setEditingMaterial(null);
      loadMaterials(); // Refresh list
    } catch (err) {
      console.error("Failed to save material:", err);
      setError('Failed to save material. Please try again.');
      // Potentially show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  if (isLoading && materials.length === 0) return <p>Loading manager...</p>; // Show loading only if no materials are displayed yet

  return (
    <div>
      <h2>Manage Study Materials</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!showForm ? (
        <>
          <button onClick={handleAddClick} style={{ marginBottom: '1rem' }}>Add New Material</button>
          {/* Example using ShadCN Button (if available & imported)
          <Button onClick={handleAddClick} style={{ marginBottom: '1rem' }}>Add New Material</Button>
          */}
          <StudyMaterialList materials={materials} onEdit={handleEdit} onDelete={handleDelete} isLoading={isLoading} />
        </>
      ) : (
        <StudyMaterialForm
          onSubmit={handleFormSubmit}
          initialData={editingMaterial}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default StudyMaterialManager;
