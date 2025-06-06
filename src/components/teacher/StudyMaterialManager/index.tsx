
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw } from 'lucide-react';
import StudyMaterialList from './StudyMaterialList';
import StudyMaterialForm from './StudyMaterialForm';
import { supabaseService, StudyMaterial } from '../../../services/supabaseService';
import { toast } from '@/hooks/use-toast';

const StudyMaterialManager: React.FC = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    loadMaterials();
    
    // Subscribe to real-time updates
    const channel = supabaseService.subscribeToStudyMaterials((payload) => {
      console.log('Real-time update:', payload);
      loadMaterials(); // Reload materials when changes occur
    });

    return () => {
      supabaseService.supabase.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { user } = await supabaseService.getCurrentUser();
    if (user) {
      const { data: profile } = await supabaseService.getProfile(user.id);
      setCurrentUser({ ...user, profile });
    }
  };

  const loadMaterials = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user } = await supabaseService.getCurrentUser();
      if (!user) {
        setError('Please log in to view materials');
        return;
      }

      const { data, error: fetchError } = await supabaseService.getTeacherStudyMaterials(user.id);
      
      if (fetchError) {
        throw fetchError;
      }

      // Transform and validate the data to ensure type safety
      const transformedMaterials: StudyMaterial[] = (data || []).map((item: any) => ({
        id: item.id,
        teacher_id: item.teacher_id,
        title: item.title,
        description: item.description,
        type: item.type as 'video' | 'pdf' | 'link' | 'other', // Type assertion for safety
        url: item.url,
        file_path: item.file_path,
        subject_id: item.subject_id,
        chapter_id: item.chapter_id,
        grade: item.grade,
        is_public: item.is_public,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      setMaterials(transformedMaterials);
      console.log('Loaded materials from Supabase:', transformedMaterials);
    } catch (err: any) {
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
        const { error } = await supabaseService.deleteStudyMaterial(materialId);
        
        if (error) {
          throw error;
        }

        await loadMaterials();
        toast({
          title: "Success",
          description: "Study material deleted successfully",
        });
      } catch (err: any) {
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
      const { user } = await supabaseService.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const materialData = {
        teacher_id: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        type: formData.get('type') as 'video' | 'pdf' | 'link' | 'other',
        url: formData.get('url') as string || undefined,
        file_path: undefined as string | undefined,
        subject_id: formData.get('subjectId') as string || undefined,
        chapter_id: formData.get('chapterId') as string || undefined,
        grade: formData.get('grade') ? parseInt(formData.get('grade') as string) : undefined,
        is_public: true
      };

      // Handle file upload if present
      const file = formData.get('file') as File;
      if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `study-materials/${fileName}`;
        
        materialData.file_path = filePath;
        materialData.url = undefined;
      }

      let result;
      if (editingMaterial) {
        result = await supabaseService.updateStudyMaterial(editingMaterial.id, materialData);
        toast({
          title: "Success",
          description: "Study material updated successfully",
        });
      } else {
        result = await supabaseService.createStudyMaterial(materialData);
        toast({
          title: "Success",
          description: "Study material added successfully",
        });
      }

      if (result.error) {
        throw result.error;
      }

      setShowForm(false);
      setEditingMaterial(null);
      await loadMaterials();
    } catch (err: any) {
      console.error("Failed to save material:", err);
      setError('Failed to save material. Please try again.');
      toast({
        title: "Error",
        description: err.message || "Failed to save material",
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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[#E0E0E0] mb-4">Please log in to access the study materials manager.</p>
          <Button 
            onClick={() => window.location.href = '/teacher-login'}
            className="bg-[#2979FF] text-white hover:bg-[#2979FF]/90"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => {
                  setEditingMaterial(null);
                  setShowForm(true);
                }}
                className="bg-[#00E676] text-black hover:bg-[#00E676]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Study Material
              </Button>
              <StudyMaterialList
                materials={materials}
                onEdit={(material) => {
                  setEditingMaterial(material);
                  setShowForm(true);
                }}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <StudyMaterialForm
              onSubmit={async (formData: FormData) => {
                setIsLoading(true);
                try {
                  const { user } = await supabaseService.getCurrentUser();
                  if (!user) {
                    throw new Error('User not authenticated');
                  }

                  const materialData = {
                    teacher_id: user.id,
                    title: formData.get('title') as string,
                    description: formData.get('description') as string || undefined,
                    type: formData.get('type') as 'video' | 'pdf' | 'link' | 'other',
                    url: formData.get('url') as string || undefined,
                    file_path: undefined as string | undefined,
                    subject_id: formData.get('subjectId') as string || undefined,
                    chapter_id: formData.get('chapterId') as string || undefined,
                    grade: formData.get('grade') ? parseInt(formData.get('grade') as string) : undefined,
                    is_public: true
                  };

                  // Handle file upload if present
                  const file = formData.get('file') as File;
                  if (file && file.size > 0) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                    const filePath = `study-materials/${fileName}`;
                    
                    materialData.file_path = filePath;
                    materialData.url = undefined;
                  }

                  let result;
                  if (editingMaterial) {
                    result = await supabaseService.updateStudyMaterial(editingMaterial.id, materialData);
                    toast({
                      title: "Success",
                      description: "Study material updated successfully",
                    });
                  } else {
                    result = await supabaseService.createStudyMaterial(materialData);
                    toast({
                      title: "Success",
                      description: "Study material added successfully",
                    });
                  }

                  if (result.error) {
                    throw result.error;
                  }

                  setShowForm(false);
                  setEditingMaterial(null);
                  await loadMaterials();
                } catch (err: any) {
                  console.error("Failed to save material:", err);
                  setError('Failed to save material. Please try again.');
                  toast({
                    title: "Error",
                    description: err.message || "Failed to save material",
                    variant: "destructive",
                  });
                } finally {
                  setIsLoading(false);
                }
              }}
              initialData={editingMaterial}
              onCancel={() => {
                setShowForm(false);
                setEditingMaterial(null);
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMaterialManager;
