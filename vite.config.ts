import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const target = env.API_PROXY_TARGET || 'http://localhost:3000';
  // Il backend non ha prefisso /api né CORS: il proxy fa come nginx in produzione.
  const proxy = {
    '/api': {
      target,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
    },
    // Socket.IO della mappa in tempo reale: stesso path sul backend, con upgrade a WebSocket.
    '/socket.io': { target, ws: true, changeOrigin: true },
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
