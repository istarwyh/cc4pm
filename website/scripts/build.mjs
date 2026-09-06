import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareSite, repositoryRoot } from './generate.mjs';
import { validateSite } from './validate.mjs';

export function buildSite({ root = repositoryRoot, baseURL } = {}) {
  execFileSync(process.execPath, [path.join(root, 'scripts/sync-courseware.js'), '--check'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  const manifest = prepareSite({ root, baseURL });
  const website = path.join(root, 'website');
  const hugo = process.env.HUGO_BIN || 'hugo';
  let version;
  try { version = execFileSync(hugo, ['version'], { encoding: 'utf8' }); }
  catch { throw new Error('Hugo Extended is required. See website/README.md; HUGO_BIN can point to a local binary.'); }
  if (!/v0\.165\.0(?:-[^\s+]+)?\+extended/.test(version)) throw new Error(`Use pinned Hugo Extended 0.165.0; found ${version.trim()}`);
  execFileSync(hugo, ['--cleanDestinationDir', '--gc', '--minify', '--environment', 'production', '--printPathWarnings', '--panicOnWarning', '--baseURL', manifest.baseURL], {
    cwd: website, stdio: 'inherit', env: { ...process.env, GOWORK: 'off', HUGO_MODULE_WORKSPACE: 'off' },
  });
  // Preserve the standalone homepage byte-for-byte in both distribution paths.
  fs.copyFileSync(path.join(website, '.generated/assets/homepage.html'), path.join(website, 'public/index.html'));
  return validateSite({ root });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--baseURL');
  buildSite({ baseURL: index >= 0 ? process.argv[index + 1] : undefined });
}
