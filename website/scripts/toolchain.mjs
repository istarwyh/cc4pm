import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const toolchain = JSON.parse(fs.readFileSync(path.join(root, 'website/toolchain.json'), 'utf8'));

export function assertNode() {
  if (Number(process.versions.node.split('.')[0]) < Number(toolchain.node)) throw new Error(`Website tools need Node.js ${toolchain.node}+; found ${process.version}.`);
}

export function assertHugo() {
  assertNode();
  const binary = process.env.HUGO_BIN || 'hugo';
  let version;
  try { version = execFileSync(binary, ['version'], { encoding: 'utf8' }).trim(); }
  catch { throw new Error(`Install Hugo Extended ${toolchain.hugo}, or set HUGO_BIN to its path. See website/README.md.`); }
  const found = version.match(/\bv(\d+\.\d+\.\d+)(?:-[^\s+]+)?\+extended\b/);
  if (found?.[1] !== toolchain.hugo) throw new Error(`Use Hugo Extended ${toolchain.hugo}; found ${version}.`);
  return { binary, version };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const hugo = assertHugo();
  const go = execFileSync('go', ['version'], { cwd: path.join(root, 'website'), encoding: 'utf8', env: { ...process.env, GOWORK: 'off' } }).trim();
  console.log(`Node ${process.versions.node}\n${hugo.version}\n${go}\nWebsite toolchain ready.`);
}
