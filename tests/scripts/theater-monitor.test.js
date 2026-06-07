const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'theater-monitor.js');

function runCli(args, options = {}) {
  return spawnSync('node', [SCRIPT, ...args], {
    encoding: 'utf8',
    env: {
      ...process.env,
      ...(options.env || {}),
    },
  });
}

function createInbox(messages) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'theater-monitor-'));
  const inbox = path.join(dir, 'team-lead.json');
  fs.writeFileSync(inbox, JSON.stringify(messages, null, 2));
  return inbox;
}

function parseJsonObjects(stdout) {
  const objects = [];
  const decoder = new Function('text', `
    const objects = [];
    let index = 0;
    while (index < text.length) {
      while (/\\s/.test(text[index] || '')) index += 1;
      if (index >= text.length) break;
      const start = index;
      let depth = 0;
      let inString = false;
      let escaped = false;
      for (; index < text.length; index += 1) {
        const ch = text[index];
        if (escaped) { escaped = false; continue; }
        if (ch === '\\\\') { escaped = true; continue; }
        if (ch === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (ch === '{') depth += 1;
        if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            index += 1;
            objects.push(JSON.parse(text.slice(start, index)));
            break;
          }
        }
      }
    }
    return objects;
  `);
  return decoder(stdout);
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
  console.log('\n=== Testing theater-monitor.js ===\n');

  let passed = 0;
  let failed = 0;

  const tests = [
    ['replays speakable inbox messages in FIFO order', () => {
      const inbox = createInbox([
        { from: 'live-gu-yan', summary: '顾砚台词', text: '第一句' },
        { from: 'live-lin-zhi', summary: '林栀台词', text: '第二句' },
      ]);
      const result = runCli(['--inbox', inbox, '--once', '--replay', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const objects = parseJsonObjects(result.stdout);
      assert.strictEqual(objects.length, 2);
      assert.strictEqual(objects[0].role, 'gu-yan');
      assert.strictEqual(objects[0].text, '第一句');
      assert.strictEqual(objects[1].role, 'lin-zhi');
      assert.strictEqual(objects[1].text, '第二句');
    }],
    ['skips idle messages and non-speakable summaries', () => {
      const inbox = createInbox([
        { from: 'live-gu-yan', text: '{"type":"idle_notification"}' },
        { from: 'live-gu-yan', summary: '普通消息', text: '不该播' },
        { from: 'live-wen-shu', summary: '闻殊台词', text: '应该播' },
      ]);
      const result = runCli(['--inbox', inbox, '--once', '--replay', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const objects = parseJsonObjects(result.stdout);
      assert.strictEqual(objects.length, 1);
      assert.strictEqual(objects[0].role, 'wen-shu');
      assert.strictEqual(objects[0].text, '应该播');
    }],
    ['supports custom role mapping', () => {
      const inbox = createInbox([
        { from: 'actor-a', summary: '顾砚台词', text: '自定义映射' },
      ]);
      const result = runCli([
        '--inbox', inbox,
        '--once',
        '--replay',
        '--dry-run',
        '--map', 'actor-a=gu-yan',
      ]);
      assert.strictEqual(result.status, 0, result.stderr);
      const objects = parseJsonObjects(result.stdout);
      assert.strictEqual(objects.length, 1);
      assert.strictEqual(objects[0].role, 'gu-yan');
      assert.strictEqual(objects[0].text, '自定义映射');
    }],
    ['skips top-level control messages', () => {
      const inbox = createInbox([
        { type: 'idle_notification', from: 'live-gu-yan', summary: '顾砚台词', text: '不该播' },
        { from: 'live-gu-yan', summary: '顾砚台词', text: '应该播' },
      ]);
      const result = runCli(['--inbox', inbox, '--once', '--replay', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const objects = parseJsonObjects(result.stdout);
      assert.strictEqual(objects.length, 1);
      assert.strictEqual(objects[0].text, '应该播');
    }],
    ['limits speakable messages per batch', () => {
      const inbox = createInbox(Array.from({ length: 25 }, (_value, index) => ({
        from: 'live-gu-yan',
        summary: '顾砚台词',
        text: `第${index}句`,
      })));
      const result = runCli(['--inbox', inbox, '--once', '--replay', '--dry-run']);
      assert.strictEqual(result.status, 0, result.stderr);
      const objects = parseJsonObjects(result.stdout);
      assert.strictEqual(objects.length, 20);
    }],
    ['rejects invalid team names', () => {
      const result = runCli(['--team', '../secrets', '--once']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Invalid team name/);
    }],
    ['rejects symlink inbox files', () => {
      const target = createInbox([]);
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'theater-monitor-link-'));
      const link = path.join(dir, 'team-lead.json');
      fs.symlinkSync(target, link);
      const result = runCli(['--inbox', link, '--once']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /symlink/);
    }],
    ['fails when inbox is missing', () => {
      const result = runCli(['--inbox', '/no/such/inbox.json', '--once']);
      assert.strictEqual(result.status, 1);
      assert.match(result.stderr, /Inbox not found/);
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
