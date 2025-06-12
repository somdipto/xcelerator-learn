
import React from 'react';
import SecurityErrorBoundary from './SecurityErrorBoundary';

interface ContentSecurityWrapperProps {
  children: React.ReactNode;
}

const ContentSecurityWrapper: React.FC<ContentSecurityWrapperProps> = ({ children }) => {
  return (
    <SecurityErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]">
        {children}
      </div>
    </SecurityErrorBoundary>
  );
};

export default ContentSecurityWrapper;
