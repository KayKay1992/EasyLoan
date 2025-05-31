import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist', // Explicitly set output directory
    assetsDir: 'assets', // Explicitly set assets directory
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'axios'],
          antd: ['antd'],
          recharts: ['recharts'],
          framer: ['framer-motion'],
          pdf: ['jspdf', 'jspdf-autotable'],
        },
      },
    },
    assetsInclude: ['**/*.svg'], // Include SVG files
    sourcemap: false, // Disable sourcemaps for production
  }
});