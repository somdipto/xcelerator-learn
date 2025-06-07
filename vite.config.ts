
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
    // Use esbuild for faster builds
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          // UI library
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          // Supabase
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'supabase-vendor';
          }
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          // Lucide icons
          if (id.includes('lucide-react')) {
            return 'icons-vendor';
          }
          // Large utilities
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
    sourcemap: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ],
    force: true,
  },
}));
