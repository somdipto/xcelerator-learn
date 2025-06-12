
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId?: string;
}

class SecurityErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Generate a random error ID for tracking without exposing system details
    const errorId = Math.random().toString(36).substr(2, 9);
    return { hasError: true, errorId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error securely without exposing sensitive information
    console.error('Security Error Boundary caught an error:', {
      message: error.message,
      stack: error.stack?.split('\n')[0], // Only log the first line of stack
      componentStack: errorInfo.componentStack?.split('\n')[0],
      errorId: this.state.errorId
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Security Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              A security error occurred. This incident has been logged.
            </p>
            <p className="text-sm text-gray-500">
              Error ID: {this.state.errorId}
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default SecurityErrorBoundary;
