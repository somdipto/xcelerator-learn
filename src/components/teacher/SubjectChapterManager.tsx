import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, BookOpen, Save, X, Upload, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabaseService, Subject } from '@/services/supabaseService';

// Define the extended StudyMaterial type that includes relations
interface StudyMaterialWithRelations {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  url?: string;
  file_path?: string;
  subject_id?: string;
  chapter_id?: string;
  grade?: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  subjects?: { name: string; grade: number };
  chapters?: { name: string };
}

interface Chapter {
  id: string;
  name: string;
  description?: string;
  subject_id: string;
  order_index: number;
}

const SubjectChapterManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterialWithRelations[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');
  
  const [newChapter, setNewChapter] = useState({
    name: '',
    description: '',
    subject_id: '',
    order_index: 1
  });
  
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    type: 'textbook' as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
    url: '',
    grade: 8
  });

  useEffect(() => {
    loadData();
    checkUser();
    
    // Real-time sync setup with unique channel name
    const channel = supabaseService.subscribeToStudyMaterials((payload) => {
      console.log('Real-time update:', payload);
      setSyncStatus('syncing');
      loadStudyMaterials();
      setTimeout(() => setSyncStatus('synced'), 1000);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 'subject-chapter-manager');

    return () => {
      supabaseService.removeChannel(channel);
    };
  }, []);

  const checkUser = async () => {
    const { user } = await supabaseService.getCurrentUser();
    console.log('Current user:', user);
    setCurrentUser(user);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSubjects(),
        loadChapters(),
        loadStudyMaterials()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubjects = async () => {
    const { data, error } = await supabaseService.getSubjects();
    if (!error && data) {
      console.log('Loaded subjects:', data);
      setSubjects(data);
    } else {
      console.error('Error loading subjects:', error);
    }
  };

  const loadChapters = async () => {
    const { data, error } = await supabaseService.supabase
      .from('chapters')
      .select('*')
      .order('order_index');
    
    if (!error && data) {
      console.log('Loaded chapters:', data);
      setChapters(data);
    } else {
      console.error('Error loading chapters:', error);
    }
  };

  const loadStudyMaterials = async () => {
    if (!currentUser) return;
    
    const { data, error } = await supabaseService.getTeacherStudyMaterials(currentUser.id);
    if (!error && data) {
      // Ensure all required fields are present for StudyMaterialWithRelations
      const typedData: StudyMaterialWithRelations[] = data.map(item => ({
        ...item,
        type: item.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
        is_public: item.is_public ?? true, // Ensure is_public is always present
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString()
      }));
      setStudyMaterials(typedData);
    }
  };

  const handleCreateChapter = async () => {
    if (!newChapter.name.trim() || !newChapter.subject_id) {
      toast({
        title: "Missing Information",
        description: "Please enter chapter name and select a subject",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create chapters",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus('syncing');
    try {
      console.log('Creating chapter with data:', newChapter);
      console.log('Current user:', currentUser);

      // Verify the user owns the selected subject before creating chapter
      const selectedSubjectData = subjects.find(s => s.id === newChapter.subject_id);
      if (!selectedSubjectData) {
        throw new Error('Selected subject not found');
      }

      console.log('Selected subject:', selectedSubjectData);

      // Check if current user created this subject
      if (selectedSubjectData.created_by !== currentUser.id) {
        throw new Error('You can only create chapters for subjects you created');
      }

      const { data, error } = await supabaseService.supabase
        .from('chapters')
        .insert([newChapter])
        .select()
        .single();

      if (error) {
        console.error('Chapter creation error:', error);
        throw error;
      }

      console.log('Chapter created successfully:', data);

      await loadChapters();
      setNewChapter({ name: '', description: '', subject_id: '', order_index: 1 });
      setSyncStatus('synced');
      
      toast({
        title: "Chapter Created",
        description: `${newChapter.name} has been added and synced to student portal`,
      });
    } catch (error: any) {
      console.error('Error creating chapter:', error);
      setSyncStatus('idle');
      toast({
        title: "Error",
        description: error.message || "Failed to create chapter",
        variant: "destructive"
      });
    }
  };

  const handleCreateStudyMaterial = async () => {
    if (!newMaterial.title.trim() || !selectedChapter || !currentUser) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and select a chapter",
        variant: "destructive"
      });
      return;
    }

    setSyncStatus('syncing');
    try {
      const materialData = {
        teacher_id: currentUser.id,
        title: newMaterial.title,
        description: newMaterial.description,
        type: newMaterial.type,
        url: newMaterial.url,
        subject_id: selectedSubject,
        chapter_id: selectedChapter,
        grade: newMaterial.grade,
        is_public: true
      };

      console.log('Creating study material with data:', materialData);

      const { error } = await supabaseService.createStudyMaterial(materialData);
      if (error) throw error;

      await loadStudyMaterials();
      setNewMaterial({
        title: '',
        description: '',
        type: 'textbook',
        url: '',
        grade: 8
      });
      setSyncStatus('synced');
      
      toast({
        title: "Study Material Added",
        description: "Content has been added and synced to student portal",
      });
    } catch (error: any) {
      console.error('Error creating study material:', error);
      setSyncStatus('idle');
      toast({
        title: "Error",
        description: error.message || "Failed to create study material",
        variant: "destructive"
      });
    }
  };

  const filteredChapters = chapters.filter(chapter => 
    selectedSubject ? chapter.subject_id === selectedSubject : true
  );

  const filteredMaterials = studyMaterials.filter(material =>
    selectedChapter ? material.chapter_id === selectedChapter : true
  );

  // Filter subjects to only show those created by current user
  const userSubjects = subjects.filter(subject => 
    currentUser ? subject.created_by === currentUser.id : false
  );

  const getSyncIndicator = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center gap-2 text-[#FFA726]">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Syncing to student portal...</span>
          </div>
        );
      case 'synced':
        return (
          <div className="flex items-center gap-2 text-[#00E676]">
            <span className="text-sm">✓ Synced with student portal</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#2979FF]" />
          <p className="text-[#E0E0E0]">Loading content management...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#E0E0E0] mb-4">Please log in to manage subjects and chapters</p>
          <Button 
            onClick={checkUser}
            className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
          >
            Refresh Login Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Subject & Chapter Content Manager</h1>
        <p className="text-[#E0E0E0]">Manage subjects, chapters, and study materials with real-time sync</p>
        {getSyncIndicator()}
      </div>

      {/* Subject Selection */}
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="text-white">Select Subject & Chapter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-[#E0E0E0]">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {userSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} - Grade {subject.grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-[#E0E0E0]">Chapter</Label>
              <Select value={selectedChapter} onValueChange={setSelectedChapter}>
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Select a chapter" />
                </SelectTrigger>
                <SelectContent>
                  {filteredChapters.map((chapter) => (
                    <SelectItem key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Chapter */}
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Chapter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-[#E0E0E0]">Chapter Name *</Label>
              <Input
                value={newChapter.name}
                onChange={(e) => setNewChapter({...newChapter, name: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Introduction to Algebra"
              />
            </div>
            
            <div>
              <Label className="text-[#E0E0E0]">Subject *</Label>
              <Select 
                value={newChapter.subject_id} 
                onValueChange={(value) => setNewChapter({...newChapter, subject_id: value})}
              >
                <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {userSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-[#E0E0E0]">Order</Label>
              <Input
                type="number"
                value={newChapter.order_index}
                onChange={(e) => setNewChapter({...newChapter, order_index: parseInt(e.target.value) || 1})}
                className="bg-[#121212] border-[#424242] text-white"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-[#E0E0E0]">Description</Label>
            <Textarea
              value={newChapter.description}
              onChange={(e) => setNewChapter({...newChapter, description: e.target.value})}
              className="bg-[#121212] border-[#424242] text-white"
              placeholder="Brief description of the chapter"
            />
          </div>
          
          <Button
            onClick={handleCreateChapter}
            className="bg-[#00E676] hover:bg-[#00E676]/90 text-black"
            disabled={!newChapter.name.trim() || !newChapter.subject_id || !currentUser}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Chapter
          </Button>
        </CardContent>
      </Card>

      {/* Add Study Material */}
      {selectedChapter && (
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Add Study Material to Selected Chapter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#E0E0E0]">Material Title *</Label>
                <Input
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                  className="bg-[#121212] border-[#424242] text-white"
                  placeholder="e.g., Introduction Video"
                />
              </div>
              
              <div>
                <Label className="text-[#E0E0E0]">Type</Label>
                <Select 
                  value={newMaterial.type} 
                  onValueChange={(value: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz') => setNewMaterial({...newMaterial, type: value})}
                >
                  <SelectTrigger className="bg-[#121212] border-[#424242] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="textbook">Textbook/PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="summary">Summary Notes</SelectItem>
                    <SelectItem value="ppt">Presentation (PPT)</SelectItem>
                    <SelectItem value="quiz">Quiz/Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label className="text-[#E0E0E0]">URL/Link *</Label>
              <Input
                value={newMaterial.url}
                onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="https://example.com/resource"
              />
            </div>
            
            <div>
              <Label className="text-[#E0E0E0]">Description</Label>
              <Textarea
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="Brief description of the material"
              />
            </div>
            
            <Button
              onClick={handleCreateStudyMaterial}
              className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
              disabled={!newMaterial.title.trim() || !newMaterial.url.trim()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Study Material
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Display Current Materials */}
      {selectedChapter && (
        <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
          <CardHeader>
            <CardTitle className="text-white">Current Study Materials</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMaterials.length === 0 ? (
              <p className="text-[#E0E0E0] text-center py-8">
                No study materials found for this chapter. Add some materials above.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map((material) => (
                  <div key={material.id} className="bg-[#2C2C2C] p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{material.title}</h4>
                        <p className="text-[#E0E0E0] text-sm">{material.description}</p>
                        <span className="text-xs text-[#666666] bg-[#424242] px-2 py-1 rounded">
                          {material.type}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#424242] text-[#2979FF] hover:bg-[#2979FF]/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#424242] text-[#FF7043] hover:bg-[#FF7043]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubjectChapterManager;
