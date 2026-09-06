import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escapeHtml as h, loadCatalog, siteURL } from './content.mjs';

export function renderHomepage(root, catalog = loadCatalog(root), baseURL = catalog.productionURL) {
  let html = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8');
  const product = catalog.courses.find(c => c.id === 'product');
  const colors = ['--color-bmm', '--color-cis', '--color-wds', '--color-eng', '--text-secondary'];
  const url = route => siteURL(baseURL, route);
  const curriculum = product.stages.map((s, i) => `
      <div class="curriculum-stage${i === 0 ? ' open' : ''}" id="${h(s.id)}">
        <button class="stage-header" type="button" onclick="toggleStage('${h(s.id)}')" aria-expanded="${i === 0}">
          <span class="stage-badge" style="background:var(${colors[i % colors.length]})">S${i + 1}</span>
          <span class="stage-info"><span class="stage-title">${h(s.title)}</span><span class="stage-meta">${s.lessons.filter(l => !l.supplementary).length} 节主线 · ${s.lessons.filter(l => l.supplementary).length} 节补充</span></span>
          <span class="stage-toggle" aria-hidden="true">⌄</span>
        </button>
        <div class="stage-body"><div class="lesson-grid">
          ${s.lessons.map(l => `<a class="lesson-item${l.supplementary ? ' supplementary' : ''}" href="${h(url(l.route))}"><span class="lesson-num">${h(l.number)}</span><span class="lesson-name">${h(l.title)}</span></a>`).join('\n          ')}
        </div></div>
      </div>`).join('\n');
  const begin = '<!-- cc4pm:curriculum:start -->';
  const end = '<!-- cc4pm:curriculum:end -->';
  if (html.split(begin).length !== 2 || html.split(end).length !== 2) throw new Error('Homepage curriculum markers must occur exactly once');
  html = html.slice(0, html.indexOf(begin) + begin.length) + '\n' + curriculum + '\n' + html.slice(html.indexOf(end));
  const values = { VERSION: catalog.version, MAIN: product.main, SUPPLEMENTARY: product.supplementary, STAGES: product.stages.length, SITE: url('/') };
  for (const [key, value] of Object.entries(values)) html = html.replaceAll(`@@CC4PM_${key}@@`, h(value));
  if (/@@CC4PM_\w+@@/.test(html)) throw new Error('Unresolved homepage variable');
  const discover = `<link rel="canonical" href="${h(url('/'))}">\n<link rel="alternate" type="text/markdown" href="${h(url('/index.md'))}">`;
  return html.replace('</head>', `${discover}\n</head>`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const html = renderHomepage(root);
  const output = path.join(root, 'packages/homepage/index.html');
  if (process.argv.includes('--check')) {
    if (fs.readFileSync(output, 'utf8') !== html) throw new Error('Homepage package is stale. Run npm run build:homepage.');
    console.log('Homepage package matches course sources.');
  } else {
    fs.writeFileSync(output, html);
    console.log('Generated @cc4pm/homepage from the course maps.');
  }
}
