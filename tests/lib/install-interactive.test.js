/**
 * Tests for scripts/lib/install/interactive.js
 */

'use strict';

const assert = require('assert');

const {
  formatModuleLine,
  formatProfileLine,
  parseSelection,
  parseYesNo,
  isInteractiveSession,
} = require('../../scripts/lib/install/interactive');

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

let passed = 0;
let failed = 0;
const record = ok => { ok ? passed += 1 : failed += 1; };

console.log('install-interactive');

record(test('isInteractiveSession returns false when stdin is not TTY', () => {
  const result = isInteractiveSession({
    stdin: { isTTY: false },
    stdout: { isTTY: true },
  });
  assert.strictEqual(result, false);
}));

record(test('isInteractiveSession returns false when stdout is not TTY', () => {
  const result = isInteractiveSession({
    stdin: { isTTY: true },
    stdout: { isTTY: false },
  });
  assert.strictEqual(result, false);
}));

record(test('isInteractiveSession returns true when both TTY', () => {
  const result = isInteractiveSession({
    stdin: { isTTY: true },
    stdout: { isTTY: true },
  });
  assert.strictEqual(result, true);
}));

record(test('parseSelection treats empty input as empty', () => {
  assert.deepStrictEqual(parseSelection('', 3), { type: 'empty' });
  assert.deepStrictEqual(parseSelection('   ', 3), { type: 'empty' });
}));

record(test('parseSelection accepts single number', () => {
  assert.deepStrictEqual(parseSelection('2', 3), { type: 'indices', indices: [1] });
}));

record(test('parseSelection accepts comma- and space-separated numbers and dedupes', () => {
  assert.deepStrictEqual(
    parseSelection('1, 2 3,1', 3),
    { type: 'indices', indices: [0, 1, 2] },
  );
}));

record(test('parseSelection handles "all"', () => {
  assert.deepStrictEqual(parseSelection('all', 3), { type: 'indices', indices: [0, 1, 2] });
  assert.deepStrictEqual(parseSelection('a', 2), { type: 'indices', indices: [0, 1] });
  assert.deepStrictEqual(parseSelection('*', 1), { type: 'indices', indices: [0] });
}));

record(test('parseSelection handles cancel tokens', () => {
  for (const token of ['q', 'quit', 'cancel', 'exit']) {
    assert.deepStrictEqual(parseSelection(token, 3), { type: 'cancel' });
  }
}));

record(test('parseSelection rejects out-of-range numbers', () => {
  assert.deepStrictEqual(parseSelection('5', 3), { type: 'invalid', token: '5' });
  assert.deepStrictEqual(parseSelection('0', 3), { type: 'invalid', token: '0' });
}));

record(test('parseSelection rejects non-numeric tokens', () => {
  assert.deepStrictEqual(parseSelection('abc', 3), { type: 'invalid', token: 'abc' });
  assert.deepStrictEqual(parseSelection('1,abc', 3), { type: 'invalid', token: 'abc' });
}));

record(test('parseYesNo defaults to yes on empty', () => {
  assert.strictEqual(parseYesNo('', true), true);
  assert.strictEqual(parseYesNo('', false), false);
}));

record(test('parseYesNo accepts y/yes/n/no case-insensitively', () => {
  assert.strictEqual(parseYesNo('y'), true);
  assert.strictEqual(parseYesNo('Yes'), true);
  assert.strictEqual(parseYesNo('n'), false);
  assert.strictEqual(parseYesNo('NO'), false);
}));

record(test('parseYesNo falls back to default for unknown input', () => {
  assert.strictEqual(parseYesNo('maybe', true), true);
  assert.strictEqual(parseYesNo('maybe', false), false);
}));

record(test('formatModuleLine renders id, tags, and description', () => {
  const line = formatModuleLine({
    id: 'cc4pm-guide',
    description: 'Interactive courseware',
    defaultInstall: true,
    cost: 'heavy',
    stability: 'stable',
  }, 0);
  assert.match(line, /1\) cc4pm-guide/);
  assert.match(line, /default/);
  assert.match(line, /cost=heavy/);
  assert.match(line, /stability=stable/);
  assert.match(line, /Interactive courseware/);
}));

record(test('formatProfileLine renders id and module count', () => {
  const line = formatProfileLine({
    id: 'pm-essentials',
    description: 'Recommended for product makers',
    moduleCount: 4,
  }, 1);
  assert.match(line, /2\) pm-essentials/);
  assert.match(line, /4 modules/);
  assert.match(line, /Recommended for product makers/);
}));

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
