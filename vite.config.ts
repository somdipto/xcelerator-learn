
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@radix-ui/react-slot', '@radix-ui/react-toast'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
          'icons': ['lucide-react'],
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
  },
  define: {
    // Ensure proper environment variable handling for build
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  // Enhanced error handling for missing dependencies
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Support for optional chaining and nullish coalescing
    target: 'es2020'
  }
}));
