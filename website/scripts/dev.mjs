import fs from 'node:fs';
import path from 'node:path';
import { serveSite } from './serve.mjs';
import { syncContent } from './sync.mjs';
import { buildSite } from './build.mjs';
import { repositoryRoot as root } from './generate.mjs';

const port = Number(process.env.SITE_PORT || 1313);
const baseURL = `http://127.0.0.1:${port}/cc4pm/`;
syncContent();
buildSite({ baseURL });
const server = serveSite({ baseURL, port });
let timer;
const watchers = [];
for (const directory of ['guide', 'verticals/lawyer', 'website', 'docs', 'manifests']) {
  watchers.push(fs.watch(path.join(root, directory), { recursive: true }, (_event, file) => {
    if (!file || /(^|[/\\])(\.generated(?:\.tmp)?|public|resources|test-results|playwright-report|\.hugo_cache)([/\\]|$)|\.hugo_build\.lock|go\.sum/.test(file)) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { syncContent(); buildSite({ baseURL }); console.log('Preview rebuilt. Refresh to see your changes.'); }
      catch (error) { console.error(error.message); }
    }, 250);
  }));
}
watchers.push(fs.watch(path.join(root, 'package.json'), () => {
  clearTimeout(timer);
  timer = setTimeout(() => { try { syncContent(); buildSite({ baseURL }); } catch (e) { console.error(e.message); } }, 250);
}));
function stop() { clearTimeout(timer); watchers.forEach(w => w.close()); server.close(); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
