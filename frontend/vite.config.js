import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react-dom') || id.includes('react/')) return 'vendor-react';
            if (id.includes('lucide-react') || id.includes('canvas-confetti')) return 'vendor-ui';
            return 'vendor';
          }
        },
      },
    },
  },
});
