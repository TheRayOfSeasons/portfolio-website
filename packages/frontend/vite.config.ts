/* eslint-disable import/no-extraneous-dependencies */
import { resolve, extname, relative } from 'path';
import { promises } from 'fs';
import { defineConfig } from 'vite';
import nunjucks from 'vite-plugin-nunjucks';
import { UserConfig } from 'vite';
import { PluginOption } from 'vite';

/**
 * A plugin that allows the dev server to be able to
 * navigate to other pages without the `.html` extension.
 * Has absolutely no impact in production unless we switch
 * to server-side rendering.
 */
const extensionCleanerMiddleware = (): PluginOption => ({
  name: 'middleware',
  apply: 'serve',
  configureServer(viteDevServer) {
    return () => {
      viteDevServer.middlewares.use(async (req, res, next) => {
        if (!req?.originalUrl?.endsWith('.html') && req.originalUrl !== '/') {
          req.url = `${req.originalUrl}.html`;
        }
        next();
      });
    };
  },
});

/**
 * A generator that recursively yields information
 * regarding all files under a directory.
 * @param {string} dir - The directory where the files will be retrieved from.
 */
async function* getFiles(dir: string) {
  const dirents = await promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const absolutePath = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(absolutePath);
    } else {
      yield {
        path: relative('.', absolutePath),
        name: dirent.name.split('.')[0],
        extension: extname(dirent.name),
      };
    }
  }
}

const RAW_ROOT = 'src';
const ROOT = `./${RAW_ROOT}`;

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0; const
      // eslint-disable-next-line no-bitwise, no-mixed-operators
      v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default defineConfig(async ({ mode }): Promise<UserConfig> => ({
  plugins: [
    extensionCleanerMiddleware(),
    nunjucks({
      nunjucksEnvironment: {
        filters: {
          ENVIRONMENT: () => mode,
          DOMAIN: () => '',
          cacheBusterValue: () => uuid(),
        },
      },
    }),
  ],
  server: {
    port: Number(process.env.PORT) || 3000,
  },
  root: ROOT,
  publicDir: '../public',
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: await (async () => {
        const result = {};
        const blacklist = [
          'templates',
        ];
        for await (const file of getFiles(ROOT)) {
          if (blacklist.includes(file.path.split('/')[1])) {
            continue;
          }
          if (file.extension === '.html') {
            const key = file.path === `${RAW_ROOT}/index.html` ? 'main' : file.path.replace(ROOT, '');
            result[key] = `./${file.path}`;
          }
        }
        return result;
      })(),
    },
  },
}));
