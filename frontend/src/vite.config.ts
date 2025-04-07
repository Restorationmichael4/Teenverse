import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Ensure this matches the directory your server is configured to serve from
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
