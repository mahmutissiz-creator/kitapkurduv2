
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    legalComments: 'none', // Lisans yorumlarını (legal comments) tamamen siler
    drop: ['console', 'debugger'], // Log mesajlarını temizler
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'esnext', // Daha kısa ve modern modül kodlaması
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'firebase-auth': ['firebase/auth'],
          'firebase-firestore': ['firebase/firestore'],
          'firebase-app': ['firebase/app'],
          'framer-vendor': ['framer-motion'],
          'ui-vendor': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore']
  }
});
