import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 1600, // Aumenta o limite de aviso para 1600kB
    },
    define: {
      // Polyfill para process.env.API_KEY funcionar no frontend buildado
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});