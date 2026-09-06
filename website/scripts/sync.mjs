import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readYaml } from './content.mjs';
import { renderHomepage } from './homepage.mjs';
import { root as defaultRoot, assertNode } from './toolchain.mjs';

export function syncContent({ root = defaultRoot, check = false } = {}) {
  assertNode();
  for (const course of readYaml(path.join(root, 'website/site.yaml')).courses) {
    const file = path.join(root, course.guide, 'course-map.yaml');
    const map = readYaml(file);
    const lessons = map.stages.flatMap(stage => stage.lessons);
    const main = lessons.filter(l => !l.supplementary).length;
    const counts = { total_lessons: main, supplementary_lessons: lessons.length - main };
    let content = fs.readFileSync(file, 'utf8');
    for (const [key, value] of Object.entries(counts)) {
      if (!(key in map.meta) && value === 0) continue;
      if (map.meta[key] === value) continue;
      if (check) throw new Error(`${course.guide}/course-map.yaml: stale ${key}; run npm run site:sync.`);
      const pattern = new RegExp(`^(  ${key}: *)[0-9]+`, 'm');
      if (pattern.test(content)) content = content.replace(pattern, (_, prefix) => prefix + value);
      else if (!(key in map.meta)) content = content.replace(/^meta:\s*$/m, match => `${match}\n  ${key}: ${value}`);
      else throw new Error(`Expected an integer ${key} under meta in ${file}.`);
    }
    if (!check && content !== fs.readFileSync(file, 'utf8')) fs.writeFileSync(file, content);
  }
  execFileSync(process.execPath, [path.join(root, 'scripts/sync-courseware.js'), ...(check ? ['--check'] : [])], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  if (!check) execFileSync(process.execPath, [path.join(root, 'scripts/sync-courseware.js'), '--check'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
  const html = renderHomepage(root);
  const file = path.join(root, 'packages/homepage/index.html');
  if (check) {
    if (fs.readFileSync(file, 'utf8') !== html) throw new Error('Homepage is stale; run npm run site:sync.');
  } else fs.writeFileSync(file, html);
  console.log(check ? 'Course counts, teaching navigation and homepage are in sync.' : 'Synced course counts, teaching navigation and standalone homepage.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) syncContent({ check: process.argv.includes('--check') });
