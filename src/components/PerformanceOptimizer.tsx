
import { memo, useEffect } from 'react';

// Component to handle performance optimizations
const PerformanceOptimizer = memo(() => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
      fontLink.as = 'style';
      document.head.appendChild(fontLink);

      // Preload critical images
      const criticalImages = [
        '/placeholder.svg'
      ];
      
      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = src;
        link.as = 'image';
        document.head.appendChild(link);
      });
    };

    // Optimize viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    }

    // Remove unused event listeners on unmount
    const cleanup = () => {
      // Cleanup any global listeners that might be lingering
      window.removeEventListener('resize', () => {});
      window.removeEventListener('scroll', () => {});
    };

    preloadCriticalResources();

    return cleanup;
  }, []);

  return null;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

export default PerformanceOptimizer;
