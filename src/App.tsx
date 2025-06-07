
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Suspense, lazy } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import PerformanceMonitor from "@/components/PerformanceMonitor";

// Aggressive lazy loading for all routes
const LazyIndex = lazy(() => import("./pages/Index"));
const LazyTeacherLogin = lazy(() => import("./pages/TeacherLogin"));
const LazyTeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const LazyUnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const LazyNotFound = lazy(() => import("./pages/NotFound"));

// Optimized query client for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: true,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PerformanceMonitor />
    <AuthProvider>
      <TooltipProvider delayDuration={300}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingSpinner message="Loading..." />}>
                  <LazyIndex />
                </Suspense>
              } 
            />
            <Route 
              path="/teacher-login" 
              element={
                <Suspense fallback={<LoadingSpinner message="Loading login..." />}>
                  <LazyTeacherLogin />
                </Suspense>
              } 
            />
            <Route 
              path="/teacher-dashboard" 
              element={
                <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
                  <LazyTeacherDashboard />
                </Suspense>
              } 
            />
            <Route 
              path="/unauthorized" 
              element={
                <Suspense fallback={<LoadingSpinner message="Loading..." />}>
                  <LazyUnauthorizedPage />
                </Suspense>
              } 
            />
            <Route 
              path="*" 
              element={
                <Suspense fallback={<LoadingSpinner message="Loading..." />}>
                  <LazyNotFound />
                </Suspense>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
