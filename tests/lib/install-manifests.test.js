/**
 * Tests for scripts/lib/install-manifests.js
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  loadInstallManifests,
  listInstallModules,
  resolveInstallPlan,
} = require('../../scripts/lib/install-manifests');

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

function createTestRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'install-manifests-'));
  fs.mkdirSync(path.join(root, 'manifests'), { recursive: true });
  return root;
}

function cleanupTestRepo(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function runTests() {
  console.log('\n=== Testing install-manifests.js ===\n');

  let passed = 0;
  let failed = 0;

  if (test('loads real project install manifests', () => {
    const manifests = loadInstallManifests();
    assert.ok(manifests.modules.length >= 1, 'Should load modules');
  })) passed++; else failed++;

  if (test('lists install modules from the real project', () => {
    const modules = listInstallModules();
    assert.ok(modules.some(module => module.id === 'cc4pm-guide'), 'Should include cc4pm-guide');
  })) passed++; else failed++;

  if (test('exposes cc4lawyer-guide as an optional vertical course module', () => {
    const manifests = loadInstallManifests();
    const module = manifests.modulesById.get('cc4lawyer-guide');
    assert.ok(module, 'Should include cc4lawyer-guide');
    assert.strictEqual(module.defaultInstall, false, 'cc4lawyer-guide should not be default-installed');
    assert.deepStrictEqual(module.targets, ['claude']);
    assert.strictEqual(module.stability, 'beta');
    assert.deepStrictEqual(module.paths, [
      '.claude/skills/cc4lawyer-guide',
      'verticals/lawyer',
    ]);

    for (const installPath of module.paths) {
      assert.ok(!installPath.startsWith('.claude/skills/lawyer-'), `Should not install runtime lawyer skill ${installPath}`);
      assert.ok(!installPath.startsWith('.claude/agents/legal-'), `Should not install runtime legal agent ${installPath}`);
      assert.ok(!installPath.startsWith('.claude/rules/legal-'), `Should not install runtime legal rule ${installPath}`);
    }
  })) passed++; else failed++;

  if (test('keeps the cc4lawyer vertical manifest aligned with the root manifest', () => {
    const manifests = loadInstallManifests();
    const rootModule = manifests.modulesById.get('cc4lawyer-guide');
    const verticalManifestPath = path.join(
      manifests.repoRoot,
      'verticals',
      'lawyer',
      'manifests',
      'cc4lawyer-guide.json'
    );
    const verticalModule = JSON.parse(fs.readFileSync(verticalManifestPath, 'utf8'));
    assert.deepStrictEqual(verticalModule, rootModule);
  })) passed++; else failed++;

  if (test('resolves the cc4pm-guide module for claude target', () => {
    const projectRoot = '/workspace/app';
    const plan = resolveInstallPlan({ moduleIds: ['cc4pm-guide'], target: 'claude', projectRoot });
    assert.ok(plan.selectedModuleIds.includes('cc4pm-guide'), 'Should select cc4pm-guide');
    assert.strictEqual(plan.targetAdapterId, 'claude-home');
    assert.ok(plan.operations.length > 0, 'Should include scaffold operations');
  })) passed++; else failed++;

  if (test('throws on unknown install module', () => {
    assert.throws(
      () => resolveInstallPlan({ moduleIds: ['ghost-module'] }),
      /Unknown install module/
    );
  })) passed++; else failed++;

  if (test('throws on unknown install target', () => {
    assert.throws(
      () => resolveInstallPlan({ moduleIds: ['cc4pm-guide'], target: 'not-a-target' }),
      /Unknown install target/
    );
  })) passed++; else failed++;

  if (test('throws when a dependency does not support the requested target', () => {
    const repoRoot = createTestRepo();
    fs.mkdirSync(path.join(repoRoot, 'parent'), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, 'child'), { recursive: true });
    writeJson(path.join(repoRoot, 'manifests', 'install-modules.json'), {
      version: 1,
      modules: [
        {
          id: 'parent',
          kind: 'skills',
          description: 'Parent',
          paths: ['parent'],
          targets: ['claude'],
          dependencies: ['child'],
          defaultInstall: false,
          cost: 'light',
          stability: 'stable'
        },
        {
          id: 'child',
          kind: 'skills',
          description: 'Child',
          paths: ['child'],
          targets: ['cursor'],
          dependencies: [],
          defaultInstall: false,
          cost: 'light',
          stability: 'stable'
        }
      ]
    });

    assert.throws(
      () => resolveInstallPlan({ repoRoot, moduleIds: ['parent'], target: 'claude' }),
      /does not support target claude/
    );
    cleanupTestRepo(repoRoot);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
