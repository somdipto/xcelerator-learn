
import React, { useState, Suspense } from 'react';
import { AuthProvider as SupabaseAuthProvider } from '@/components/auth/AuthProvider';
import { useAuth } from '@/contexts/AuthContext';
import TeacherTopNav from '@/components/teacher/TeacherTopNav';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  LazyStudentAnalytics,
  LazySubjectManager,
  LazyContentUploader,
  LazyLiveClassManager,
  LazyQuizManager,
  LazyStudyMaterialManager,
  LazySubjectChapterManager
} from '@/components/LazyComponents';

const TeacherDashboardContent = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'subjects':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading subjects..." />}>
            <LazySubjectManager />
          </Suspense>
        );
      case 'content':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading content uploader..." />}>
            <LazyContentUploader />
          </Suspense>
        );
      case 'content-manager':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading content manager..." />}>
            <LazySubjectChapterManager />
          </Suspense>
        );
      case 'students':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading analytics..." />}>
            <LazyStudentAnalytics />
          </Suspense>
        );
      case 'live-classes':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading live classes..." />}>
            <LazyLiveClassManager />
          </Suspense>
        );
      case 'quizzes':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading quizzes..." />}>
            <LazyQuizManager />
          </Suspense>
        );
      case 'study-materials':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading study materials..." />}>
            <LazyStudyMaterialManager />
          </Suspense>
        );
      default:
        return (
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Total Students</h3>
                <p className="text-2xl md:text-3xl font-bold text-[#00E676]">152</p>
                <p className="text-sm text-[#E0E0E0]">Active learners</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Subjects</h3>
                <p className="text-2xl md:text-3xl font-bold text-[#2979FF]">8</p>
                <p className="text-sm text-[#E0E0E0]">Active courses</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Content</h3>
                <p className="text-2xl md:text-3xl font-bold text-[#FFA726]">84</p>
                <p className="text-sm text-[#E0E0E0]">Uploaded materials</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Avg. Progress</h3>
                <p className="text-2xl md:text-3xl font-bold text-[#E91E63]">78%</p>
                <p className="text-sm text-[#E0E0E0]">Student completion</p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-lg border border-[#2C2C2C] mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection('content-manager')}
                  className="p-4 bg-[#00E676]/10 border border-[#00E676] rounded-lg text-[#00E676] hover:bg-[#00E676]/20 transition-colors"
                >
                  <h4 className="font-medium mb-2">Manage Content</h4>
                  <p className="text-sm opacity-80">Add chapters and study materials</p>
                </button>
                <button
                  onClick={() => setActiveSection('subjects')}
                  className="p-4 bg-[#2979FF]/10 border border-[#2979FF] rounded-lg text-[#2979FF] hover:bg-[#2979FF]/20 transition-colors"
                >
                  <h4 className="font-medium mb-2">Manage Subjects</h4>
                  <p className="text-sm opacity-80">Create and edit subjects</p>
                </button>
                <button
                  onClick={() => setActiveSection('study-materials')}
                  className="p-4 bg-[#FFA726]/10 border border-[#FFA726] rounded-lg text-[#FFA726] hover:bg-[#FFA726]/20 transition-colors"
                >
                  <h4 className="font-medium mb-2">Study Materials</h4>
                  <p className="text-sm opacity-80">Upload and organize resources</p>
                </button>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-4 md:p-6 rounded-lg border border-[#2C2C2C]">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#2C2C2C] flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="text-[#E0E0E0] text-sm sm:text-base">New student enrolled in Class 10</span>
                  <span className="text-sm text-[#666666]">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#2C2C2C] flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="text-[#E0E0E0] text-sm sm:text-base">Math quiz completed by 25 students</span>
                  <span className="text-sm text-[#666666]">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 flex-col sm:flex-row gap-2 sm:gap-0">
                  <span className="text-[#E0E0E0] text-sm sm:text-base">Physics video uploaded successfully</span>
                  <span className="text-sm text-[#666666]">1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex">
      <TeacherSidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <div className="flex-1 flex flex-col md:ml-0 w-full">
        <TeacherTopNav teacherData={{ ...user, profile: null }} />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  return (
    <ProtectedRoute requiredRole="teacher">
      <SupabaseAuthProvider>
        <TeacherDashboardContent />
      </SupabaseAuthProvider>
    </ProtectedRoute>
  );
};

export default TeacherDashboard;
