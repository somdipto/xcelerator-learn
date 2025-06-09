
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
        manualChunks: {
          // Core React - always needed
          'react-core': ['react', 'react-dom'],
          
          // Router - needed for navigation
          'router': ['react-router-dom'],
          
          // Auth and data - heavy but essential
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          
          // UI components - only load what's used
          'ui-core': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          
          // Icons - separate chunk since they're heavy
          'icons': ['lucide-react'],
          
          // Everything else
          'vendor': (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
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
