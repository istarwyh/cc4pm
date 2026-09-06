import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { digest, inside, loadCatalog, siteURL, slash, splitFrontMatter, transformMarkdown, walkFiles } from '../scripts/content.mjs';
import { prepareSite, repositoryRoot } from '../scripts/generate.mjs';
import { renderHomepage } from '../scripts/homepage.mjs';
import { inspectHtml } from '../scripts/validate.mjs';
import { syncContent } from '../scripts/sync.mjs';

test('a fixed fixture preserves decimal labels, map order and repeated local IDs', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc4pm-catalog-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  function write(file, content) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  write('package.json', JSON.stringify({ version: '0.0.0' }));
  write('manifests/install-modules.json', JSON.stringify({ modules: [{ id: 'fixture-guide', stability: 'stable' }] }));
  write('website/site.yaml', yaml.dump({ courses: [{ id: 'fixture', guide: 'guide', module: 'fixture-guide' }] }));
  const lesson = (id, number) => ({ id, number, title: `Lesson ${number}`, file: `${id}.md` });
  const stages = [
    { id: 'stage-1', lessons: [lesson('lesson-1.9', '17.9'), lesson('lesson-1.10', '17.10'), lesson('lesson-2', 18)] },
    { id: 'stage-2', lessons: [lesson('lesson-2', 19)] },
  ];
  for (const stage of stages) for (const entry of stage.lessons) write(`guide/lessons/${stage.id}/${entry.file}`, `# ${entry.title}\n`);
  const mapFile = 'guide/course-map.yaml';
  write(mapFile, yaml.dump({ meta: { total_lessons: 4 }, stages }));
  let course = loadCatalog(root).courses[0];
  assert.deepEqual(course.lessons.map(l => l.number), ['17.9', '17.10', '18', '19']);
  assert.equal(new Set(course.lessons.map(l => l.id)).size, 4);
  assert.match(course.lessons[1].route, /stage-1\/lesson-1\.10\/$/);
  // Explicit map order wins over numeric sorting.
  stages[0].lessons.reverse();
  write(mapFile, yaml.dump({ meta: { total_lessons: 4 }, stages }));
  course = loadCatalog(root).courses[0];
  assert.deepEqual(course.lessons.map(l => l.number), ['18', '17.10', '17.9', '19']);
});

test('Markdown adaptation preserves code and next steps while resolving real links', () => {
  const source = '---\ntitle: Example\n---\n\n# Example\n\n[Shared](../shared/notice.md?view=1#practice "read")\n\n[Reference][ref]\n\n[ref]: <../shared/notice.md#practice> "notice"\n\n```markdown\n# Literal title\n[do not change](../shared/notice.md)\n```\n\n## 下一步\n\n继续练习。\n\n*阶段 1 | Lesson 1/26 | 下一课: 2*\n';
  const result = transformMarkdown(source, { sourcePath: 'guide/lessons/test.md', resolveLink: dest => `https://example.org/cc4pm/docs/practice/${dest.slice(dest.indexOf('.md') + 3)}` });
  assert.ok(result.includes('[Shared](https://example.org/cc4pm/docs/practice/?view=1#practice "read")'));
  assert.ok(result.includes('[ref]: <https://example.org/cc4pm/docs/practice/#practice> "notice"'));
  assert.ok(result.includes('```markdown\n# Literal title\n[do not change](../shared/notice.md)\n```'));
  assert.ok(result.includes('## 下一步\n\n继续练习。'));
  assert.ok(!result.includes('*阶段 1'));
  assert.ok(!result.startsWith('# Example'));
  assert.equal(transformMarkdown('# [Linked title](title.md)\n\nBody.\n', { sourcePath: 'example.md', resolveLink: () => { throw new Error('Removed title must not be rewritten'); } }), 'Body.\n');
});

test('baseURL and source boundaries reject escaping the repository', () => {
  assert.equal(siteURL('https://example.org/project/', '/courses/'), 'https://example.org/project/courses/');
  assert.throws(() => siteURL('file:///tmp/', '/courses/'), /Invalid site baseURL/);
  assert.throws(() => inside(repositoryRoot, '../outside.md'), /leaves repository/);
  assert.throws(() => inside(repositoryRoot, 'guide/missing-file.md'), /Missing source/);
});

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc4pm-site-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const entry of ['guide', 'verticals/lawyer', 'website/content', 'website/site.yaml', 'docs/index.html', 'manifests/install-modules.json', 'package.json', 'CLAUDE.md']) {
    fs.mkdirSync(path.dirname(path.join(root, entry)), { recursive: true });
    fs.cpSync(path.join(repositoryRoot, entry), path.join(root, entry), { recursive: true });
  }
  return root;
}

