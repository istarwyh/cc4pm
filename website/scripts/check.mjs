import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root, assertHugo } from './toolchain.mjs';
import { syncContent } from './sync.mjs';
import { buildSite } from './build.mjs';

assertHugo();
syncContent({ check: true });
const run = args => execFileSync('npm', ['run', ...args], { cwd: root, stdio: 'inherit' });
run(['test']);
run(['test:site']);
const port = Number(process.env.SITE_TEST_PORT || 4173);
buildSite({ baseURL: `http://127.0.0.1:${port}/cc4pm/` });
run(['test:site:browser']);
const index = process.argv.indexOf('--baseURL');
if (index >= 0 && !process.argv[index + 1]) throw new Error('--baseURL requires a URL.');
buildSite({ baseURL: index >= 0 ? process.argv[index + 1] : undefined });
console.log(`All checks passed. Production output: ${path.join(root, 'website/public')}`);
