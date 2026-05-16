/**
 * Tests for scripts/install-plan.js
 */

const assert = require('assert');
const path = require('path');
const { execFileSync } = require('child_process');

const SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'install-plan.js');

function run(args = []) {
  try {
    const stdout = execFileSync('node', [SCRIPT, ...args], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 10000,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      code: error.status || 1,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    };
  }
}

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('\n=== Testing install-plan.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('shows help with no arguments', () => {
    const result = run();
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('Inspect cc4pm selective-install manifests'));
  })) passed++; else failed++;

  if (test('lists install modules', () => {
    const result = run(['--list-modules']);
    assert.strictEqual(result.code, 0);
    assert.ok(result.stdout.includes('Install modules'));
    assert.ok(result.stdout.includes('cc4pm-guide'));
  })) passed++; else failed++;

  if (test('emits JSON for explicit module resolution', () => {
    const result = run([
      '--modules', 'cc4pm-guide',
      '--target', 'claude',
      '--json'
    ]);
    assert.strictEqual(result.code, 0);
    const parsed = JSON.parse(result.stdout);
    assert.ok(parsed.selectedModuleIds.includes('cc4pm-guide'));
    assert.strictEqual(parsed.targetAdapterId, 'claude-home');
    assert.ok(Array.isArray(parsed.operations));
    assert.ok(parsed.operations.length > 0);
  })) passed++; else failed++;

  if (test('fails on unknown arguments', () => {
    const result = run(['--unknown-flag']);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes('Unknown argument'));
  })) passed++; else failed++;

  if (test('fails on invalid install target', () => {
    const result = run(['--modules', 'cc4pm-guide', '--target', 'not-a-target']);
    assert.strictEqual(result.code, 1);
    assert.ok(result.stderr.includes('Unknown install target'));
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
