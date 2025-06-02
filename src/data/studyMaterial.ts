export interface StudyMaterial {
  id: string; // Unique identifier for the material
  teacherId: string; // Identifier for the teacher who uploaded it
  title: string;
  description?: string; // Optional description
  type: 'video' | 'pdf' | 'link' | 'other'; // Type of material
  url?: string; // URL if it's a link or hosted video
  filePath?: string; // Path to the file if uploaded
  subjectId?: string; // Optional: link to a specific subject
  chapterId?: string; // Optional: link to a specific chapter
  createdAt: Date;
  updatedAt: Date;
}
