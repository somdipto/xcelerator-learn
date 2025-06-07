
import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Monitor performance metrics
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          console.log('Page Load Performance:', {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            totalTime: entry.loadEventEnd - entry.fetchStart
          });
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'largest-contentful-paint'] });

    return () => observer.disconnect();
  }, []);

  return null;
};

export default PerformanceMonitor;
