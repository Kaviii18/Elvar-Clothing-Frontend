import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Loads .env, .env.local, .env.[mode] etc. so VITE_API_URL is available here.
  const env = loadEnv(mode, process.cwd(), '');
  // Only used by `npm run dev` to proxy /api calls during local development.
  // Has no effect on the production build — the build always calls
  // import.meta.env.VITE_API_URL directly (see src/config/api.ts).
  const devApiTarget = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: devApiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
