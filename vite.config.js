import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env so the proxy can read HF_TOKEN server-side (never in browser bundle)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        /**
         * Dev proxy: /api/chat → api-inference.huggingface.co
         *
         * Mirrors exactly what the Vercel serverless function (api/chat.js) does
         * in production, so local dev and prod behave identically.
         *
         * HF_TOKEN is injected server-side here (Vite Node process),
         * so it never appears in the browser bundle.
         */
        '/api/chat': {
          target: 'https://router.huggingface.co',
          changeOrigin: true,
          secure: true,
          rewrite: () => '/v1/chat/completions',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const token = env.HF_TOKEN;
              if (token) {
                proxyReq.setHeader('Authorization', `Bearer ${token}`);
              }
              proxyReq.setHeader('Content-Type', 'application/json');
            });
          },
        },
      },
    },
  };
});
