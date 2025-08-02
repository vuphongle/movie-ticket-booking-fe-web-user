import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@app': '/src/app',
      '@assets': '/src/assets',
      '@images': '/src/assets/images',
      '@contexts': '/src/contexts',
      '@types': '/src/types',
      '@lib': '/src/lib',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
