
import { useState, useCallback } from 'react';

export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = useCallback((src: string) => {
    setLoadedImages(prev => new Set(prev).add(src));
  }, []);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, [loadedImages]);

  const optimizeImageUrl = useCallback((url: string, width?: number, height?: number) => {
    // For external images, add optimization parameters where possible
    if (url.includes('unsplash.com')) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', '80'); // Quality
      params.append('fm', 'webp'); // Format
      return `${url}?${params.toString()}`;
    }
    return url;
  }, []);

  return {
    handleImageLoad,
    isImageLoaded,
    optimizeImageUrl
  };
};
