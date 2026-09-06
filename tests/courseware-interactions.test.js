const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.join(__dirname, '..');
const guideLessonsDir = path.join(repoRoot, 'guide', 'lessons');
const skillPath = path.join(repoRoot, '.claude', 'skills', 'cc4pm-guide', 'SKILL.md');
const agentGalleryPath = path.join(repoRoot, 'guide', 'lessons', 'stage-1', 'lesson-7-agent-gallery.html');

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

function extractDecisionTreeScript(html) {
  const start = html.indexOf('let dtState = { step: 1, answers: {} };');
  const end = html.indexOf('/* ===================================================================\n   Init', start);
  assert.notStrictEqual(start, -1, 'decision tree state should exist');
  assert.notStrictEqual(end, -1, 'decision tree init marker should exist');
  return html.slice(start, end);
}

function makeClassList(node) {
  return {
    add: (...classes) => {
      const names = new Set(node.className.split(/\s+/).filter(Boolean));
      classes.forEach((name) => names.add(name));
      node.className = [...names].join(' ');
    },
    remove: (...classes) => {
      const removeNames = new Set(classes);
      node.className = node.className
        .split(/\s+/)
        .filter(Boolean)
        .filter((name) => !removeNames.has(name))
        .join(' ');
    }
  };
}

function makeNode(className) {
  const node = {
    className,
    style: {},
    textContent: '',
    innerHTML: '',
    choices: [{ className: 'dt-choice' }, { className: 'dt-choice' }],
    querySelectorAll(selector) {
      return selector === '.dt-choice' ? this.choices : [];
    }
  };
  node.classList = makeClassList(node);
  return node;
}

function runDecisionPath(answers) {
  const nodes = {
    dtNode1: makeNode('dt-node'),
    dtNode2: makeNode('dt-node inactive'),
    dtNode3: makeNode('dt-node inactive'),
    dtConn1: makeNode('dt-connector'),
    dtConn2: makeNode('dt-connector'),
    dtResult: makeNode('dt-result'),
    dtResetBtn: makeNode('dt-reset')
  };
  const context = {
    document: {
      getElementById(id) {
        assert.ok(nodes[id], `unexpected decision tree DOM id: ${id}`);
        return nodes[id];
      },
      querySelectorAll(selector) {
        return selector === '.dt-connector' ? [nodes.dtConn1, nodes.dtConn2] : [];
      }
    }
  };

  vm.createContext(context);
  const html = fs.readFileSync(agentGalleryPath, 'utf8');
  vm.runInContext(extractDecisionTreeScript(html), context);
  answers.forEach((yes, index) => context.dtAnswer(index + 1, yes));
  return nodes;
}

function assertDecisionPath(answers, expectedClass, expectedText) {
  const { dtResult } = runDecisionPath(answers);
  assert.match(dtResult.className, new RegExp(`\\b${expectedClass}\\b`));
  assert.match(dtResult.innerHTML, expectedText);
  return dtResult;
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

  if (test('lesson 7 decision tree routes according to lesson guidance', () => {
    assertDecisionPath([false], 'stay-main', /留在主对话/);
    assertDecisionPath([true, true], 'use-agent', /\/subtask/);

    const afterQ2No = runDecisionPath([true, false]);
    assert.doesNotMatch(afterQ2No.dtResult.className, /\bshow\b/, 'Q2 no should ask Q3 before showing a result');
    assert.doesNotMatch(afterQ2No.dtNode3.className, /\binactive\b/, 'Q2 no should activate Q3');
    assert.match(afterQ2No.dtConn2.className, /\bactive\b/, 'Q2 no should activate the connector to Q3');

    const q3Yes = assertDecisionPath([true, false, true], 'use-agent', /子代理/);
    assert.doesNotMatch(q3Yes.innerHTML, /\/subtask/, 'Q3 yes should choose an ordinary subagent, not /subtask');

    assertDecisionPath([true, false, false], 'stay-main', /留在主对话/);
  })) passed++; else failed++;

  console.log(`\nResults: Passed: ${passed}, Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
