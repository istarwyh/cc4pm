const assert = require('assert');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'theater-say.js');

function runCli(args, options = {}) {
  return spawnSync('node', [SCRIPT, ...args], {
    encoding: 'utf8',
    input: options.input || '',
    env: {
      ...process.env,
      ...(options.env || {}),
    },
  });
}

function parseJson(stdout) {
  return JSON.parse(stdout.trim());
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.error(`    ${error.message}`);
    return false;
  }
}

function main() {
  console.log('\n=== Testing theater-say.js ===\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    ['lists built-in roles as JSON', () => {
      const result = runCli(['--list-roles', '--json']);
      assert.strictEqual(result.status, 0, result.stderr);
      const roles = parseJson(result.stdout);
      assert.deepStrictEqual(roles, [
        { id: 'garcin', label: '加尔森', voice: 'Tingting', rate: 175 },
        { id: 'ines', label: '伊内丝', voice: 'Meijia', rate: 170 },
        { id: 'estelle', label: '艾丝黛尔', voice: 'Sinji', rate: 165 },
      ]);
    }],
    ['dry-runs a direct role line without speaking', () => {
      const result = runCli(['garcin', '我不是懦夫。', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.role, 'garcin');
      assert.strictEqual(payload.voice, 'Tingting');
      assert.strictEqual(payload.rate, 175);
      assert.strictEqual(payload.text, '我不是懦夫。');
    }],
    ['reads text from stdin when no positional text is provided', () => {
      const result = runCli(['ines', '--dry-run'], { input: '你们别用那种眼神看我。' });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.role, 'ines');
      assert.strictEqual(payload.text, '你们别用那种眼神看我。');
    }],
    ['allows voice and rate overrides', () => {
      const result = runCli(['estelle', '我沉默不是逃避。', '--voice', 'Tingting', '--rate', '180', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.voice, 'Tingting');
      assert.strictEqual(payload.rate, 180);
    }],
    ['extracts speakable teammate-message content from stdin', () => {
      const input = '<teammate-message teammate_id="garcin" summary="加尔森第三轮台词">\n你们看，我一开口就成了被审的人。\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.role, 'garcin');
      assert.strictEqual(payload.text, '你们看，我一开口就成了被审的人。');
    }],
    ['skips idle teammate-message payloads', () => {
      const input = '<teammate-message teammate_id="garcin">\n{"type":"idle_notification","from":"garcin"}\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.skipped, true);
      assert.strictEqual(payload.reason, 'non-speakable-message');
    }],
    ['skips shutdown teammate-message payloads', () => {
      const input = '<teammate-message teammate_id="garcin">\n{"type":"shutdown_approved","from":"garcin"}\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.skipped, true);
      assert.strictEqual(payload.reason, 'non-speakable-message');
    }],
    ['skips system teammate messages', () => {
      const input = '<teammate-message teammate_id="system" summary="系统台词">\nsystem text\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.skipped, true);
      assert.strictEqual(payload.reason, 'non-speakable-message');
    }],
    ['requires a speakable summary for teammate messages', () => {
      const input = '<teammate-message teammate_id="garcin">\nOPENAI_API_KEY=sk-secretsecret\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.skipped, true);
      assert.strictEqual(payload.reason, 'non-speakable-message');
    }],
    ['skips top-level JSON control messages', () => {
      const input = JSON.stringify({
        type: 'idle_notification',
        role: 'garcin',
        summary: '加尔森台词',
        text: '不应播出',
      });
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.skipped, true);
      assert.strictEqual(payload.reason, 'non-speakable-message');
    }],
    ['redacts secrets from speakable teammate messages', () => {
      const input = '<teammate-message teammate_id="garcin" summary="加尔森台词">\ntoken=ghp_1234567890abcdef\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.text, 'token=[REDACTED_SECRET]');
    }],
    ['redacts secrets from direct text', () => {
      const result = runCli(['garcin', 'password=hunter2', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.text, 'password=[REDACTED_SECRET]');
    }],
    ['redacts quoted JSON-like secret keys', () => {
      const input = '<teammate-message teammate_id="garcin" summary="加尔森台词">\n{"token":"plain-secret"}\n</teammate-message>';
      const result = runCli(['--from-message', '--dry-run'], { input });
      assert.strictEqual(result.status, 0, result.stderr);
      const payload = parseJson(result.stdout);
      assert.strictEqual(payload.text, '{"token":[REDACTED_SECRET]}');
    }],
    ['fails for oversized direct text', () => {
      const result = runCli(['garcin', 'x'.repeat(2001), '--dry-run']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Text exceeds maximum length/);
    }],
    ['fails for unknown roles', () => {
      const result = runCli(['unknown', '台词', '--dry-run']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Unknown role: unknown/);
    }],
    ['fails for empty text', () => {
      const result = runCli(['garcin', '--dry-run']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Text is required/);
    }],
  ];

  for (const [name, fn] of tests) {
    if (runTest(name, fn)) {
      passed += 1;
    } else {
      failed += 1;
    }
  }

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
