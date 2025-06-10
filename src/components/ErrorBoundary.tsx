
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'An unexpected error occurred';
      
      return this.props.fallback || (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-4">Error Loading Content</h2>
            <p className="text-[#E0E0E0] mb-4">
              {errorMessage}
            </p>
            <p className="text-[#E0E0E0] mb-6">
              It seems there might be a problem with the database connection. Please:
            </p>
            <div className="space-y-2 text-[#E0E0E0] mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[#00E676]">1.</span>
                <span>Make sure you have internet connection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00E676]">2.</span>
                <span>Check if the database is properly configured</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00E676]">3.</span>
                <span>Try refreshing the page</span>
              </div>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#00E676] text-black hover:bg-[#00E676]/90"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
