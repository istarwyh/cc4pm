import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { codeBlocks, writePage } from '../scripts/content.mjs';
import { assertHugo } from '../scripts/toolchain.mjs';
import { inspectHtml } from '../scripts/validate.mjs';

test('Hugo renders fenced and inline shortcode examples verbatim in HTML and Markdown', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cc4pm-hugo-examples-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (file, value) => {
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    fs.writeFileSync(path.join(root, file), value);
  };
  write('hugo.yaml', 'baseURL: https://example.org/\ndisableKinds: [taxonomy, term, RSS, sitemap]\noutputs:\n  home: [HTML]\n  page: [HTML, markdown]\noutputFormats:\n  markdown:\n    mediaType: text/markdown\n    baseName: index\n');
  write('layouts/page.html', '{{ .Content }}');
  write('layouts/page.md', '{{ .RenderShortcodes }}');
  write('layouts/home.html', 'Home');
  write('layouts/_shortcodes/active.html', 'ACTIVE RENDER');
  const source = [
    '~~~go-html-template',
    '{{< unavailable key="quoted >}} text" >}}',
    '{{% unavailable %}}',
    '{{% /unavailable %}}',
    '{{< unavailable',
    '  key="value"',
    '>}}',
    '{{</* already escaped */>}}',
    '~~~',
    '',
    '    {{< indented >}}',
    '',
    'Inline `{{< unavailable />}}` and `{{% unavailable %}}`.',
    '',
    '{{< active >}}',
  ].join('\n');
  writePage(path.join(root, 'content'), '/examples/', { title: 'Examples' }, source);
  execFileSync(assertHugo().binary, ['--source', root, '--printPathWarnings', '--panicOnWarning'], {
    cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, GOWORK: 'off', HUGO_MODULE_WORKSPACE: 'off' },
  });
  const html = fs.readFileSync(path.join(root, 'public/examples/index.html'), 'utf8');
  const markdown = fs.readFileSync(path.join(root, 'public/examples/index.md'), 'utf8');
  assert.deepEqual(codeBlocks(markdown), codeBlocks(source));
  const rendered = inspectHtml(html).code;
  for (const block of codeBlocks(source)) assert.ok(rendered.includes(block.value.trimEnd()), `HTML code changed: ${block.value}`);
  for (const sample of ['{{< unavailable />}}', '{{% unavailable %}}']) {
    assert.ok(rendered.includes(sample));
    assert.ok(markdown.includes('`' + sample + '`'));
  }
  assert.ok(html.includes('ACTIVE RENDER'));
  assert.ok(markdown.includes('ACTIVE RENDER'));
});
