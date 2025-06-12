
import React from 'react';
import SecurityErrorBoundary from './SecurityErrorBoundary';

interface ContentSecurityWrapperProps {
  children: React.ReactNode;
}

const ContentSecurityWrapper: React.FC<ContentSecurityWrapperProps> = ({ children }) => {
  return (
    <SecurityErrorBoundary>
      {children}
    </SecurityErrorBoundary>
  );
};

export default ContentSecurityWrapper;
