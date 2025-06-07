
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Suspense, lazy } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import Index from "./pages/Index";
import TeacherLogin from "./pages/TeacherLogin";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFound from "./pages/NotFound";

// Lazy load heavy components
const LazyTeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));

// Highly optimized query client configuration for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - increased for better memory management
      retry: 1, // Minimal retries for faster failure handling
      refetchOnWindowFocus: false, // Disable to prevent unnecessary requests
      refetchOnReconnect: false, // Disable auto-refetch on reconnect
      refetchOnMount: false, // Prevent refetch on component mount
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PerformanceOptimizer />
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route 
              path="/teacher-dashboard" 
              element={
                <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
                  <LazyTeacherDashboard />
                </Suspense>
              } 
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
