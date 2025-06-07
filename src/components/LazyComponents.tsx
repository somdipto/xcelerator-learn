
import { lazy } from 'react';

// Critical components - load immediately
export const LazySubjectsPage = lazy(() => 
  import('./SubjectsPage')
);

export const LazyProfilePage = lazy(() => 
  import('./ProfilePage')
);

// Secondary components - load on demand only
export const LazyPDFViewer = lazy(() => 
  import('./PDFViewer')
);

export const LazyChapterStudyMaterial = lazy(() => 
  import('./ChapterStudyMaterial')
);

// Teacher components - heavy lazy loading
export const LazyTeacherDashboard = lazy(() => 
  import('../pages/TeacherDashboard')
);

export const LazyStudentAnalytics = lazy(() => 
  import('./teacher/StudentAnalytics')
);

export const LazySubjectManager = lazy(() => 
  import('./teacher/SubjectManager')
);

export const LazyContentUploader = lazy(() => 
  import('./teacher/ContentUploader')
);

export const LazyLiveClassManager = lazy(() => 
  import('./teacher/LiveClassManager')
);

export const LazyQuizManager = lazy(() => 
  import('./teacher/QuizManager')
);

export const LazyStudyMaterialManager = lazy(() => 
  import('./teacher/StudyMaterialManager')
);

export const LazySubjectChapterManager = lazy(() => 
  import('./teacher/SubjectChapterManager')
);
