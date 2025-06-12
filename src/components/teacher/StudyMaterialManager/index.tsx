import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, Upload, Users } from 'lucide-react';
import StudyMaterialList from './StudyMaterialList';
import SecureStudyMaterialForm from './SecureStudyMaterialForm';
import SyncStatusBanner from '../ContentUploader/SyncStatusBanner';
import SyncStatusIndicator from '../ContentUploader/SyncStatusIndicator';
import { supabaseService, StudyMaterial } from '../../../services/supabaseService';
import { useAuth } from '../../auth/AuthProvider';
import { toast } from '@/hooks/use-toast';

// Fix the sync status type to include 'error'
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const StudyMaterialManager: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  useEffect(() => {
    if (user) {
      loadMaterials();
      
      // Subscribe to real-time updates for immediate sync with student portal
      const channel = supabaseService.subscribeToStudyMaterials((payload) => {
        console.log('Real-time update detected:', payload);
        setSyncStatus('syncing');
        loadMaterials(); // Reload materials when changes occur
        
        // Show sync notification
        setTimeout(() => {
          setSyncStatus('synced');
          toast({
            title: "Content Synced",
            description: "Your changes are now live for students",
          });
          
          // Reset status after 3 seconds
          setTimeout(() => setSyncStatus('idle'), 3000);
        }, 1000);
      }, 'study-material-manager');

      return () => {
        supabaseService.removeChannel(channel);
      };
    }
  }, [user]);

  const loadMaterials = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
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
        type: item.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
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

  const handleFormSubmit = async (formData: FormData) => {
    if (!user) return;
    
    setIsLoading(true);
    setSyncStatus('syncing');
    try {
      const materialData = {
        teacher_id: user.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        type: formData.get('type') as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
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
          description: "Study material updated and synced to student portal",
        });
      } else {
        result = await supabaseService.createStudyMaterial(materialData);
        toast({
          title: "Success",
          description: "Study material added and synced to student portal",
        });
      }

      if (result.error) {
        throw result.error;
      }

      setShowForm(false);
      setEditingMaterial(null);
      setSyncStatus('synced');
      await loadMaterials();
    } catch (err: any) {
      console.error("Failed to save material:", err);
      setError('Failed to save material. Please try again.');
      setSyncStatus('error');
      toast({
        title: "Error",
        description: err.message || "Failed to save material",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (window.confirm('Are you sure? This will remove the content from the student portal immediately.')) {
      setSyncStatus('syncing');
      try {
        const { error } = await supabaseService.deleteStudyMaterial(materialId);
        
        if (error) {
          throw error;
        }

        await loadMaterials();
        setSyncStatus('synced');
        toast({
          title: "Success",
          description: "Study material deleted and removed from student portal",
        });
      } catch (err: any) {
        console.error("Failed to delete material:", err);
        setError('Failed to delete material. Please try again.');
        setSyncStatus('error');
        toast({
          title: "Error",
          description: "Failed to delete material",
          variant: "destructive",
        });
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-[#E0E0E0] mb-4">Authentication required.</p>
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
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5" />
              <span>Study Materials Management</span>
              <div className="text-sm bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded">
                {materials.length} materials
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SyncStatusIndicator syncStatus={syncStatus} />
              <Button
                onClick={loadMaterials}
                variant="outline"
                size="sm"
                className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-md">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <SyncStatusBanner />
          
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
            <SecureStudyMaterialForm
              onSubmit={handleFormSubmit}
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
