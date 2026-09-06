import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'parse5';
import { codeBlocks, digest, walkFiles } from './content.mjs';

export function inspectHtml(html) {
  const links = [];
  const ids = new Set();
  const headings = [];
  const code = [];
  const text = node => node.nodeName === '#text' ? node.value : (node.childNodes || []).map(text).join('');
  const visit = (node) => {
    const attrs = Object.fromEntries((node.attrs || []).map(a => [a.name, a.value]));
    if (attrs.id) ids.add(attrs.id);
    if (node.tagName === 'h1') headings.push(node);
    if (node.tagName === 'code') code.push(text(node).trimEnd());
    for (const key of ['href', 'src', 'poster']) if (attrs[key]) links.push(attrs[key]);
    for (const child of node.childNodes || []) visit(child);
  };
  visit(parse(html));
  return { links, ids, headings, code };
}

export function validateSite({ root, outputDir = path.join(root, 'website/public'), generatedDir = path.join(root, 'website/.generated') }) {
  const manifest = JSON.parse(fs.readFileSync(path.join(generatedDir, 'manifest.json'), 'utf8'));
  const base = new URL(manifest.baseURL);
  const errors = [];
  const files = walkFiles(outputDir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  const parsed = new Map(htmlFiles.map(f => [f, inspectHtml(fs.readFileSync(f, 'utf8'))]));
  let checked = 0;
  function fileFor(url) {
    const decoded = decodeURIComponent(url.pathname);
    const prefix = decodeURIComponent(base.pathname);
    if (!decoded.startsWith(prefix)) return null;
    const relative = decoded.slice(prefix.length);
    const candidate = path.resolve(outputDir, relative);
    if (!candidate.startsWith(path.resolve(outputDir) + path.sep) && candidate !== path.resolve(outputDir)) return null;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    return path.join(candidate, 'index.html');
  }
  for (const [file, doc] of parsed) {
    const relative = path.relative(outputDir, file).split(path.sep).join('/');
    const page = new URL(relative.replace(/index\.html$/, ''), base);
    for (const link of doc.links) {
      if (!link || /^(?:data:|javascript:|mailto:|tel:|blob:)/i.test(link)) continue;
      let target;
      try { target = new URL(link, page); } catch { errors.push(`${relative}: invalid URL ${link}`); continue; }
      if (target.origin !== base.origin) continue;
      const destination = fileFor(target);
      checked++;
      if (!destination || !fs.existsSync(destination)) {
        errors.push(`${relative}: missing ${target.pathname}`);
      } else if (target.hash && target.hash !== '#' && parsed.has(destination)) {
        const id = decodeURIComponent(target.hash.slice(1));
        if (!parsed.get(destination).ids.has(id)) errors.push(`${relative}: missing anchor ${target.pathname}#${id}`);
      }
    }
  }
  for (const file of files.filter(f => f.endsWith('.css'))) {
    const relative = path.relative(outputDir, file).split(path.sep).join('/');
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^(?:data:|#)/.test(match[1])) continue;
      const target = new URL(match[1], new URL(relative, base));
      if (target.origin === base.origin) {
        checked++;
        const destination = fileFor(target);
        if (!destination || !fs.existsSync(destination)) errors.push(`${relative}: missing CSS resource ${target.pathname}`);
      }
    }
  }
  for (const lesson of manifest.lessons) {
    const file = fileFor(new URL(lesson.route.replace(/^\//, ''), base));
    if (!file || !parsed.has(file)) { errors.push(`Lesson missing: ${lesson.source}`); continue; }
    if (parsed.get(file).headings.length !== 1) errors.push(`Lesson must have one H1: ${lesson.source}`);
    const markdown = path.join(path.dirname(file), 'index.md');
    if (!fs.existsSync(markdown)) errors.push(`Markdown output missing: ${lesson.source}`);
    else {
      const original = codeBlocks(fs.readFileSync(path.join(root, lesson.source), 'utf8'));
      if (JSON.stringify(codeBlocks(fs.readFileSync(markdown, 'utf8'))) !== JSON.stringify(original)) errors.push(`Published Markdown code changed: ${lesson.source}`);
      for (const block of original.filter(block => /\{\{[<%]/.test(block.value))) {
        if (!parsed.get(file).code.includes(block.value.trimEnd())) errors.push(`HTML shortcode example changed: ${lesson.source}`);
      }
    }
  }
  for (const [source, hash] of Object.entries(manifest.sources)) {
    if (digest(fs.readFileSync(path.join(root, source))) !== hash) errors.push(`Source changed during build: ${source}`);
  }
  for (const file of ['llms.txt', 'navigation.json', '404.html', 'sitemap.xml']) {
    if (!fs.existsSync(path.join(outputDir, file))) errors.push(`Required output missing: ${file}`);
  }
  const homepage = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');
  if (homepage !== fs.readFileSync(path.join(generatedDir, 'assets/homepage.html'), 'utf8')) errors.push('Homepage differs from the shared renderer');
  if (/@@CC4PM_/.test(homepage)) errors.push('Unresolved homepage values');
  const uniqueErrors = [...new Set(errors)];
  if (uniqueErrors.length) throw new Error(`Site verification failed (${uniqueErrors.length}):\n${uniqueErrors.slice(0,60).join('\n')}`);
  console.log(`Verified ${manifest.lessons.length} lessons, ${htmlFiles.length} HTML pages and ${checked} local links/resources; source files unchanged.`);
  return { lessons: manifest.lessons.length, htmlPages: htmlFiles.length, links: checked };
}
