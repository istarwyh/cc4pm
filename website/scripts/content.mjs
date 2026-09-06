import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import yaml from 'js-yaml';
import { fromMarkdown } from 'mdast-util-from-markdown';

export const readYaml = (file) => yaml.load(fs.readFileSync(file, 'utf8'));
export const escapeHtml = (text) => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const slash = (file) => file.split(path.sep).join('/');
export const digest = (text) => createHash('sha256').update(text).digest('hex');

export function inside(root, relative) {
  const file = path.resolve(root, relative);
  const rel = path.relative(root, file);
  if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error(`Path leaves repository: ${relative}`);
  if (!fs.existsSync(file)) throw new Error(`Missing source: ${relative}`);
  const real = fs.realpathSync(file);
  if (real !== file) {
    const realRel = path.relative(fs.realpathSync(root), real);
    if (realRel === '..' || realRel.startsWith(`..${path.sep}`) || path.isAbsolute(realRel)) throw new Error(`Symlink leaves repository: ${relative}`);
  }
  return file;
}

export function siteURL(base, route) {
  const url = new URL(base);
  if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash) throw new Error(`Invalid site baseURL: ${base}`);
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return new URL(route.replace(/^\//, ''), url).href;
}

export function walkFiles(dir, excluded = []) {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    if (entry.name.startsWith('.') || excluded.includes(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full, excluded) : entry.isFile() ? [full] : [];
  });
}

export function splitFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match ? { data: yaml.load(match[1]) || {}, body: source.slice(match[0].length) } : { data: {}, body: source };
}

export function loadCatalog(root) {
  const settings = readYaml(inside(root, 'website/site.yaml'));
  const modules = JSON.parse(fs.readFileSync(inside(root, 'manifests/install-modules.json'), 'utf8')).modules;
  const identities = new Set();
  const courses = settings.courses.map((entry) => {
    if (!/^[a-z][a-z0-9-]*$/.test(entry.id) || identities.has(entry.id)) throw new Error(`Invalid/duplicate course: ${entry.id}`);
    identities.add(entry.id);
    const mapFile = `${entry.guide}/course-map.yaml`;
    const map = readYaml(inside(root, mapFile));
    const module = modules.find(m => m.id === entry.module);
    if (!module) throw new Error(`Unknown install module: ${entry.module}`);
    const seen = new Set();
    const numbers = new Set();
    const stages = map.stages.map((stage, stageIndex) => {
      if (!/^stage-\d+$/.test(stage.id) || seen.has(stage.id)) throw new Error(`Invalid/duplicate stage: ${stage.id}`);
      seen.add(stage.id);
      return { ...stage, weight: (stageIndex + 1) * 10, lessons: stage.lessons.map((lesson, lessonIndex) => {
        const id = `${entry.id}/${stage.id}/${lesson.id}`;
        if (!/^lesson-[0-9]+(?:\.[0-9]+)*$/.test(lesson.id) || seen.has(id)) throw new Error(`Invalid/duplicate lesson: ${id}`);
        seen.add(id);
        const number = String(lesson.number);
        if (numbers.has(number)) throw new Error(`Duplicate lesson number: ${entry.id}/${number}`);
        numbers.add(number);
        const source = slash(path.join(entry.guide, 'lessons', stage.id, lesson.file));
        const text = fs.readFileSync(inside(root, source), 'utf8');
        const { data } = splitFrontMatter(text);
        for (const key of ['title', 'number', 'short_title', 'supplementary']) {
          if (key in data && key in lesson && String(data[key]) !== String(lesson[key])) throw new Error(`Metadata differs from course map: ${source}: ${key}`);
        }
        if (data.stage && data.stage !== stage.id) throw new Error(`Stage differs from course map: ${source}`);
        return { ...lesson, id, lessonId: lesson.id, number, source, stageId: stage.id, route: `/courses/${entry.id}/${stage.id}/${lesson.id}/`, weight: (lessonIndex + 1) * 10 };
      }) };
    });
    const lessons = stages.flatMap(s => s.lessons);
    const main = lessons.filter(l => !l.supplementary).length;
    const supplementary = lessons.length - main;
    if (map.meta.total_lessons !== main || (map.meta.supplementary_lessons ?? 0) !== supplementary) throw new Error(`Course counts differ: ${entry.id}`);
    return { ...entry, mapFile, meta: map.meta, stages, lessons, main, supplementary, stability: module.stability, route: `/courses/${entry.id}/` };
  });
  return { ...settings, courses, version: JSON.parse(fs.readFileSync(inside(root, 'package.json'), 'utf8')).version };
}

