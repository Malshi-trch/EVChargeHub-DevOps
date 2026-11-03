import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { handleAuthApi } from './server/authBackend.js';

function authApiPlugin() {
  return {
    name: 'ev-auth-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/auth')) {
          try {
            await handleAuthApi(req, res);
          } catch (err) {
            console.error('Auth API Middleware Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error in auth API' }));
          }
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/auth')) {
          try {
            await handleAuthApi(req, res);
          } catch (err) {
            console.error('Auth API Preview Middleware Error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal server error in auth API' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), authApiPlugin()],
});
