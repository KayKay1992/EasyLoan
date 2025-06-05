import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/_redirects', // the file you want to copy
          dest: '.' // copied to dist root
        }
      ]
    })
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
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
    assetsInclude: ['**/*.svg'],
    sourcemap: false,
  },
});
