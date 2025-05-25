
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherTopNav from '@/components/teacher/TeacherTopNav';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import SubjectManager from '@/components/teacher/SubjectManager';
import ContentUploader from '@/components/teacher/ContentUploader';
import StudentAnalytics from '@/components/teacher/StudentAnalytics';
import LiveClassManager from '@/components/teacher/LiveClassManager';
import QuizManager from '@/components/teacher/QuizManager';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [teacherData, setTeacherData] = useState(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('teacherAuth');
    const storedTeacherData = localStorage.getItem('teacherData');
    
    if (!isAuthenticated) {
      navigate('/teacher-login');
      return;
    }
    
    if (storedTeacherData) {
      setTeacherData(JSON.parse(storedTeacherData));
    }
  }, [navigate]);

  if (!teacherData) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'subjects':
        return <SubjectManager />;
      case 'content':
        return <ContentUploader />;
      case 'students':
        return <StudentAnalytics />;
      case 'live-classes':
        return <LiveClassManager />;
      case 'quizzes':
        return <QuizManager />;
      default:
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-[#00E676]">152</p>
                <p className="text-sm text-[#E0E0E0]">Active learners</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Subjects</h3>
                <p className="text-3xl font-bold text-[#2979FF]">8</p>
                <p className="text-sm text-[#E0E0E0]">Active courses</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Content</h3>
                <p className="text-3xl font-bold text-[#FFA726]">84</p>
                <p className="text-sm text-[#E0E0E0]">Uploaded materials</p>
              </div>
              
              <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
                <h3 className="text-lg font-semibold text-white mb-2">Avg. Progress</h3>
                <p className="text-3xl font-bold text-[#E91E63]">78%</p>
                <p className="text-sm text-[#E0E0E0]">Student completion</p>
              </div>
            </div>

            <div className="bg-[#1A1A1A] p-6 rounded-lg border border-[#2C2C2C]">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[#2C2C2C]">
                  <span className="text-[#E0E0E0]">New student enrolled in Class 10</span>
                  <span className="text-sm text-[#666666]">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#2C2C2C]">
                  <span className="text-[#E0E0E0]">Math quiz completed by 25 students</span>
                  <span className="text-sm text-[#666666]">4 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-[#E0E0E0]">Physics video uploaded successfully</span>
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
      
      <div className="flex-1 flex flex-col">
        <TeacherTopNav teacherData={teacherData} />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
