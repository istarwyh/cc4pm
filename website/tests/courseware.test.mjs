import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { digest, inside, loadCatalog, siteURL, splitFrontMatter, transformMarkdown } from '../scripts/content.mjs';
import { prepareSite, repositoryRoot } from '../scripts/generate.mjs';
import { renderHomepage } from '../scripts/homepage.mjs';
import { inspectHtml } from '../scripts/validate.mjs';

test('course order uses map entries, preserving 17.10 and repeated local IDs', () => {
  const { courses } = loadCatalog(repositoryRoot);
  const product = courses.find(c => c.id === 'product');
  assert.equal(product.lessons.length, 78);
  assert.equal(courses.find(c => c.id === 'lawyer').lessons.length, 10);
  const index = product.lessons.findIndex(l => l.number === '17.10');
  assert.equal(product.lessons[index - 1].number, '17.9');
  assert.equal(product.lessons[index + 1].number, '18');
  assert.match(product.lessons[index].route, /stage-3\/lesson-1\.10\/$/);
  assert.equal(new Set(courses.flatMap(c => c.lessons.map(l => l.id))).size, 88);
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

function codeBlocks(source) {
  const blocks = [];
  const visit = node => { if (node.type === 'code') blocks.push({ lang: node.lang, value: node.value }); for (const child of node.children || []) visit(child); };
  visit(fromMarkdown(splitFrontMatter(source).body));
  return blocks;
}

test('all courseware publishes without rewriting sources, and source edits flow to every consumer', (t) => {
  const root = fixture(t);
  const original = fs.readFileSync(path.join(root, 'guide/lessons/stage-1/lesson-1.md'), 'utf8');
  const manifest = prepareSite({ root, baseURL: 'https://example.org/project/' });
  assert.equal(manifest.lessons.length, 88);
  assert.equal(manifest.assets.filter(a => a.route.endsWith('.html')).length, 11);
  assert.equal(manifest.assets.filter(a => a.route.startsWith('/downloads/')).length, 28);
  assert.ok(!manifest.assets.some(a => a.source.endsWith('.wechat.html')));
  for (const lesson of manifest.lessons) {
    const source = fs.readFileSync(path.join(root, lesson.source), 'utf8');
    assert.equal(digest(source), manifest.sources[lesson.source]);
    const generated = fs.readFileSync(path.join(root, 'website/.generated/content', lesson.route.slice(1, -1) + '.md'), 'utf8');
    assert.deepEqual(codeBlocks(generated), codeBlocks(source), `Code changed: ${lesson.source}`);
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
  assert.equal(inspectHtml(homepage).links.filter(l => l.includes('/courses/product/stage-')).length, 78);
  // Frontmatter drift is surfaced instead of silently changing the teaching source's meaning.
  map.stages[4].lessons.find(l => l.number === 24.1).title = 'Conflicting title';
  fs.writeFileSync(mapFile, yaml.dump(map));
  assert.throws(() => loadCatalog(root), /Metadata differs/);
});
