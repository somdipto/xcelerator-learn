
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Suspense, lazy } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load components for better performance
const LazyIndex = lazy(() => import("./pages/Index"));
const LazyTeacherLogin = lazy(() => import("./pages/TeacherLogin"));
const LazyTeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const LazyUnauthorizedPage = lazy(() => import("./pages/UnauthorizedPage"));
const LazyNotFound = lazy(() => import("./pages/NotFound"));

// Optimized query client for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      networkMode: 'online',
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
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
  </ErrorBoundary>
);

export default App;
