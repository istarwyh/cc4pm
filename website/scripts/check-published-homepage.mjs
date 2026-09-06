import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const report = path.resolve(process.argv[2]);
const [{ filename }] = JSON.parse(fs.readFileSync(report, 'utf8'));
if (path.basename(filename) !== filename) throw new Error('Unexpected npm pack filename');
const published = execFileSync('tar', ['-xOf', path.join(path.dirname(report), filename), 'package/index.html']);
if (!published.equals(fs.readFileSync('index.html'))) {
  throw new Error('Homepage differs from the published version. Bump packages/homepage/package.json before publishing.');
}
console.log('Published homepage matches the checked-in HTML.');
