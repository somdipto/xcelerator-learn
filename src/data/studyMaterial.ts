
export interface StudyMaterial {
  id: string; // Unique identifier for the material
  teacherId: string; // Identifier for the teacher who uploaded it
  title: string;
  description?: string; // Optional description
  type: 'textbook' | 'video' | 'summary' | 'ppt' | 'quiz'; // Updated content types
  url?: string; // URL if it's a link or hosted content
  filePath?: string; // Path to the file if uploaded
  subjectId?: string; // Optional: link to a specific subject
  chapterId?: string; // Optional: link to a specific chapter
  createdAt: Date;
  updatedAt: Date;
}
