
// Unified interface for study materials that works with both local and Supabase data
export interface StudyMaterial {
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
}

// Local study material format (from hardcoded data)
export interface LocalStudyMaterial {
  pdfUrl?: string;
  videoUrl?: string;
  practiceQuestionsUrl?: string;
  quizUrl?: string;
  summaryUrl?: string;
  pptUrl?: string;
}

// Adapter function to convert local format to unified format
export function convertLocalToStudyMaterial(
  local: LocalStudyMaterial,
  chapter: string,
  subject: string,
  grade: number
): StudyMaterial[] {
  const materials: StudyMaterial[] = [];
  const baseId = `local-${subject}-${chapter}-${grade}`;
  
  if (local.pdfUrl) {
    materials.push({
      id: `${baseId}-textbook`,
      title: `${chapter} - Textbook`,
      type: 'textbook',
      url: local.pdfUrl,
      chapter_id: chapter,
      grade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  if (local.videoUrl) {
    materials.push({
      id: `${baseId}-video`,
      title: `${chapter} - Video Lecture`,
      type: 'video',
      url: local.videoUrl,
      chapter_id: chapter,
      grade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  if (local.summaryUrl) {
    materials.push({
      id: `${baseId}-summary`,
      title: `${chapter} - Summary`,
      type: 'summary',
      url: local.summaryUrl,
      chapter_id: chapter,
      grade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  if (local.pptUrl) {
    materials.push({
      id: `${baseId}-ppt`,
      title: `${chapter} - Presentation`,
      type: 'ppt',
      url: local.pptUrl,
      chapter_id: chapter,
      grade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  if (local.quizUrl) {
    materials.push({
      id: `${baseId}-quiz`,
      title: `${chapter} - Quiz`,
      type: 'quiz',
      url: local.quizUrl,
      chapter_id: chapter,
      grade,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
  
  return materials;
}
