import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, BookOpen, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { dataService } from '@/services/dataService';
import { supabase } from '@/integrations/supabase/client';

interface Subject {
  id: string;
  name: string;
  description?: string;
  grade: number;
  icon?: string;
  color?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const SubjectManager = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    grade: 1,
    chapters: [''],
    color: '#2979FF'
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const { data, error } = await dataService.getSubjects();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load subjects",
          variant: "destructive"
        });
      } else {
        setSubjects(data || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a subject name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const subjectData = {
        ...newSubject,
        chapters: newSubject.chapters.filter(ch => ch.trim() !== '')
      };
      
      const { data, error } = await dataService.createSubject(subjectData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to add subject",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        setSubjects(prev => [...prev, data]);
      }
      
      setNewSubject({
        name: '',
        description: '',
        grade: 1,
        chapters: [''],
        color: '#2979FF'
      });
      
      toast({
        title: "Subject Added",
        description: `${subjectData.name} has been added successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive"
      });
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject({ ...subject });
  };

  const handleSaveEdit = async () => {
    if (!editingSubject) return;
    
    try {
      const { data, error } = await supabase
        .from('subjects')
        .update({
          name: editingSubject.name,
          description: editingSubject.description,
          grade: editingSubject.grade,
          color: editingSubject.color
        })
        .eq('id', editingSubject.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update subject",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setSubjects(prev => prev.map(s => s.id === data.id ? data : s));
      }
      
      setEditingSubject(null);
      
      toast({
        title: "Subject Updated",
        description: `${editingSubject.name} has been updated successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete subject",
          variant: "destructive"
        });
        return;
      }

      setSubjects(prev => prev.filter(s => s.id !== id));
      
      toast({
        title: "Subject Deleted",
        description: `${name} has been removed successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive"
      });
    }
  };

  const addChapter = (chapters: string[], setChapters: (chapters: string[]) => void) => {
    setChapters([...chapters, '']);
  };

  const updateChapter = (index: number, value: string, chapters: string[], setChapters: (chapters: string[]) => void) => {
    const updated = [...chapters];
    updated[index] = value;
    setChapters(updated);
  };

  const removeChapter = (index: number, chapters: string[], setChapters: (chapters: string[]) => void) => {
    if (chapters.length > 1) {
      const updated = chapters.filter((_, i) => i !== index);
      setChapters(updated);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-white">Loading subjects...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Subject Manager</h1>
        <p className="text-[#E0E0E0]">Create and manage subjects for your students</p>
      </div>

      {/* Add New Subject */}
      <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-[#E0E0E0]">Subject Name *</Label>
              <Input
                id="name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                className="bg-[#121212] border-[#424242] text-white"
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <Label htmlFor="grade" className="text-[#E0E0E0]">Grade</Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="12"
                value={newSubject.grade}
                onChange={(e) => setNewSubject({...newSubject, grade: parseInt(e.target.value) || 1})}
                className="bg-[#121212] border-[#424242] text-white"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="text-[#E0E0E0]">Description</Label>
            <Textarea
              id="description"
              value={newSubject.description}
              onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
              className="bg-[#121212] border-[#424242] text-white"
              placeholder="Brief description of the subject"
            />
          </div>

          <div>
            <Label className="text-[#E0E0E0]">Chapters</Label>
            {newSubject.chapters.map((chapter, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={chapter}
                  onChange={(e) => updateChapter(index, e.target.value, newSubject.chapters, 
                    (chapters) => setNewSubject({...newSubject, chapters}))}
                  className="bg-[#121212] border-[#424242] text-white"
                  placeholder={`Chapter ${index + 1}`}
                />
                <Button
                  onClick={() => removeChapter(index, newSubject.chapters, 
                    (chapters) => setNewSubject({...newSubject, chapters}))}
                  variant="outline"
                  size="icon"
                  className="border-[#424242] text-[#FF7043] hover:bg-[#FF7043]/10"
                  disabled={newSubject.chapters.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => addChapter(newSubject.chapters, 
                (chapters) => setNewSubject({...newSubject, chapters}))}
              variant="outline"
              className="mt-2 border-[#424242] text-[#00E676] hover:bg-[#00E676]/10"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </div>

          <Button
            onClick={handleAddSubject}
            className="bg-[#00E676] hover:bg-[#00E676]/90 text-black"
            disabled={!newSubject.name.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </CardContent>
      </Card>

      {/* Existing Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.length === 0 ? (
          <div className="col-span-full text-center text-[#E0E0E0] py-8">
            No subjects created yet. Add your first subject above.
          </div>
        ) : (
          subjects.map((subject) => (
            <Card key={subject.id} className="bg-[#1A1A1A] border-[#2C2C2C]">
              {editingSubject?.id === subject.id ? (
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Input
                      value={editingSubject.name}
                      onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})}
                      className="bg-[#121212] border-[#424242] text-white"
                    />
                    <Textarea
                      value={editingSubject.description || ''}
                      onChange={(e) => setEditingSubject({...editingSubject, description: e.target.value})}
                      className="bg-[#121212] border-[#424242] text-white"
                    />
                    <Input
                      type="number"
                      min="1"
                      max="12"
                      value={editingSubject.grade}
                      onChange={(e) => setEditingSubject({...editingSubject, grade: parseInt(e.target.value) || 1})}
                      className="bg-[#121212] border-[#424242] text-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        size="sm"
                        className="bg-[#00E676] hover:bg-[#00E676]/90 text-black"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => setEditingSubject(null)}
                        size="sm"
                        variant="outline"
                        className="border-[#424242] text-[#E0E0E0]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              ) : (
                <>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" style={{ color: subject.color || '#2979FF' }} />
                        <CardTitle className="text-white text-lg">{subject.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEditSubject(subject)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#2979FF] hover:bg-[#2979FF]/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteSubject(subject.id, subject.name)}
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#FF7043] hover:bg-[#FF7043]/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#E0E0E0] text-sm mb-3">{subject.description}</p>
                    <p className="text-xs text-[#666666] mb-2">Grade {subject.grade}</p>
                  </CardContent>
                </>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectManager;
