
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Link as LinkIcon, BookOpen, FileSliders, Trophy, ExternalLink, RefreshCw, Globe, CheckCircle } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { googleDriveService } from '@/services/googleDriveService';
import GoogleDriveEmbed from './GoogleDriveEmbed';
import { toast } from '@/hooks/use-toast';

interface ChapterStudyMaterialProps {
  subject: string;
  chapter: string;
  selectedGrade: number;
  onBack: () => void;
}

interface SupabaseStudyMaterial {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  type: string;
  url?: string;
  file_path?: string;
  subject_id?: string;
  chapter_id?: string;
  grade?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  subjects?: { name: string; grade: number };
  chapters?: { name: string };
}

interface StudyMaterial {
  id: string;
  title: string;
  description?: string;
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz';
  url?: string;
  file_path?: string;
  teacher_id?: string;
  subject_id?: string;
  chapter_id?: string;
  grade?: number;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  accessVerified?: boolean;
}

const ChapterStudyMaterial = ({ subject, chapter, selectedGrade, onBack }: ChapterStudyMaterialProps) => {
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingAccess, setVerifyingAccess] = useState<string[]>([]);

  useEffect(() => {
    loadStudyMaterials();
    // Set up real-time refresh every 30 seconds to catch new uploads
    const interval = setInterval(loadStudyMaterials, 30000);
    return () => clearInterval(interval);
  }, [subject, chapter, selectedGrade]);

  const loadStudyMaterials = async () => {
    setIsLoading(true);
    try {
      console.log(`Loading materials from Supabase for: ${subject} - ${chapter} - Grade ${selectedGrade}`);
      
      // Always load from Supabase database, never from localStorage
      const { data: supabaseMaterials, error } = await dataService.getStudyMaterials({
        grade: selectedGrade,
        is_public: true
      });

      console.log('Raw Supabase data:', supabaseMaterials);
      console.log('Supabase error:', error);

      if (error) {
        console.error('Supabase error:', error);
        toast({
          title: "Database Error",
          description: "Failed to load materials from database. Please refresh the page.",
          variant: "destructive",
        });
        setStudyMaterials([]);
        return;
      }

      if (supabaseMaterials?.length) {
        // Filter materials for this specific subject and chapter
        const filteredMaterials = supabaseMaterials
          .filter((material: any) => {
            const subjectMatch = material.subjects?.name === subject;
            const chapterMatch = material.chapters?.name === chapter;
            console.log(`Material: ${material.title}, Subject: ${material.subjects?.name} (${subjectMatch}), Chapter: ${material.chapters?.name} (${chapterMatch})`);
            return subjectMatch && chapterMatch;
          })
          .map((material: any): StudyMaterial => ({
            id: material.id,
            title: material.title,
            description: material.description,
            type: material.type as 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz',
            url: material.url,
            file_path: material.file_path,
            teacher_id: material.teacher_id,
            subject_id: material.subject_id,
            chapter_id: material.chapter_id,
            grade: material.grade,
            is_public: material.is_public,
            created_at: material.created_at,
            updated_at: material.updated_at,
            accessVerified: false
          }));
        
        console.log('Filtered materials:', filteredMaterials);
        setStudyMaterials(filteredMaterials);
        
        // Verify access for Google Drive links
        verifyGoogleDriveAccess(filteredMaterials);
        
        toast({
          title: "Content Loaded from Database",
          description: `Found ${filteredMaterials.length} materials for ${chapter} in database`,
        });
      } else {
        console.log('No materials found in database');
        setStudyMaterials([]);
        toast({
          title: "No Content Found",
          description: "No materials found in database for this chapter",
        });
      }
    } catch (error) {
      console.error('Failed to load study materials:', error);
      setStudyMaterials([]);
      toast({
        title: "Loading Error",
        description: "Failed to load study materials from database. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyGoogleDriveAccess = async (materials: StudyMaterial[]) => {
    const googleDriveMaterials = materials.filter(m => 
      m.url && dataService.isGoogleDriveUrl(m.url)
    );

    if (googleDriveMaterials.length === 0) return;

    setVerifyingAccess(googleDriveMaterials.map(m => m.id));

    for (const material of googleDriveMaterials) {
      try {
        const accessResult = await googleDriveService.verifyUniversalAccess(material.url!);
        
        setStudyMaterials(prev => 
          prev.map(m => 
            m.id === material.id 
              ? { ...m, accessVerified: accessResult.accessible }
              : m
          )
        );
      } catch (error) {
        console.error(`Failed to verify access for ${material.title}:`, error);
      }
    }

    setVerifyingAccess([]);
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    loadStudyMaterials();
    toast({
      title: "Refreshing Content",
      description: "Loading latest content from database...",
    });
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      textbook: BookOpen,
      video: Video,
      summary: FileText,
      ppt: FileSliders,
      quiz: Trophy,
      link: LinkIcon
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || FileText;
    return React.createElement(IconComponent, { className: "h-5 w-5" });
  };

  const renderMaterialContent = (material: StudyMaterial) => {
    if (material.url && dataService.isGoogleDriveUrl(material.url)) {
      return (
        <div className="space-y-3">
          <GoogleDriveEmbed
            url={material.url}
            title={material.title}
            description={material.description}
          />
          
          {/* Access Status */}
          <div className="flex items-center justify-between bg-[#121212] border border-[#424242] rounded-lg p-3">
            <div className="flex items-center gap-2">
              {verifyingAccess.includes(material.id) ? (
                <>
                  <RefreshCw className="h-4 w-4 text-[#FFA726] animate-spin" />
                  <span className="text-sm text-[#FFA726]">Verifying access...</span>
                </>
              ) : material.accessVerified ? (
                <>
                  <CheckCircle className="h-4 w-4 text-[#00E676]" />
                  <span className="text-sm text-[#00E676]">Universal access verified</span>
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 text-[#2979FF]" />
                  <span className="text-sm text-[#2979FF]">Universal access enabled</span>
                </>
              )}
            </div>
            
            <Button
              onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}
              variant="ghost"
              size="sm"
              className="text-[#2979FF] hover:bg-[#2979FF]/10"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </div>
        </div>
      );
    } else if (material.url) {
      return (
        <div className="bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-lg p-4">
          <Button
            onClick={() => window.open(material.url, '_blank', 'noopener,noreferrer')}
            className="bg-[#2979FF] hover:bg-[#2979FF]/90 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open {material.title}
          </Button>
        </div>
      );
    } else {
      return (
        <div className="bg-[#666666]/10 border border-[#666666]/20 rounded-lg p-4">
          <p className="text-[#666666] text-sm">Content not available</p>
        </div>
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#1A1A1A] px-4 sm:px-6 py-6">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-[#E0E0E0] hover:text-[#00E676]"
          >
            <ExternalLink className="h-4 w-4 mr-2 transform rotate-180" />
            Back to Subjects
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {subject} - {chapter}
        </h1>
        <div className="flex items-center gap-4 text-[#E0E0E0]">
          <span>Class {selectedGrade}</span>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#00E676]" />
            <span>Database Synced</span>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00E676] mx-auto mb-4"></div>
          <p className="text-[#E0E0E0]">Loading study materials from database...</p>
          <p className="text-sm text-[#999999] mt-2">Fetching latest content...</p>
        </div>
      ) : (
        /* Study Materials Section */
        <div className="grid gap-6">
          {studyMaterials.map((material, index) => (
            <Card key={material.id || index} className="bg-[#1A1A1A] border-[#2C2C2C] overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-3">
                  {getTypeIcon(material.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{material.title}</h3>
                      {material.url && dataService.isGoogleDriveUrl(material.url) && (
                        <span className="text-xs bg-[#00E676]/20 text-[#00E676] px-2 py-1 rounded-full font-medium">
                          Universal Access
                        </span>
                      )}
                      <span className="text-xs bg-[#2979FF]/20 text-[#2979FF] px-2 py-1 rounded-full font-medium">
                        {material.type.toUpperCase()}
                      </span>
                      <span className="text-xs bg-[#FFA726]/20 text-[#FFA726] px-2 py-1 rounded-full font-medium">
                        Database Synced
                      </span>
                    </div>
                    {material.description && (
                      <p className="text-sm text-[#E0E0E0] font-normal mt-1">
                        {material.description}
                      </p>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {renderMaterialContent(material)}
              </CardContent>
            </Card>
          ))}

          {studyMaterials.length === 0 && (
            <Card className="bg-[#1A1A1A] border-[#2C2C2C]">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-[#666666] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Study Materials in Database</h3>
                <p className="text-[#E0E0E0] mb-4">
                  No materials found in the database for this chapter yet.
                </p>
                <div className="space-y-2 text-sm text-[#999999]">
                  <p>✓ All content is stored in Supabase database</p>
                  <p>✓ Universal access across all devices</p>
                  <p>✓ Real-time sync when teachers add new content</p>
                </div>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="border-[#2979FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white mt-6"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check Database for Updates
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterStudyMaterial;
