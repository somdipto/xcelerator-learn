
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/contexts/AuthContext';

// Import existing pages - using the correct paths
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TeacherLogin = lazy(() => import('./pages/TeacherLogin'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

const App = () => {
  return (
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <Helmet>
            <title>Teacher CMS Portal</title>
            <meta name="description" content="Content Management System for Teachers" />
          </Helmet>
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]">
              <Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/teacher-login" element={<TeacherLogin />} />
                  <Route path="/teacher/*" element={<TeacherDashboard />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </div>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  );
};

export default App;
