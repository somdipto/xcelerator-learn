
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          // Core React - always needed
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core';
          }
          
          // Router - needed for navigation
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // Auth and data - heavy but essential
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // UI components - only load what's used
          if (id.includes('@radix-ui')) {
            return 'ui-core';
          }
          
          // Icons - separate chunk since they're heavy
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          
          // Everything else from node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query'
    ],
    force: true,
  },
}));