function codeBlocks(source, { prepared = false } = {}) {
  const blocks = [];
  const visit = node => { if (node.type === 'code') blocks.push({ lang: node.lang, value: node.value }); for (const child of node.children || []) visit(child); };
  // Prepared Hugo escapes are stripped once by Hugo, including in Markdown output.
  let body = splitFrontMatter(source).body;
  if (prepared) body = body.replace(/\{\{([<%])\/\*([\s\S]*?)\*\/([>%])\}\}/g, '{{$1$2$3}}');
  visit(fromMarkdown(body));
  return blocks;
}

test('one sync repairs course counts, teaching navigation and homepage, and is idempotent', t => {
  const root = fixture(t);
  for (const entry of ['scripts/sync-courseware.js', '.claude/skills/cc4pm-guide/SKILL.md', 'packages/homepage/index.html']) {
    fs.mkdirSync(path.dirname(path.join(root, entry)), { recursive: true });
    fs.copyFileSync(path.join(repositoryRoot, entry), path.join(root, entry));
  }
  fs.symlinkSync(path.join(repositoryRoot, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  const mapFile = path.join(root, 'guide/course-map.yaml');
  const map = yaml.load(fs.readFileSync(mapFile, 'utf8'));
  const added = { ...map.stages[0].lessons[0], id: 'lesson-987654.1', file: 'lesson-maintenance-fixture.md', number: '987654.1', title: '维护测试新课程', short_title: '维护测试', supplementary: true };
  delete added.visuals;
  map.stages[0].lessons.push(added);
  fs.writeFileSync(mapFile, yaml.dump(map));
  fs.writeFileSync(path.join(root, 'guide/lessons/stage-1', added.file), '# 维护测试新课程\n\n正文练习。\n\n## 下一步\n\n继续学习。\n\n*阶段 1 | 待同步*\n');
  assert.throws(() => syncContent({ root, check: true }), /stale supplementary_lessons/);
  syncContent({ root });
  syncContent({ root, check: true });
  assert.equal(yaml.load(fs.readFileSync(mapFile, 'utf8')).meta.supplementary_lessons, map.meta.supplementary_lessons + 1);
  assert.match(fs.readFileSync(path.join(root, 'packages/homepage/index.html'), 'utf8'), /维护测试新课程/);
  assert.match(fs.readFileSync(path.join(root, '.claude/skills/cc4pm-guide/SKILL.md'), 'utf8'), /维护测试新课程/);
  const snapshot = () => Object.fromEntries(walkFiles(root).filter(file => !file.includes(`${path.sep}node_modules${path.sep}`)).map(file => [file, digest(fs.readFileSync(file))]));
  const before = snapshot();
  syncContent({ root });
  assert.deepEqual(snapshot(), before);
});

function sourceInventory(root) {
  const settings = yaml.load(fs.readFileSync(path.join(root, 'website/site.yaml'), 'utf8'));
  const lessons = [], interactive = [], downloads = [];
  for (const course of settings.courses) {
    const map = yaml.load(fs.readFileSync(path.join(root, course.guide, 'course-map.yaml'), 'utf8'));
    for (const stage of map.stages) for (const lesson of stage.lessons) {
      lessons.push({ course: course.id, source: slash(path.join(course.guide, 'lessons', stage.id, lesson.file)) });
    }
    interactive.push(...walkFiles(path.join(root, course.guide, 'lessons')).filter(f => f.endsWith('.html') && !f.endsWith('.wechat.html')).map(f => slash(path.relative(root, f))));
    for (const group of course.materials || []) downloads.push(...walkFiles(path.join(root, group.directory), group.exclude).filter(f => f.endsWith('.md')).map(f => slash(path.relative(root, f))));
  }
  return { lessons, interactive, downloads };
}

test('all courseware publishes without rewriting sources, and source edits flow to every consumer', (t) => {
  const root = fixture(t);
  const original = fs.readFileSync(path.join(root, 'guide/lessons/stage-1/lesson-1.md'), 'utf8');
  const expected = sourceInventory(root);
  const manifest = prepareSite({ root, baseURL: 'https://example.org/project/' });
  assert.deepEqual(manifest.lessons.map(l => ({ course: l.course, source: l.source })), expected.lessons);
  assert.equal(new Set(manifest.lessons.map(l => l.route)).size, expected.lessons.length);
  assert.deepEqual(manifest.assets.filter(a => a.route.endsWith('.html')).map(a => a.source).sort(), expected.interactive.sort());
  assert.deepEqual(manifest.assets.filter(a => a.route.startsWith('/downloads/')).map(a => a.source).sort(), expected.downloads.sort());
  assert.ok(!manifest.assets.some(a => a.source.endsWith('.wechat.html')));
  for (const lesson of manifest.lessons) {
    const source = fs.readFileSync(path.join(root, lesson.source), 'utf8');
    assert.equal(digest(source), manifest.sources[lesson.source]);
    const generated = fs.readFileSync(path.join(root, 'website/.generated/content', lesson.route.slice(1, -1) + '.md'), 'utf8');
    assert.deepEqual(codeBlocks(generated, { prepared: true }), codeBlocks(source), `Code changed: ${lesson.source}`);
    assert.ok(generated.includes('## 下一步'), `Next steps lost: ${lesson.source}`);
  }
  assert.equal(fs.readFileSync(path.join(root, 'guide/lessons/stage-1/lesson-1.md'), 'utf8'), original);
  const css = fs.readFileSync(path.join(root, 'guide/lessons/assets/base.css'));
  assert.equal(digest(css), digest(fs.readFileSync(path.join(root, 'website/.generated/static/interactive/product/assets/base.css'))));
  const html = fs.readFileSync(path.join(root, 'website/.generated/static/interactive/product/stage-1/lesson-1-panorama.html'), 'utf8');
  assert.ok(html.includes('../assets/base.css'));
  assert.ok(html.includes('https://example.org/project/courses/product/stage-1/lesson-1/'));
  const mapFile = path.join(root, 'guide/course-map.yaml');
  const map = yaml.load(fs.readFileSync(mapFile, 'utf8'));
  map.stages[0].lessons[0].title = '测试新的课程标题';
  map.stages[0].lessons[0].short_title = '新课程标题';
  fs.writeFileSync(mapFile, yaml.dump(map));
  fs.appendFileSync(path.join(root, 'guide/lessons/stage-1/lesson-1.md'), '\n新增的正文内容。\n');
  fs.writeFileSync(path.join(root, 'website/.generated/content/removed-lesson.md'), 'obsolete');
  prepareSite({ root, baseURL: 'https://example.org/project/' });
  assert.ok(!fs.existsSync(path.join(root, 'website/.generated/content/removed-lesson.md')));
  const generated = fs.readFileSync(path.join(root, 'website/.generated/content/courses/product/stage-1/lesson-1.md'), 'utf8');
  assert.ok(generated.includes('新增的正文内容。'));
  assert.ok(generated.includes('测试新的课程标题'));
  const catalogPage = fs.readFileSync(path.join(root, 'website/.generated/content/courses/product/_index.md'), 'utf8');
  assert.ok(catalogPage.includes('测试新的课程标题'));
  const homepage = renderHomepage(root);
  assert.ok(homepage.includes('测试新的课程标题'));
  assert.equal(inspectHtml(homepage).links.filter(l => l.includes('/courses/product/stage-')).length, expected.lessons.filter(l => l.course === 'product').length);
  // Adding a lesson needs no edits to tests or a second navigation list.
  const added = { id: 'lesson-987654.1', file: 'lesson-maintenance-fixture.md', number: '987654.1', title: '生命周期新增课件', supplementary: true };
  map.stages[0].lessons.push(added);
  map.meta.supplementary_lessons++;
  const addedSource = path.join(root, 'guide/lessons', map.stages[0].id, added.file);
  fs.writeFileSync(addedSource, '# 生命周期新增课件\n\n新增的练习。\n\n## 下一步\n\n继续学习。\n');
  fs.writeFileSync(mapFile, yaml.dump(map));
  const expanded = prepareSite({ root, baseURL: 'https://example.org/project/' });
  assert.equal(expanded.lessons.length, expected.lessons.length + 1);
  const published = expanded.lessons.find(l => l.number === added.number);
  assert.ok(published);
  const addedPage = path.join(root, 'website/.generated/content', published.route.slice(1, -1) + '.md');
  assert.ok(fs.readFileSync(addedPage, 'utf8').includes('新增的练习。'));
  assert.ok(renderHomepage(root).includes(added.title));
  map.stages[0].lessons.pop();
  map.meta.supplementary_lessons--;
  fs.writeFileSync(mapFile, yaml.dump(map));
  fs.rmSync(addedSource);
  const reduced = prepareSite({ root, baseURL: 'https://example.org/project/' });
  assert.equal(reduced.lessons.length, expected.lessons.length);
  assert.ok(!fs.existsSync(addedPage));
  assert.ok(!renderHomepage(root).includes(added.title));
  // Frontmatter drift is surfaced instead of silently changing the teaching source's meaning.
  fs.writeFileSync(path.join(root, 'guide/lessons/stage-1/lesson-1.md'), '---\ntitle: Conflicting title\n---\n' + original);
  assert.throws(() => loadCatalog(root), /Metadata differs/);
});
