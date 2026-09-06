import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { root } from './toolchain.mjs';

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml' };

export function serveSite({ output = path.join(root, 'website/public'), baseURL, port }) {
  output = path.resolve(output);
  const prefix = new URL(baseURL).pathname;
  const server = http.createServer((req, res) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, baseURL).pathname); }
    catch { res.writeHead(400); return res.end('Bad request'); }
    if ((pathname === '/' && prefix !== '/') || pathname === prefix.slice(0, -1)) { res.writeHead(302, { Location: prefix }); return res.end(); }
    let target = path.resolve(output, pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '../not-found');
    if (!target.startsWith(output + path.sep) && target !== output) target = '';
    if (target && fs.existsSync(target)) {
      const real = fs.realpathSync(target), realOutput = fs.realpathSync(output);
      if (real !== realOutput && !real.startsWith(realOutput + path.sep)) target = '';
    }
    if (target && fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }); return res.end(); }
      target = path.join(target, 'index.html');
    }
    if (!target || !fs.existsSync(target)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(req.method === 'HEAD' ? '' : fs.readFileSync(path.join(output, '404.html')));
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Preview ready: ${baseURL}`));
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.SITE_TEST_PORT || 4173);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'website/.generated/manifest.json')));
  if (manifest.baseURL !== `http://127.0.0.1:${port}/cc4pm/`) throw new Error(`Browser tests require a local build. Run npm run site:check, or build:site -- --baseURL http://127.0.0.1:${port}/cc4pm/ first.`);
  const server = serveSite({ baseURL: manifest.baseURL, port });
  process.on('SIGINT', () => server.close());
  process.on('SIGTERM', () => server.close());
}
