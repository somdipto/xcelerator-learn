
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Helmet } from 'react-helmet-async';
import ContentSecurityWrapper from '@/components/security/ContentSecurityWrapper';

// Import existing pages - using the correct paths
const Index = lazy(() => import('./pages/Index'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const TeacherLogin = lazy(() => import('./pages/TeacherLogin'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on auth errors or client errors
        if (error?.status === 401 || error?.status === 403 || error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ContentSecurityWrapper>
            <Helmet>
              <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://tjgyskkfhmcabtscsbvh.supabase.co wss://tjgyskkfhmcabtscsbvh.supabase.co; font-src 'self'; object-src 'none'; media-src 'self' https:; frame-src 'self' https:;" />
              <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
              <meta httpEquiv="X-Frame-Options" content="DENY" />
              <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
              <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
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
          </ContentSecurityWrapper>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
