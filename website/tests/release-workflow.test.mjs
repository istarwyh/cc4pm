import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { root as repositoryRoot } from '../scripts/toolchain.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc4pm-version-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n');
  };
  write('scripts/release.sh', fs.readFileSync(path.join(repositoryRoot, 'scripts/release.sh'), 'utf8'));
  write('package.json', { name: 'cc4pm', version: '1.0.0', scripts: { 'build:homepage': 'node render.js' } });
  write('package-lock.json', { name: 'cc4pm', version: '1.0.0', lockfileVersion: 3, packages: { '': { name: 'cc4pm', version: '1.0.0' } } });
  write('.claude-plugin/plugin.json', { name: 'cc4pm', version: '1.0.0' });
  write('.claude-plugin/marketplace.json', { plugins: [{ name: 'cc4pm', version: '1.0.0' }, { name: 'unrelated', version: '9.0.0' }] });
  write('packages/homepage/package.json', { name: '@cc4pm/homepage', version: '1.2.3' });
  write('packages/homepage/index.html', '1.0.0');
  // Homepage rendering itself is exercised by courseware.test.mjs; this fixture isolates Git lifecycle.
  write('render.js', "require('fs').writeFileSync('packages/homepage/index.html', require('./package.json').version);");
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git(['init', '--initial-branch=main']);
  git(['config', 'user.email', 'test@example.org']);
  git(['config', 'user.name', 'Release test']);
  git(['config', 'commit.gpgsign', 'false']);
  git(['add', '.']);
  git(['commit', '-m', 'fixture']);
  const release = version => execFileSync('bash', ['scripts/release.sh', version], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
  return { root, git, release, read, write };
}

test('version preparation leaves main unchanged, creates a reviewable branch and never tags or pushes', t => {
  const { root, git, release, read } = fixture(t);
  const main = git(['rev-parse', 'main']);
  const output = release('1.1.0');
  assert.match(output, /Prepared codex\/release-v1.1.0/);
  assert.equal(git(['branch', '--show-current']), 'codex/release-v1.1.0');
  assert.equal(git(['rev-parse', 'main']), main);
  assert.equal(git(['tag', '--list']), '');
  assert.equal(git(['status', '--porcelain']), '');
  assert.equal(read('package.json').version, '1.1.0');
  assert.equal(read('package-lock.json').packages[''].version, '1.1.0');
  assert.equal(read('.claude-plugin/plugin.json').version, '1.1.0');
  assert.deepEqual(read('.claude-plugin/marketplace.json').plugins.map(plugin => plugin.version), ['1.1.0', '9.0.0']);
  assert.equal(read('packages/homepage/package.json').version, '1.2.4');
  assert.equal(fs.readFileSync(path.join(root, 'packages/homepage/index.html'), 'utf8'), '1.1.0');
});

test('invalid versions and dirty checkouts fail before mutation', t => {
  const { git, release, write } = fixture(t);
  const main = git(['rev-parse', 'HEAD']);
  for (const version of ['oops', '1.0.0', '0.9.0']) assert.throws(() => release(version));
  assert.equal(git(['branch', '--show-current']), 'main');
  assert.equal(git(['status', '--porcelain']), '');
  write('unfinished.md', 'keep this work');
  assert.throws(() => release('1.1.0'));
  assert.equal(git(['rev-parse', 'HEAD']), main);
  assert.equal(git(['status', '--porcelain']), '?? unfinished.md');
});
