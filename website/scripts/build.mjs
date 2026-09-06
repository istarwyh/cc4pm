import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { prepareSite, repositoryRoot } from './generate.mjs';
import { validateSite } from './validate.mjs';
import { assertHugo } from './toolchain.mjs';
import { syncContent } from './sync.mjs';
import { writeRelease } from './release.mjs';

export function buildSite({ root = repositoryRoot, baseURL } = {}) {
  syncContent({ root, check: true });
  const manifest = prepareSite({ root, baseURL });
  const website = path.join(root, 'website');
  const { binary: hugo } = assertHugo();
  execFileSync(hugo, ['--cleanDestinationDir', '--gc', '--minify', '--environment', 'production', '--printPathWarnings', '--panicOnWarning', '--baseURL', manifest.baseURL], {
    cwd: website, stdio: 'inherit', env: { ...process.env, GOWORK: 'off', HUGO_MODULE_WORKSPACE: 'off' },
  });
  // Preserve the standalone homepage byte-for-byte in both distribution paths.
  fs.copyFileSync(path.join(website, '.generated/assets/homepage.html'), path.join(website, 'public/index.html'));
  const result = validateSite({ root });
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const dirty = Boolean(execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { cwd: root, encoding: 'utf8' }).trim());
  writeRelease(path.join(website, 'public'), { baseURL: manifest.baseURL, revision, dirty });
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--baseURL');
  buildSite({ baseURL: index >= 0 ? process.argv[index + 1] : undefined });
}
