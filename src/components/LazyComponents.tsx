
import { lazy } from 'react';

// Lazy load heavy components
export const LazySubjectsPage = lazy(() => import('./SubjectsPage'));
export const LazyProfilePage = lazy(() => import('./ProfilePage'));
export const LazyPDFViewer = lazy(() => import('./PDFViewer'));
export const LazyChapterStudyMaterial = lazy(() => import('./ChapterStudyMaterial'));
export const LazyTeacherDashboard = lazy(() => import('../pages/TeacherDashboard'));
export const LazyStudentAnalytics = lazy(() => import('./teacher/StudentAnalytics'));
export const LazySubjectManager = lazy(() => import('./teacher/SubjectManager'));
export const LazyContentUploader = lazy(() => import('./teacher/ContentUploader'));
export const LazyLiveClassManager = lazy(() => import('./teacher/LiveClassManager'));
export const LazyQuizManager = lazy(() => import('./teacher/QuizManager'));
export const LazyStudyMaterialManager = lazy(() => import('./teacher/StudyMaterialManager'));
export const LazySubjectChapterManager = lazy(() => import('./teacher/SubjectChapterManager'));
