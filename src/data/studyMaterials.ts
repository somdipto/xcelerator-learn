
export interface StudyMaterial {
  pdfUrl?: string;
  videoUrl?: string;
  practiceQuestionsUrl?: string;
  quizUrl?: string;
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
