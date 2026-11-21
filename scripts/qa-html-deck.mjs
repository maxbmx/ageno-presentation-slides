#!/usr/bin/env node
/**
 * Smoke-test and screenshot a standalone HTML slide deck.
 * Requires: npm install --no-save playwright && npx playwright install chromium
 * Usage: node scripts/qa-html-deck.mjs ./presentation.html [--out ./qa] [--viewports 1600x900,1366x768,1280x720,1280x800]
 */
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
if (!input) {
  console.error('Usage: node scripts/qa-html-deck.mjs presentation.html [--out ./qa] [--viewports 1600x900,1366x768,1280x720,1280x800]');
  process.exit(2);
}
const arg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const outDir = path.resolve(arg('--out', './qa-presentation'));
const viewports = arg('--viewports', '1600x900,1366x768,1280x720,1280x800')
  .split(',').map((s) => s.trim()).map((s) => {
    const [width, height] = s.split('x').map(Number);
    if (!width || !height) throw new Error(`Invalid viewport: ${s}`);
    return { width, height, label: `${width}x${height}` };
  });
const htmlPath = path.resolve(input);
await readFile(htmlPath); // fail early if file is missing or unreadable
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { file: htmlPath, viewports: [], errors: [] };
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(250);

    const slideCount = await page.locator('[data-slide]').count();
    if (slideCount < 1) throw new Error('No [data-slide] elements found. Follow the DOM contract in references/nawigacja.md.');
    const activeIndex = async () => page.locator('[data-slide].is-active').evaluate((el) => Number(el.getAttribute('data-slide-index') ?? [...el.parentElement.querySelectorAll('[data-slide]')].indexOf(el)));
    const activeCount = async () => page.locator('[data-slide].is-active').count();
    if (await activeCount() !== 1) throw new Error(`Expected exactly one active slide; found ${await activeCount()}.`);

    const viewportReport = { viewport: viewport.label, slides: slideCount, screenshots: [], overflow: [], consoleErrors: [], navigation: [] };

    // Verify the auto-hide behaviour once per viewport.
    const nextButton = page.locator('button[data-nav="next"]');
    const prevButton = page.locator('button[data-nav="prev"]');
    if (await nextButton.count()) {
      await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
      await page.waitForTimeout(260);
      const shownOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
      if (shownOpacity < 0.5) viewportReport.navigation.push('Next arrow did not become visible after mouse movement.');
      await page.waitForTimeout(1900);
      const hiddenOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
      if (hiddenOpacity > 0.1) viewportReport.navigation.push('Next arrow did not auto-hide after 1.8 seconds of inactivity.');
      await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
      await page.waitForTimeout(100);
      const box = await nextButton.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1900);
        const hoverOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
        if (hoverOpacity < 0.5) viewportReport.navigation.push('Next arrow disappeared while hovered.');
      }
      await page.mouse.move(-1, -1);
      await page.waitForTimeout(1900);
    }

    // Hide navigation only for visual baselines; interaction checks run separately.
    await page.addStyleTag({ content: 'button[data-nav] { opacity: 0 !important; visibility: hidden !important; }' });
    for (let i = 0; i < slideCount; i += 1) {
      const current = await activeIndex();
      const slide = page.locator('[data-slide].is-active');
      const metrics = await slide.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
          scrollHeight: el.scrollHeight, clientHeight: el.clientHeight,
          left: Math.round(r.left), top: Math.round(r.top),
          right: Math.round(r.right), bottom: Math.round(r.bottom),
          viewportWidth: window.innerWidth, viewportHeight: window.innerHeight,
        };
      });
      const issues = [];
      if (metrics.scrollWidth > metrics.clientWidth + 2) issues.push('horizontal overflow inside slide');
      if (metrics.scrollHeight > metrics.clientHeight + 2) issues.push('vertical overflow inside slide');
      if (metrics.left < -2 || metrics.top < -2 || metrics.right > viewport.width + 2 || metrics.bottom > viewport.height + 2) issues.push('slide exceeds viewport bounds');
      if (issues.length) viewportReport.overflow.push({ slide: current, issues, metrics });

      const filename = `${viewport.label}-slide-${String(i + 1).padStart(2, '0')}.png`;
      await page.mouse.move(0, 0); // keep hover controls out of the visual baseline
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(outDir, filename), animations: 'disabled' });
      viewportReport.screenshots.push(filename);

      if (i < slideCount - 1) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(260);
        if (await activeCount() !== 1) throw new Error(`Viewport ${viewport.label}: active slide count changed after ArrowRight.`);
        const next = await activeIndex();
        if (next === current) throw new Error(`Viewport ${viewport.label}: ArrowRight did not advance from slide ${current}.`);
      }
    }

    // Verify reverse navigation and both boundaries.
    if (await nextButton.count() && !await nextButton.isDisabled().catch(() => false)) {
      viewportReport.navigation.push('Next button should be disabled on the last slide.');
    }
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(260);
    if (await activeCount() !== 1) throw new Error(`Viewport ${viewport.label}: invalid active slide state after ArrowLeft.`);
    for (let i = 0; i < Math.max(0, slideCount - 2); i += 1) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(230);
    }
    const firstIndex = await activeIndex();
    if (await prevButton.count() && !await prevButton.isDisabled().catch(() => false)) {
      viewportReport.navigation.push('Previous button should be disabled on the first slide.');
    }
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(230);
    if (await activeIndex() !== firstIndex) viewportReport.navigation.push('ArrowLeft moved before the first slide.');

    // Check page-level overflow; slide-level overflow is checked above.
    const pageOverflow = await page.evaluate(() => ({
      horizontal: document.documentElement.scrollWidth > window.innerWidth + 2,
      vertical: document.documentElement.scrollHeight > window.innerHeight + 2,
    }));
    if (pageOverflow.horizontal || pageOverflow.vertical) viewportReport.overflow.push({ page: true, ...pageOverflow });
    viewportReport.consoleErrors = consoleErrors;
    if (consoleErrors.length) report.errors.push({ viewport: viewport.label, consoleErrors });
    if (viewportReport.navigation.length) report.errors.push({ viewport: viewport.label, navigation: viewportReport.navigation });
    report.viewports.push(viewportReport);
    await context.close();
  }
} catch (error) {
  report.errors.push({ fatal: error.message });
} finally {
  await browser.close();
}

const reportPath = path.join(outDir, 'qa-report.json');
await (await import('node:fs/promises')).writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
const failed = report.errors.length || report.viewports.some((v) => v.overflow?.length || v.consoleErrors?.length || v.navigation?.length);
process.exit(failed ? 1 : 0);
