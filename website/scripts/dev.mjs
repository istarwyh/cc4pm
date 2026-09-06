import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { buildSite } from './build.mjs';
import { repositoryRoot as root } from './generate.mjs';

const port = Number(process.env.SITE_PORT || 1313);
const baseURL = `http://127.0.0.1:${port}/cc4pm/`;
const prefix = new URL(baseURL).pathname;
const output = path.join(root, 'website/public');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml' };
buildSite({ baseURL });
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, baseURL).pathname); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (pathname === '/' || pathname === '/cc4pm') { res.writeHead(302, { Location: prefix }); return res.end(); }
  const file = path.resolve(output, pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '../not-found');
  let target = file;
  if (file.startsWith(output + path.sep) || file === output) {
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' }); return res.end(); }
      target = path.join(target, 'index.html');
    }
  } else target = '';
  if (!target || !fs.existsSync(target)) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(fs.readFileSync(path.join(output, '404.html')));
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(target).pipe(res);
});
server.listen(port, '127.0.0.1', () => console.log(`Preview ready: ${baseURL}\nEdit the original courseware, then refresh the page.`));
let timer;
const watchers = [];
for (const directory of ['guide', 'verticals/lawyer', 'website', 'docs', 'manifests']) {
  watchers.push(fs.watch(path.join(root, directory), { recursive: true }, (_event, file) => {
    if (!file || /(^|[/\\])(\.generated(?:\.tmp)?|public|resources|\.hugo_cache)([/\\]|$)|\.hugo_build\.lock|go\.sum/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { buildSite({ baseURL }); console.log('Preview rebuilt. Refresh to see your changes.'); }
      catch (error) { console.error(error.message); }
    }, 250);
  }));
}
watchers.push(fs.watch(path.join(root, 'package.json'), () => {
  clearTimeout(timer);
  timer = setTimeout(() => { try { buildSite({ baseURL }); } catch (e) { console.error(e.message); } }, 250);
}));
function stop() { clearTimeout(timer); watchers.forEach(w => w.close()); server.close(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
