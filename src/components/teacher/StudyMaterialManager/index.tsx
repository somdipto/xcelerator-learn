import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, RefreshCw, Upload, Shield } from 'lucide-react';
import StudyMaterialList from './StudyMaterialList';
import SecureStudyMaterialForm from './SecureStudyMaterialForm';
import SyncStatusBanner from '../ContentUploader/SyncStatusBanner';
import SyncStatusIndicator from '../ContentUploader/SyncStatusIndicator';
import { secureDataService } from '@/services/secureDataService';
import { useDemoAuth } from '@/components/auth/DemoAuthProvider';
import { toast } from '@/hooks/use-toast';
import { useSecureValidation } from '@/hooks/useSecureValidation';

// Fix the sync status type to include 'error'
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const StudyMaterialManager: React.FC = () => {
  const { user } = useDemoAuth();
  const { validateForm } = useSecureValidation();
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      loadMaterials();
    }
  }, [user]);

  const loadMaterials = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await secureDataService.secureGetStudyMaterials({ 
        teacher_id: user.id 
      });
      
      if (fetchError) {
        throw fetchError;
      }

      setMaterials(data || []);
      console.log('Loaded materials securely:', data);
    } catch (err: any) {
      console.error("Failed to fetch materials:", err);
      setError('Failed to load study materials. Please try again.');
      toast({
        title: "Security Error",
        description: err.message || "Failed to load study materials",
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
      // Extract and validate form data
      const materialData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string || undefined,
        type: formData.get('type') as string,
        url: formData.get('url') as string || undefined,
        subject_id: formData.get('subjectId') as string || undefined,
        chapter_id: formData.get('chapterId') as string || undefined,
        grade: formData.get('grade') ? parseInt(formData.get('grade') as string) : undefined,
        is_public: true
      };

      // Validate form data
      const validationRules = {
        title: { required: true, minLength: 1, maxLength: 200, sanitize: true },
        description: { maxLength: 1000, sanitize: true },
        type: { required: true, pattern: /^(textbook|video|summary|ppt|quiz)$/ },
        url: { maxLength: 2048 }
      };

      const validation = validateForm(materialData, validationRules);
      if (!validation.isValid) {
        const errorMessage = Object.values(validation.errors).flat().join(', ');
        throw new Error(`Validation failed: ${errorMessage}`);
      }

      // Use sanitized data
      const sanitizedData = validation.sanitizedData;

      let result;
      if (editingMaterial) {
        result = await secureDataService.secureUpdateStudyMaterial(editingMaterial.id, sanitizedData);
        toast({
          title: "Success",
          description: "Study material updated securely",
        });
      } else {
        result = await secureDataService.secureCreateStudyMaterial(sanitizedData);
        toast({
          title: "Success", 
          description: "Study material added securely",
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
        title: "Security Error",
        description: err.message || "Failed to save material",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      setSyncStatus('syncing');
      try {
        const { error } = await secureDataService.secureDeleteStudyMaterial(materialId);
        
        if (error) {
          throw error;
        }

        await loadMaterials();
        setSyncStatus('synced');
        toast({
          title: "Success",
          description: "Study material deleted securely",
        });
      } catch (err: any) {
        console.error("Failed to delete material:", err);
        setError('Failed to delete material. Please try again.');
        setSyncStatus('error');
        toast({
          title: "Security Error",
          description: err.message || "Failed to delete material",
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
              <Shield className="h-5 w-5 text-[#00E676]" />
              <span>Secure Study Materials Management</span>
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
