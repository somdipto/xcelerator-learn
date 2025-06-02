
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import StudyMaterialList from './StudyMaterialList';
import StudyMaterialForm from './StudyMaterialForm';
import { StudyMaterial } from '../../../data/studyMaterial';
import { toast } from '@/hooks/use-toast';

// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-server-url.com' // Replace with your actual server URL
  : 'http://localhost:3001';

// API functions
const fetchStudyMaterials = async (): Promise<StudyMaterial[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/studymaterials`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const data = await response.json();
    return data.map((m: any) => ({
      ...m,
      createdAt: new Date(m.createdAt),
      updatedAt: new Date(m.updatedAt)
    }));
  } catch (error) {
    console.error('API Error - falling back to localStorage:', error);
    // Fallback to localStorage for development
    const storedMaterials = localStorage.getItem('studyMaterials');
    if (storedMaterials) {
      return JSON.parse(storedMaterials).map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt)
      }));
    }
    return [];
  }
};

const addStudyMaterial = async (formData: FormData): Promise<StudyMaterial> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/studymaterials`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to add: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  } catch (error) {
    console.error('API Error - falling back to localStorage:', error);
    // Fallback for development
    const newId = Math.random().toString(36).substring(2, 15);
    const material = {
      id: newId,
      teacherId: 'teacher1',
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as 'video' | 'pdf' | 'link' | 'other',
      url: formData.get('url') as string || undefined,
      filePath: formData.get('file') ? (formData.get('file') as File).name : undefined,
      subjectId: formData.get('subjectId') as string || undefined,
      chapterId: formData.get('chapterId') as string || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const materials = await fetchStudyMaterials();
    localStorage.setItem('studyMaterials', JSON.stringify([...materials, material]));
    return material;
  }
};

const updateStudyMaterial = async (formData: FormData): Promise<StudyMaterial> => {
  const materialId = formData.get('id') as string;
  try {
    const response = await fetch(`${API_BASE_URL}/api/studymaterials/${materialId}`, {
      method: 'PUT',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Failed to update: ${response.status}`);
    }
    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  } catch (error) {
    console.error('API Error - falling back to localStorage:', error);
    // Fallback for development
    let materials = await fetchStudyMaterials();
    const updatedMaterial = {
      id: materialId,
      teacherId: 'teacher1',
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as 'video' | 'pdf' | 'link' | 'other',
      url: formData.get('url') as string || undefined,
      filePath: formData.get('file') ? (formData.get('file') as File).name : materials.find(m=>m.id === materialId)?.filePath,
      subjectId: formData.get('subjectId') as string || undefined,
      chapterId: formData.get('chapterId') as string || undefined,
      createdAt: materials.find(m=>m.id === materialId)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    materials = materials.map(m => m.id === materialId ? updatedMaterial : m);
    localStorage.setItem('studyMaterials', JSON.stringify(materials));
    return updatedMaterial;
  }
};

const deleteStudyMaterial = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/studymaterials/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete: ${response.status}`);
    }
  } catch (error) {
    console.error('API Error - falling back to localStorage:', error);
    // Fallback for development
    let materials = await fetchStudyMaterials();
    materials = materials.filter(m => m.id !== id);
    localStorage.setItem('studyMaterials', JSON.stringify(materials));
  }
};

const StudyMaterialManager: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);

  const loadMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchStudyMaterials();
      setMaterials(data);
      console.log('Loaded materials:', data);
    } catch (err) {
      console.error("Failed to fetch materials:", err);
      setError('Failed to load study materials. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load study materials",
        variant: "destructive",
      });
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
        await loadMaterials();
        toast({
          title: "Success",
          description: "Study material deleted successfully",
        });
      } catch (err) {
        console.error("Failed to delete material:", err);
        setError('Failed to delete material. Please try again.');
        toast({
          title: "Error",
          description: "Failed to delete material",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      if (editingMaterial) {
        formData.append('id', editingMaterial.id);
        await updateStudyMaterial(formData);
        toast({
          title: "Success",
          description: "Study material updated successfully",
        });
      } else {
        await addStudyMaterial(formData);
        toast({
          title: "Success",
          description: "Study material added successfully",
        });
      }
      setShowForm(false);
      setEditingMaterial(null);
      await loadMaterials();
    } catch (err) {
      console.error("Failed to save material:", err);
      setError('Failed to save material. Please try again.');
      toast({
        title: "Error",
        description: "Failed to save material",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMaterial(null);
  };

  if (isLoading && materials.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#2979FF]" />
          <p className="text-[#E0E0E0]">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Study Materials Management</span>
            <Button
              onClick={loadMaterials}
              variant="outline"
              size="sm"
              className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {!showForm ? (
            <div className="space-y-4">
              <Button
                onClick={handleAddClick}
                className="bg-[#00E676] text-black hover:bg-[#00E676]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Study Material
              </Button>
              <StudyMaterialList
                materials={materials}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <StudyMaterialForm
              onSubmit={handleFormSubmit}
              initialData={editingMaterial}
              onCancel={handleFormCancel}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMaterialManager;
