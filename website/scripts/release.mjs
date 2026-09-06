// Built-in Node modules only: restoration must not require rebuilding old dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const releaseFile = 'site-release.json';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function filesIn(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Bundle cannot contain symlinks: ${name}`);
    return entry.isDirectory() ? filesIn(path.join(directory, entry.name), `${name}/`) : [name];
  }).filter(name => name !== releaseFile).sort();
}

export function validateRelease(manifest, revision) {
  const base = new URL(manifest.baseURL);
  if (!['https:', 'http:'].includes(base.protocol) || !base.pathname.endsWith('/') || base.search || base.hash || base.username || base.password) throw new Error('Invalid release baseURL.');
  if (manifest.schema !== 1 || !/^[a-f0-9]{40}$/.test(manifest.revision) || typeof manifest.dirty !== 'boolean') throw new Error('Invalid release metadata.');
  if (revision && manifest.revision !== revision) throw new Error(`Revision mismatch: expected ${revision}, got ${manifest.revision}.`);
  if (!Array.isArray(manifest.files) || !manifest.files.length) throw new Error('Empty release.');
  const seen = new Set();
  for (const file of manifest.files) {
    if (typeof file.path !== 'string' || file.path === releaseFile || file.path.split('/').some(part => !part || part === '.' || part === '..') || /[\\?#%\x00-\x1f]/.test(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256) || seen.has(file.path)) throw new Error(`Invalid release file: ${file.path}`);
    seen.add(file.path);
  }
  if (!seen.has('index.html') || !seen.has('404.html')) throw new Error('Release needs index.html and 404.html.');
  if (manifest.contentHash !== sha256(JSON.stringify(manifest.files))) throw new Error('Release manifest digest mismatch.');
  return manifest;
}

export function writeRelease(output, { baseURL, revision, dirty = false }) {
  const files = filesIn(output).map(file => ({ path: file, sha256: sha256(fs.readFileSync(path.join(output, file))) }));
  const manifest = validateRelease({ schema: 1, revision, dirty, baseURL, contentHash: sha256(JSON.stringify(files)), files });
  fs.writeFileSync(path.join(output, releaseFile), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

export function verifyBundle(output, revision) {
  const manifest = validateRelease(JSON.parse(fs.readFileSync(path.join(output, releaseFile))), revision);
  if (JSON.stringify(filesIn(output)) !== JSON.stringify(manifest.files.map(file => file.path).sort())) throw new Error('Bundle file inventory differs from manifest.');
  for (const file of manifest.files) if (sha256(fs.readFileSync(path.join(output, file.path))) !== file.sha256) throw new Error(`Bundle digest mismatch: ${file.path}`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = verifyBundle(process.argv[2] || 'website/public', process.argv[3]);
  if (process.argv.includes('--clean') && manifest.dirty) throw new Error('Refusing to restore a dirty build.');
  console.log(`Verified ${manifest.files.length} files for ${manifest.revision}.`);
}
