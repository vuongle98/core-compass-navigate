
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from 'lovable-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8082,
    proxy: {
      '/api/v1/bots': {
        target: 'http://localhost:8081',  // The backend API URL
        changeOrigin: true,               // Ensures the origin is changed to the target
      },
      '/api': {
        target: 'http://localhost:8080',  // The backend API URL
        changeOrigin: true,               // Ensures the origin is changed to the target
      }
    },
  },
}));
