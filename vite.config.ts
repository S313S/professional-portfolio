import {mkdir, writeFile} from 'fs/promises';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const debugHotspotOutputPath = path.resolve(
    __dirname,
    'tmp/friend-book-diff-hotspots.json',
  );
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'friend-book-diff-hotspots-debug-endpoint',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (
              req.url !== '/__friend-book-debug/confirm-hotspots' ||
              req.method !== 'POST'
            ) {
              return next();
            }

            try {
              const body = await new Promise<string>((resolve, reject) => {
                let data = '';
                req.setEncoding('utf8');
                req.on('data', (chunk) => {
                  data += chunk;
                });
                req.on('end', () => resolve(data));
                req.on('error', reject);
              });

              const payload = JSON.parse(body || '{}');
              const record = {
                updatedAt: new Date().toISOString(),
                ...payload,
              };

              await mkdir(path.dirname(debugHotspotOutputPath), {recursive: true});
              await writeFile(
                debugHotspotOutputPath,
                `${JSON.stringify(record, null, 2)}\n`,
                'utf8',
              );

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  ok: true,
                  filePath: 'tmp/friend-book-diff-hotspots.json',
                  updatedAt: record.updatedAt,
                }),
              );
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  ok: false,
                  error: error instanceof Error ? error.message : 'Unknown error',
                }),
              );
            }
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
