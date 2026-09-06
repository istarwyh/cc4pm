import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { codeBlocks, loadCatalog } from '../../scripts/content.mjs';
import { root } from '../../scripts/toolchain.mjs';

const catalog = loadCatalog(root);
const product = catalog.courses.find(course => course.id === 'product');
const lawyer = catalog.courses.find(course => course.id === 'lawyer');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'website/.generated/manifest.json')));
const route = value => value.replace(/^\//, '');

test.beforeEach(async ({ context, baseURL }) => {
  // Core reading/search/copy journeys must work without third-party fonts, images or videos.
  await context.route('**/*', request => new URL(request.request().url()).origin === new URL(baseURL).origin ? request.continue() : request.abort());
});

test('homepage → course → interactive page → course, with working clipboard', async ({ page, context, baseURL }) => {
  const errors = [];
  context.on('page', opened => opened.on('pageerror', error => errors.push(error.message)));
  page.on('pageerror', error => errors.push(error.message));
  const lesson = product.lessons.find(entry => entry.visuals?.length);
  await page.goto('./');
  await expect(page.locator('h1')).toBeVisible();
  // The existing homepage collapses stages; expand the stage containing this lesson.
  const link = page.locator(`a.lesson-item[href$="${lesson.route}"]`);
  const toggle = page.locator(`#${lesson.stageId} .stage-header`);
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await link.click();
  await expect(page.locator('.td-content h1')).toContainText(lesson.title);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
  const copy = page.locator('[data-course-copy]');
  const prompt = await copy.getAttribute('data-course-copy');
  await copy.click();
  await expect(copy).toContainText('已复制');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(prompt);
  const popupPromise = page.waitForEvent('popup');
  await page.locator('.course-resources a').first().click();
  const popup = await popupPromise;
  await expect(popup.locator('.cc4pm-back')).toBeVisible();
  await popup.locator('.cc4pm-back').click();
  await expect(popup).toHaveURL(new URL(route(lesson.route), baseURL).href);
  await expect(popup.locator('.td-content h1')).toContainText(lesson.title);
  expect(errors).toEqual([]);
});

test('course filter follows the current course map', async ({ page }) => {
  await page.goto(route(product.route));
  const rows = page.locator('.course-list li:visible');
  await expect(rows).toHaveCount(product.lessons.length);
  await page.getByLabel('只看主线课程').check();
  await expect(rows).toHaveCount(product.lessons.filter(lesson => !lesson.supplementary).length);
  await page.getByLabel('只看主线课程').uncheck();
  await expect(rows).toHaveCount(product.lessons.length);
});

test('Hugo teaching examples open from the homepage, copy literally and appear in search', async ({ page, context, baseURL }) => {
  const lesson = product.lessons.find(entry => /\{\{[<%]/.test(fs.readFileSync(path.join(root, entry.source), 'utf8')));
  expect(lesson).toBeDefined();
  const sample = codeBlocks(fs.readFileSync(path.join(root, lesson.source), 'utf8')).find(block => /\{\{[<%]/.test(block.value));
  await page.goto('./');
  const link = page.locator(`a.lesson-item[href$="${lesson.route}"]`);
  const toggle = page.locator(`#${lesson.stageId} .stage-header`);
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await link.click();
  await expect(page.locator('.td-content h1')).toContainText(lesson.title);
  const block = page.locator('[data-td-code]').filter({ has: page.locator('code').filter({ hasText: sample.value }) }).first();
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(baseURL).origin });
  await block.hover();
  await block.locator('[data-td-code-copy]').first().click();
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(sample.value.trimEnd() + '\n');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator('[data-td-shell-search-open]:visible').first().click();
  await page.locator('.td-shell-search__input').fill('OINK');
  await expect(page.locator('.td-shell-search__item-title').filter({ hasText: lesson.title }).first()).toBeVisible();
});

test('Chinese, filename, acronym and decimal lesson searches lead to reading pages', async ({ page }) => {
  await page.goto(route(product.route));
  for (const query of ['上下文', 'CLAUDE.md', 'MCP', '17.10']) {
    await page.locator('[data-td-shell-search-open]:visible').first().click();
    await page.locator('.td-shell-search__input').fill(query);
    const first = page.locator('.td-shell-search__item').first();
    await expect(first).toBeVisible();
    await expect(page.locator('.td-shell-search__list')).toContainText(query);
    await first.click();
    await expect(page.locator('.td-content h1')).toBeVisible();
    await expect(page.locator('#td-shell-search')).toBeHidden();
  }
});

test('clipboard denial provides a selectable learning prompt', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Permission denied')) } }));
  await page.goto(route(product.lessons[0].route));
  const copy = page.locator('[data-course-copy]');
  const prompt = await copy.getAttribute('data-course-copy');
  await copy.click();
  await expect(page.getByRole('textbox', { name: '本课学习提示' })).toHaveValue(prompt);
});

test('lawyer materials download the exact teaching source', async ({ page }) => {
  await page.goto(route(`${lawyer.route}materials/templates/`));
  await page.locator('.td-content li a[href*="/materials/templates/"]').first().click();
  const link = page.getByRole('link', { name: '下载原文件', exact: true });
  const href = decodeURI(await link.getAttribute('href'));
  const material = manifest.assets.find(asset => href.endsWith(asset.route));
  expect(material).toBeDefined();
  const downloadPromise = page.waitForEvent('download');
  await link.click();
  const download = await downloadPromise;
  expect(fs.readFileSync(await download.path())).toEqual(fs.readFileSync(path.join(root, material.source)));
});

test('reading stays within the viewport and mobile navigation opens a lesson', async ({ page, isMobile, baseURL }) => {
  // Pick the largest lesson so wide tables and code blocks are exercised as content grows.
  const longest = [...product.lessons].sort((a, b) => fs.statSync(path.join(root, b.source)).size - fs.statSync(path.join(root, a.source)).size)[0];
  await page.goto(route(longest.route));
  await expect(page.locator('.td-content h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  if (isMobile) {
    await page.locator('.td-site-nav__menu-toggle').click();
    const navigation = page.getByRole('navigation', { name: '章节导航' });
    const link = navigation.locator(`a[href$="${product.lessons[0].route}"]`);
    if (!await link.isVisible()) await navigation.getByRole('button', { name: `展开章节: ${product.stages[0].title}`, exact: true }).click();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new URL(route(product.lessons[0].route), baseURL).href);
  }
});
