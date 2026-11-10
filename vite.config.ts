import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Il backend non ha prefisso /api né CORS: il proxy fa come nginx in produzione.
  const proxy = {
    '/api': {
      target: env.API_PROXY_TARGET || 'http://localhost:3000',
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
  };

  return {
    plugins: [react()],
    resolve: {
      alias: { '@': '/src' },
    },
    server: { port: 5173, proxy },
    preview: { proxy },
  };
});
