import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { releaseFile, sha256, validateRelease } from './release.mjs';

export async function verifyLive(manifest, { revision, attempts = 12, retryDelay = 5000, concurrency = 6, timeout = 15000, reportFile, log = console.log } = {}) {
  validateRelease(manifest, revision);
  const urlFor = file => {
    const url = new URL(file.split('/').map(encodeURIComponent).join('/'), manifest.baseURL);
    url.searchParams.set('verify', `${manifest.contentHash}-${Date.now()}`);
    return url;
  };
  const get = file => fetch(urlFor(file), { signal: AbortSignal.timeout(timeout), redirect: 'error', headers: { 'Cache-Control': 'no-cache' } });
  const report = { revision: manifest.revision, contentHash: manifest.contentHash, baseURL: manifest.baseURL, verified: 0, failures: [] };
  try {
    let ready = false, lastError;
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const response = await get(releaseFile);
        if (response.status !== 200) throw new Error(`Release manifest returned HTTP ${response.status}`);
        const published = validateRelease(await response.json(), manifest.revision);
        if (published.contentHash !== manifest.contentHash) throw new Error('Published files differ from the expected build.');
        ready = true;
        break;
      } catch (error) { lastError = error; }
      if (attempt + 1 < attempts) { log(`Waiting for Pages propagation (${attempt + 1}/${attempts}): ${lastError.message}`); await delay(retryDelay); }
    }
    if (!ready) throw lastError;
    let index = 0;
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (index < manifest.files.length) {
        const file = manifest.files[index++];
        let failure;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            const response = await get(file.path);
            if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
            if (sha256(Buffer.from(await response.arrayBuffer())) !== file.sha256) throw new Error('SHA-256 mismatch');
            failure = null;
            break;
          } catch (error) { failure = `${file.path}: ${error.message}`; }
          if (attempt < 2) await delay(retryDelay);
        }
        if (failure) report.failures.push(failure);
        else report.verified++;
        if ((report.verified + report.failures.length) % 100 === 0) log(`Checked ${report.verified + report.failures.length}/${manifest.files.length} published files.`);
      }
    }));
    const missing = await get(`__cc4pm_missing_${manifest.contentHash}.html`);
    if (missing.status !== 404) report.failures.push(`Unknown URL returned ${missing.status}, expected 404.`);
    if (report.failures.length) throw new Error(report.failures.slice(0, 20).join('\n'));
    log(`Live verification passed: ${report.verified} files, matching revision and hashes, correct 404.`);
    return report;
  } catch (error) {
    if (!report.failures.length) report.failures.push(error.message);
    throw error;
  } finally {
    if (reportFile) { fs.mkdirSync(path.dirname(reportFile), { recursive: true }); fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n'); }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const option = (name, fallback) => { const i = process.argv.indexOf(name); return i < 0 ? fallback : process.argv[i + 1]; };
  const manifest = JSON.parse(fs.readFileSync(option('--manifest', 'website/public/site-release.json')));
  await verifyLive(manifest, { revision: option('--revision'), reportFile: option('--report', 'website/test-results/live.json') });
}
