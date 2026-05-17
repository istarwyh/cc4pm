const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const guideLessonsDir = path.join(repoRoot, 'guide', 'lessons');
const skillPath = path.join(repoRoot, '.claude', 'skills', 'cc4pm-guide', 'SKILL.md');

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

function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return markdownFiles(fullPath);
    }
    return entry.isFile() && entry.name.endsWith('.md') ? [fullPath] : [];
  });
}

function withoutFencedCode(content) {
  return content.replace(/^```[\s\S]*?^```/gm, '');
}

function nextStepSections(content) {
  const normalized = withoutFencedCode(content);
  const sections = [];
  const heading = /^## 下一步\s*$/gm;
  let match = heading.exec(normalized);

  while (match) {
    const start = match.index;
    const nextMatch = heading.exec(normalized);
    const rest = normalized.slice(start);
    const horizontalRule = rest.search(/^---\s*$/m);
    const end = horizontalRule === -1 ? (nextMatch ? nextMatch.index : normalized.length) : start + horizontalRule;
    sections.push(normalized.slice(start, end));
    match = nextMatch;
  }

  return sections;
}

function runTests() {
  console.log('\n=== Testing courseware interactions ===\n');

  let passed = 0;
  let failed = 0;

  if (test('cc4pm-guide skill does not show numbered menus to learners', () => {
    const skill = fs.readFileSync(skillPath, 'utf8');
    assert.match(skill, /AskUserQuestion/, 'SKILL.md should instruct the coach to use AskUserQuestion');
    assert.doesNotMatch(skill, /^\s*(?:\*\*)?\[[1-9]\]/m, 'SKILL.md should not contain numbered menu options');
  })) passed++; else failed++;

  if (test('lesson next-step sections use AskUserQuestion choices', () => {
    const failures = markdownFiles(guideLessonsDir).flatMap((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      return nextStepSections(content).flatMap((section) => {
        const relativePath = path.relative(repoRoot, filePath);
        const askFailure = /AskUserQuestion/.test(section) ? [] : [`${relativePath}: missing AskUserQuestion in 下一步 section`];
        const numberFailure = /^- \[[1-9]\]/m.test(section) ? [`${relativePath}: contains numbered next-step choice`] : [];
        return [...askFailure, ...numberFailure];
      });
    });

    assert.deepStrictEqual(failures, []);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
