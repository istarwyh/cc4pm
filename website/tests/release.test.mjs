import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { writeRelease, verifyBundle, validateRelease, sha256 } from '../scripts/release.mjs';
import { verifyLive } from '../scripts/verify-live.mjs';
import { serveSite } from '../scripts/serve.mjs';

const revision = 'a'.repeat(40);
test('release verification catches stale deployments, corruption and missing files', async t => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'cc4pm-release-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  fs.writeFileSync(path.join(output, 'index.html'), '<h1>Course</h1>');
  fs.writeFileSync(path.join(output, '404.html'), '<h1>Not found</h1>');
  fs.mkdirSync(path.join(output, 'downloads'));
  fs.writeFileSync(path.join(output, 'downloads/课件.md'), '# Original lesson');
  const server = serveSite({ output, baseURL: 'http://127.0.0.1/cc4pm/', port: 0 });
  t.after(() => { server.closeAllConnections(); server.close(); });
  await once(server, 'listening');
  const baseURL = `http://127.0.0.1:${server.address().port}/cc4pm/`;
  const manifest = writeRelease(output, { baseURL, revision });
  assert.equal(verifyBundle(output, revision).files.length, 3);
  const options = { revision, attempts: 1, retryDelay: 0, log: () => {} };
  assert.equal((await verifyLive(manifest, options)).verified, 3);
  fs.writeFileSync(path.join(output, 'site-release.json'), JSON.stringify({ ...manifest, dirty: true }));
  await assert.rejects(verifyLive(manifest, options), /metadata differs/);
  fs.writeFileSync(path.join(output, 'site-release.json'), JSON.stringify(manifest));
  await assert.rejects(verifyLive({ ...manifest, revision: 'b'.repeat(40) }, { ...options, revision: 'b'.repeat(40) }), /Revision mismatch/);
  fs.writeFileSync(path.join(output, 'index.html'), 'corrupt');
  assert.throws(() => verifyBundle(output), /digest mismatch/);
  const reportFile = path.join(output, 'failure.json');
  await assert.rejects(verifyLive(manifest, { ...options, reportFile }), /index.html: SHA-256 mismatch/);
  assert.ok(JSON.parse(fs.readFileSync(reportFile)).failures.length);
  fs.rmSync(path.join(output, 'downloads/课件.md'));
  await assert.rejects(verifyLive(manifest, options), /课件.md: HTTP 404/);
  assert.throws(() => verifyBundle(output), /inventory differs/);
});

test('restoration rejects paths outside the bundle and tampered inventories', t => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), 'cc4pm-release-'));
  t.after(() => fs.rmSync(output, { recursive: true, force: true }));
  for (const file of ['index.html', '404.html']) fs.writeFileSync(path.join(output, file), file);
  const manifest = writeRelease(output, { baseURL: 'https://example.org/project/', revision });
  for (const file of ['../secret', '/tmp/secret', '%2e%2e/secret', 'x\\secret', 'x?secret', 'x#secret']) {
    const files = [...manifest.files, { path: file, sha256: 'a'.repeat(64) }];
    assert.throws(() => validateRelease({ ...manifest, files, contentHash: sha256(JSON.stringify(files)) }), /Invalid release file/);
  }
  assert.throws(() => validateRelease({ ...manifest, contentHash: 'b'.repeat(64) }), /digest mismatch/);
  fs.symlinkSync(path.join(output, 'index.html'), path.join(output, 'link.html'));
  assert.throws(() => verifyBundle(output), /symlinks/);
});
