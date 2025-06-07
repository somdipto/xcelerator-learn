
import { lazy } from 'react';

// Core pages - immediate loading
export const LazySubjectsPage = lazy(() => 
  import('./SubjectsPage').then(module => ({ default: module.default }))
);

export const LazyProfilePage = lazy(() => 
  import('./ProfilePage').then(module => ({ default: module.default }))
);

// Secondary components - deferred loading
export const LazyPDFViewer = lazy(() => 
  import('./PDFViewer').then(module => ({ default: module.default }))
);

export const LazyChapterStudyMaterial = lazy(() => 
  import('./ChapterStudyMaterial').then(module => ({ default: module.default }))
);

// Teacher components - only load when needed
export const LazyTeacherDashboard = lazy(() => 
  import('../pages/TeacherDashboard').then(module => ({ default: module.default }))
);

export const LazyStudentAnalytics = lazy(() => 
  import('./teacher/StudentAnalytics').then(module => ({ default: module.default }))
);

export const LazySubjectManager = lazy(() => 
  import('./teacher/SubjectManager').then(module => ({ default: module.default }))
);

export const LazyContentUploader = lazy(() => 
  import('./teacher/ContentUploader').then(module => ({ default: module.default }))
);

// Utility function to preload components
export const preloadComponent = (componentLoader: () => Promise<any>) => {
  const componentImport = componentLoader();
  return componentImport;
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload likely-to-be-used components
  setTimeout(() => {
    preloadComponent(() => import('./SubjectsPage'));
    preloadComponent(() => import('./ProfilePage'));
  }, 1000);
};
