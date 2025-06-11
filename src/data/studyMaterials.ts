
export interface StudyMaterial {
  pdfUrl?: string;
  videoUrl?: string;
  practiceQuestionsUrl?: string;
  quizUrl?: string;
  summaryUrl?: string;
  pptUrl?: string;
}

export interface ChapterMaterials {
  [chapter: string]: StudyMaterial;
}

export interface SubjectMaterials {
  [grade: number]: ChapterMaterials;
}

export const studyMaterials: { [subject: string]: SubjectMaterials } = {
  'Mathematics': {
    8: {
      'Chapter 1: Rational Numbers': {
        pdfUrl: 'https://drive.google.com/file/d/1yGFT_Px8OCZKIRjHvcyqaF5CtwS1Qn15/view?usp=sharing'
      },
      'Chapter 2: Linear Equations in One Variable': {
        pdfUrl: 'https://drive.google.com/file/d/1example_textbook_id/view?usp=sharing',
        videoUrl: 'https://drive.google.com/file/d/1example_video_id/view?usp=sharing',
        summaryUrl: 'https://drive.google.com/file/d/1example_summary_id/view?usp=sharing',
        pptUrl: 'https://docs.google.com/presentation/d/1example_ppt_id/edit?usp=sharing',
        quizUrl: 'https://docs.google.com/document/d/1example_quiz_id/edit?usp=sharing'
      }
    },
    9: {},
    10: {}
  },
  'Science': {
    8: {},
    9: {},
    10: {}
  },
  'Social Science': {
    8: {},
    9: {},
    10: {}
  }
};

export const getStudyMaterial = (subject: string, grade: number, chapter: string): StudyMaterial | null => {
  return studyMaterials[subject]?.[grade]?.[chapter] || null;
};

// Helper function to convert Google Drive/Docs URLs to embeddable format
export const convertToEmbedUrl = (url: string): string => {
  // Convert Google Drive file URLs to embed format
  if (url.includes('drive.google.com/file/d/')) {
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  
  // Convert Google Docs URLs to embed format
  if (url.includes('docs.google.com/document/d/')) {
    const docId = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (docId) {
      return `https://docs.google.com/document/d/${docId}/preview`;
    }
  }
  
  // Convert Google Slides URLs to embed format
  if (url.includes('docs.google.com/presentation/d/')) {
    const slideId = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (slideId) {
      return `https://docs.google.com/presentation/d/${slideId}/embed?start=false&loop=false&delayms=3000`;
    }
  }
  
  return url;
};
