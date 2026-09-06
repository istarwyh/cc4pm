import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { digest, escapeHtml as h, inside, loadCatalog, markdownLinks, readYaml, siteURL, slash, sourceMetadata, transformMarkdown, walkFiles, writePage } from './content.mjs';
import { renderHomepage } from './homepage.mjs';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function prepareSite({ root = repositoryRoot, baseURL, generatedDir = path.join(root, 'website/.generated') } = {}) {
  const catalog = loadCatalog(root);
  baseURL ||= catalog.productionURL;
  const url = route => siteURL(baseURL, route);
  const routes = new Map();
  const pageSpecs = [];
  const assets = [];
  const hashes = {};
  const fileDates = new Map();
  const metadata = source => {
    if (!fileDates.has(source)) fileDates.set(source, sourceMetadata(root, source, catalog));
    return fileDates.get(source);
  };
  const register = (source, route) => {
    if (routes.has(source)) throw new Error(`Source registered twice: ${source}`);
    inside(root, source);
    routes.set(source, route);
    hashes[source] = digest(fs.readFileSync(inside(root, source)));
  };
  const add = (route, data, body, section = false) => pageSpecs.push({ route, data, body, section });

  register('guide/lessons/shared/practice-notice.md', '/docs/practice/');
  for (const course of catalog.courses) {
    hashes[course.mapFile] = digest(fs.readFileSync(inside(root, course.mapFile)));
    for (const lesson of course.lessons) register(lesson.source, lesson.route);
    if (course.overview) register(course.overview, course.route);
    for (const file of walkFiles(inside(root, `${course.guide}/lessons`))) {
      if (file.endsWith('.html') && !file.endsWith('.wechat.html') || file.endsWith('.css')) {
        const source = slash(path.relative(root, file));
        const relative = slash(path.relative(path.join(root, course.guide, 'lessons'), file));
        const route = `/interactive/${course.id}/${relative}`;
        register(source, route);
        assets.push({ source, route, course });
      }
    }
    for (const group of course.materials || []) {
      const materialRoot = `/courses/${course.id}/materials/${group.id}/`;
      group.pages = [];
      for (const file of walkFiles(inside(root, group.directory), group.exclude)) {
        if (!file.endsWith('.md')) continue;
        const source = slash(path.relative(root, file));
        const relative = slash(path.relative(path.join(root, group.directory), file));
        const route = `${materialRoot}${relative === 'README.md' ? 'overview' : relative.replace(/\.md$/, '').toLowerCase()}/`;
        const content = fs.readFileSync(file, 'utf8');
        const title = content.match(/^#\s+(.+)$/m)?.[1] || path.basename(file, '.md');
        const download = `/downloads/${course.id}/${group.id}/${relative}`;
        register(source, route);
        group.pages.push({ source, route, title, download });
        assets.push({ source, route: download });
      }
    }
  }

  // Register hand-authored documentation before resolving links to it.
  for (const file of walkFiles(inside(root, 'website/content'))) {
    if (!file.endsWith('.md')) continue;
    const source = slash(path.relative(root, file));
    const relative = slash(path.relative(path.join(root, 'website/content'), file));
    register(source, `/${relative.replace(/(?:^|\/)_(?:index)\.md$/, '').replace(/\.md$/, '')}/`.replace(/\/+/g, '/'));
  }
  const resolveLink = (destination, source) => {
    if (destination.startsWith('/')) {
      // Authored site links are relative to the deployment base, including project Pages.
      return url(destination);
    }
    const match = destination.match(/^([^?#]*)(.*)$/);
    const relative = decodeURIComponent(match[1]);
    if (!relative) return destination;
    const target = slash(path.relative(root, inside(root, path.join(path.dirname(source), relative))));
    const route = routes.get(target);
    if (route) return url(route) + match[2];
    // Non-published repository examples remain source links rather than being copied blindly.
    return metadata(target).source_url + match[2];
  };
  const transform = source => transformMarkdown(fs.readFileSync(inside(root, source), 'utf8'), { sourcePath: source, resolveLink });
  const lessonList = (lessons) => `<ul class="course-list">\n${lessons.map(l => `<li data-supplementary="${Boolean(l.supplementary)}"><a href="${h(url(l.route))}"><span class="course-number">${h(l.number)}</span><span>${h(l.title)}</span>${l.supplementary ? '<small>补充</small>' : ''}</a></li>`).join('\n')}\n</ul>\n`;
  const interactiveBySource = new Map();
  for (const course of catalog.courses) {
    for (const lesson of course.lessons) {
      const linked = markdownLinks(fs.readFileSync(inside(root, lesson.source), 'utf8')).filter(link => !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(link) && /\.html$/.test(link));
      const extras = (lesson.visuals || []).map(v => v.file);
      lesson.interactive = [...new Set([...linked, ...extras])].map(link => {
        const source = slash(path.join(path.dirname(lesson.source), link));
        const asset = assets.find(a => a.source === source && a.route.startsWith('/interactive/'));
        if (!asset) throw new Error(`Unregistered interactive page in ${lesson.source}: ${link}`);
        if (!interactiveBySource.has(source)) interactiveBySource.set(source, lesson);
        const title = lesson.visuals?.find(v => v.file === link)?.title || fs.readFileSync(inside(root, source), 'utf8').match(/<title>(.*?)<\/title>/s)?.[1] || '打开互动演示';
        return { title, url: url(asset.route) };
      });
    }
  }

  add('/courses/', { title: '选择一门课程', type: 'docs', sidebar_root_for: 'self', sidebar_root_menu: false, section_index: 'list', weight: 20, description: '阅读现有课件，配合互动演示，在 Claude Code 中完成练习。', search_keywords: ['课程', '学习', '产品主理人', '律师'] }, catalog.courses.map(c => `## [${c.title}${c.stability === 'beta' ? ' · Beta' : ''}](${url(c.route)})\n\n${c.intro}\n\n${c.stages.length} 个阶段 · ${c.main} 节主线${c.supplementary ? ` · ${c.supplementary} 节补充` : ''}\n`).join('\n'), true);

  for (const [courseIndex, course] of catalog.courses.entries()) {
    const courseIntro = course.overview ? transform(course.overview) + '\n' : `${course.intro}\n\n`;
    const summary = `共 ${course.stages.length} 个阶段，${course.main} 节主线${course.supplementary ? `、${course.supplementary} 节补充` : ''}。${course.stability === 'beta' ? '本课程处于 Beta 阶段。' : ''}`;
    let body = courseIntro + `[安装并开始带练](${url('/docs/start/')}#${course.id})\n\n`;
    if (course.supplementary) body += '<label class="course-filter"><input type="checkbox" data-main-only>只看主线课程</label>\n\n';
    body += course.stages.map(s => `## ${s.title}\n\n${lessonList(s.lessons)}`).join('\n');
    add(course.route, { title: course.title, description: summary, type: 'book', cascade: { type: 'book' }, sidebar_root_for: 'self', weight: (courseIndex + 1) * 10, no_list: true, theme_color: course.color, ...metadata(course.overview || course.mapFile), search_keywords: [course.id, course.module, course.title] }, body, true);

    for (const stage of course.stages) {
      add(`${course.route}${stage.id}/`, { title: stage.title, type: 'book', weight: stage.weight, no_list: true, ...metadata(course.mapFile) }, lessonList(stage.lessons), true);
      for (const lesson of stage.lessons) {
        add(lesson.route, {
          title: lesson.title, linkTitle: lesson.short_title || lesson.title,
          book_number: lesson.number, lesson_number: lesson.number,
          type: 'book', weight: lesson.weight, supplementary: Boolean(lesson.supplementary),
          description: `${course.title} · ${stage.title} · Lesson ${lesson.number}${lesson.supplementary ? '（补充课）' : ''}`,
          search_keywords: [lesson.number, `Lesson ${lesson.number}`, lesson.title, lesson.short_title || lesson.title, ...(lesson.topics || [])],
          coaching_prompt: `请在 /${course.module} 教学会话中带我学习 Lesson ${lesson.number}：${lesson.title}。先解释本课目标，再结合我的项目完成练习。`,
          interactive: lesson.interactive,
          ...metadata(lesson.source),
        }, transform(lesson.source));
      }
    }
    if (course.materials) {
      const materialRoot = `${course.route}materials/`;
      add(materialRoot, { title: '案例与课堂材料', type: 'docs', cascade: { type: 'docs' }, sidebar_root_for: 'self', sidebar_root_menu: false, weight: 900, pager: false }, `这里的材料用于模拟课堂练习。请先阅读课程定位，再分别查看原始案例、工作台模板与参考交付件。\n\n${course.meta.disclaimer}\n`, true);
      for (const [index, group] of course.materials.entries()) {
        add(`${materialRoot}${group.id}/`, { title: group.title, type: 'docs', weight: (index + 1) * 10, no_list: true, pager: false }, group.pages.map(p => `- [${p.title}](${url(p.route)}) · [下载原文件](${url(p.download)})`).join('\n') + '\n', true);
        for (const [pageIndex, page] of group.pages.entries()) {
          // Material paths may contain directories; explicit URLs keep downloadable source names separate from reading paths.
          add(page.route, { title: page.title, type: 'docs', weight: (pageIndex + 1) * 10, pager: false, ...metadata(page.source), download_url: url(page.download) }, transform(page.source));
        }
      }
    }
  }
  add('/docs/practice/', { title: '实操须知', type: 'docs', weight: 50, ...metadata('guide/lessons/shared/practice-notice.md') }, transform('guide/lessons/shared/practice-notice.md'));

  // All validation above happens before replacing our own generated directory.
  const staging = `${generatedDir}.tmp`;
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });
  const contentDir = path.join(staging, 'content');
  for (const spec of pageSpecs) {
    const existing = path.join(root, 'website/content', spec.route.replace(/^\//, '').replace(/\/$/, spec.section ? '/_index.md' : '.md'));
    if (fs.existsSync(existing)) throw new Error(`Authored/generated content collision: ${spec.route}`);
    writePage(contentDir, spec.route, spec.data, spec.body, spec.section);
  }
  // Resolve authored Markdown links without touching the source files. Mount only this prepared content.
  for (const file of walkFiles(inside(root, 'website/content'))) {
    if (!file.endsWith('.md')) continue;
    const relative = path.relative(path.join(root, 'website/content'), file);
    const source = slash(path.relative(root, file));
    const raw = fs.readFileSync(file, 'utf8');
    const front = raw.match(/^---\n[\s\S]*?\n---\n/)?.[0] || '';
    const destination = path.join(contentDir, relative);
    if (fs.existsSync(destination)) throw new Error(`Authored/generated content collision: ${source}`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, front + '\n' + transformMarkdown(raw, { sourcePath: source, resolveLink, removeTitle: false, removeFooter: false }));
  }
  for (const asset of assets) {
    const destination = path.join(staging, 'static', asset.route);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    let bytes = fs.readFileSync(inside(root, asset.source));
    if (asset.route.startsWith('/interactive/') && asset.source.endsWith('.html')) {
      const lesson = interactiveBySource.get(asset.source);
      const back = lesson?.route || asset.course.route;
      const backLink = `<a class="cc4pm-back" href="${h(url(back))}" style="position:fixed;bottom:18px;right:18px;z-index:10000;background:#faf9f5;color:#713a28;border:1px solid #d4d2c8;border-radius:6px;padding:10px 16px;font:14px system-ui;text-decoration:none">← 返回${lesson ? ` Lesson ${h(lesson.number)}` : '课程'}</a>`;
      bytes = Buffer.from(bytes.toString().replace('</body>', `${backLink}\n</body>`));
    }
    fs.writeFileSync(destination, bytes);
  }
  const homepage = renderHomepage(root, catalog, baseURL);
  fs.mkdirSync(path.join(staging, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(staging, 'assets/homepage.html'), homepage);
  const manifest = {
    baseURL: url('/'), version: catalog.version, sources: hashes,
    lessons: catalog.courses.flatMap(c => c.lessons.map(l => ({ source: l.source, route: l.route, number: l.number, title: l.title, course: c.id, supplementary: Boolean(l.supplementary) }))),
    pages: pageSpecs.map(s => s.route), assets: assets.map(a => ({ source: a.source, route: a.route })),
  };
  fs.writeFileSync(path.join(staging, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.rmSync(generatedDir, { recursive: true, force: true });
  fs.renameSync(staging, generatedDir);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const index = process.argv.indexOf('--baseURL');
  const manifest = prepareSite({ baseURL: index >= 0 ? process.argv[index + 1] : undefined });
  console.log(`Prepared ${manifest.lessons.length} lessons, ${manifest.pages.length} reading pages and ${manifest.assets.length} assets.`);
}
