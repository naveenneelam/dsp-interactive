/**
 * Minimal static server for the DSP Fieldbook. No backend logic, no external
 * dependencies. Usage: node server.js [port]
 */
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const full = normalize(join(ROOT, pathname));
    if (!full.startsWith(ROOT + '\\') && !full.startsWith(ROOT + '/') && full !== ROOT) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    let stat;
    try { stat = statSync(full); } catch { stat = null; }
    if (!stat || !stat.isFile()) {
      // SPA fallback only for extensionless routes; assets should 404 honestly.
      if (!extname(pathname)) {
        res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' });
        createReadStream(join(ROOT, 'index.html')).pipe(res);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end(`Not found: ${pathname}`);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[extname(full).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    createReadStream(full).pipe(res);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Server error');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  DSP Fieldbook running at http://127.0.0.1:${PORT}\n`);
  console.log(`  Source PDF: http://127.0.0.1:${PORT}/source/Guide_to_Digital_Signal_Process.pdf\n`);
});
