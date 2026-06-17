import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    base: '/construc_acm1/',
    define: {
      // Variables de entorno accesibles via process.env en el código
      'process.env.GOOGLE_MAPS_PLATFORM_KEY':  JSON.stringify(env.GOOGLE_MAPS_PLATFORM_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr:   process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Las librerías PDF/XLSX y Insforge son pesadas — aumentar el límite del warning
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          // Code splitting: cada grupo de librerías en su propio chunk (carga más rápida)
          manualChunks: {
            'pdf-libs':  ['jspdf', 'jspdf-autotable'],
            'xlsx-libs': ['xlsx'],
            'insforge':  ['@supabase/supabase-js'],    // SDK de conexión a Insforge
            'motion':    ['motion/react'],
          },
        },
      },
    },
  };
});