export function sourceMetadata(root, source, settings) {
  const encoded = source.split('/').map(encodeURIComponent).join('/');
  let date;
  try { date = execFileSync('git', ['log', '-1', '--format=%cI', '--', source], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* A source archive has no Git history. */ }
  return {
    source_path: source,
    source_url: `${settings.repository}/blob/${settings.branch}/${encoded}`,
    edit_url: `${settings.repository}/edit/${settings.branch}/${encoded}`,
    ...(date ? { source_date: date, lastmod: date } : {}),
  };
}

function visit(node, callback) {
  callback(node);
  for (const child of node.children || []) visit(child, callback);
}

export function transformMarkdown(source, { sourcePath, resolveLink, removeTitle = true, removeFooter = true }) {
  const { body } = splitFrontMatter(source);
  const tree = fromMarkdown(body);
  const edits = [];
  const removed = new Set();
  const first = tree.children[0];
  if (removeTitle && first?.type === 'heading' && first.depth === 1) {
    edits.push({ start: first.position.start.offset, end: first.position.end.offset, text: '' });
    removed.add(first);
  }
  const last = tree.children.at(-1);
  if (removeFooter && last?.type === 'paragraph' && /^\*阶段\s.+\*$/s.test(body.slice(last.position.start.offset, last.position.end.offset))) {
    edits.push({ start: last.position.start.offset, end: last.position.end.offset, text: '' });
    removed.add(last);
  }
  visit(tree, node => {
    if ([...removed].some(parent => node.position.start.offset >= parent.position.start.offset && node.position.end.offset <= parent.position.end.offset) || !['link', 'image', 'definition'].includes(node.type)) return;
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(node.url)) return;
    const replacement = resolveLink(node.url, sourcePath);
    if (replacement === node.url) return;
    const raw = body.slice(node.position.start.offset, node.position.end.offset);
    const match = node.type === 'definition' ? raw.match(/^\[[^\]]+\]:\s*(<?)(\S+?)(>?)(?:\s|$)/) : raw.match(/\]\(\s*(<?)((?:\\.|[^\s)])+)(>?)/);
    if (!match) throw new Error(`Cannot locate link destination in ${sourcePath}: ${raw}`);
    const token = match[2].replace(/>$/, '');
    const start = node.position.start.offset + match.index + match[0].indexOf(match[1] + token) + match[1].length;
    edits.push({ start, end: start + token.length, text: replacement.replace(/\(/g, '%28').replace(/\)/g, '%29') });
  });
  let result = body;
  for (const edit of edits.sort((a, b) => b.start - a.start)) result = result.slice(0, edit.start) + edit.text + result.slice(edit.end);
  return result.trim() + '\n';
}

export function markdownLinks(source) {
  const links = [];
  visit(fromMarkdown(splitFrontMatter(source).body), n => { if (['link', 'image', 'definition'].includes(n.type)) links.push(n.url); });
  return links;
}

export function writePage(directory, route, metadata, body, section = false) {
  const base = route.replace(/^\//, '').replace(/\/$/, '');
  const file = section ? `${base}/_index.md` : `${base}.md`;
  const dest = path.join(directory, file);
  if (fs.existsSync(dest)) throw new Error(`Duplicate generated page: ${route}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `---\n${yaml.dump(metadata, { lineWidth: -1, noRefs: true })}---\n\n${body}`);
}
