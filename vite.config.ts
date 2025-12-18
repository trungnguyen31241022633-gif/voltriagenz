import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  
  // Vite tự động load env variables có prefix VITE_
  // Không cần define thủ công
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          recharts: ['recharts']
        }
      }
    }
  }
});
