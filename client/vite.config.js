import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // public/ in the project root holds the drawing engine (js/*.js), shared with the server's renderer.
  publicDir: '../public',
  server: {
    proxy: {
      '/api': 'http://localhost:5180',
      '/media': 'http://localhost:5180',
    },
  },
});
