#!/usr/bin/env node
/**
 * Smoke-test prezentacji HTML: przepełnienia, nawigacja (strzałki, krańce, autoukrywanie),
 * błędy konsoli i zrzut każdego slajdu w każdym oknie. Raport: <out>/qa-report.json.
 *
 * Użycie: node scripts/qa-html-deck.mjs prezentacja.html [--out katalog] [--viewports 1600x900,1366x768,1280x720,1280x800]
 * Domyślne --out: qa/ obok pliku HTML.
 * Kod wyjścia: 0 = bez problemów, 1 = przepełnienie, błąd nawigacji albo konsoli,
 * 2 = złe wywołanie, także zły --viewports (scripts/cli.mjs), przed uruchomieniem przeglądarki.
 * Wymaga: npm install && npx playwright install chromium
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseCli, requireFile, usageError } from './cli.mjs';

const DEFAULT_VIEWPORTS = '1600x900,1366x768,1280x720,1280x800';
const USAGE = `node scripts/qa-html-deck.mjs prezentacja.html [--out katalog] [--viewports ${DEFAULT_VIEWPORTS}]`;
const { values, positionals: [input] } = parseCli({
  usage: USAGE,
  options: { out: { type: 'string' }, viewports: { type: 'string' } },
  positionals: [1, 1],
});
requireFile(USAGE, input);
const viewports = (values.viewports ?? DEFAULT_VIEWPORTS).split(',').map((s) => s.trim()).map((s) => {
  const m = s.match(/^(\d+)x(\d+)$/);
  const [width, height] = m ? [Number(m[1]), Number(m[2])] : [0, 0];
  if (!width || !height) usageError(USAGE, `zły rozmiar okna w --viewports: „${s}” (oczekiwane SZERxWYS, np. 1366x768)`);
  return { width, height, label: `${width}x${height}` };
});
const htmlPath = path.resolve(input);
const outDir = path.resolve(values.out ?? path.join(path.dirname(htmlPath), 'qa'));
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
    if (slideCount < 1) throw new Error('Brak elementów [data-slide]. Kontrakt DOM: references/nawigacja.md.');
    const activeIndex = async () => page.locator('[data-slide].is-active').evaluate((el) => Number(el.getAttribute('data-slide-index') ?? [...el.parentElement.querySelectorAll('[data-slide]')].indexOf(el)));
    const activeCount = async () => page.locator('[data-slide].is-active').count();
    if (await activeCount() !== 1) throw new Error(`Oczekiwany dokładnie jeden aktywny slajd, jest ${await activeCount()}.`);

    const viewportReport = { viewport: viewport.label, slides: slideCount, screenshots: [], overflow: [], consoleErrors: [], navigation: [] };

    // Autoukrywanie strzałek, raz na okno.
    const nextButton = page.locator('button[data-nav="next"]');
    const prevButton = page.locator('button[data-nav="prev"]');
    if (await nextButton.count()) {
      await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
      await page.waitForTimeout(260);
      const shownOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
      if (shownOpacity < 0.5) viewportReport.navigation.push('Strzałka „Następny” nie pokazała się po ruchu myszy.');
      await page.waitForTimeout(1900);
      const hiddenOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
      if (hiddenOpacity > 0.1) viewportReport.navigation.push('Strzałka „Następny” nie zniknęła po 1,8 s bezczynności.');
      await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
      await page.waitForTimeout(100);
      const box = await nextButton.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(1900);
        const hoverOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
        if (hoverOpacity < 0.5) viewportReport.navigation.push('Strzałka „Następny” zniknęła mimo najechania kursorem.');
      }
      await page.mouse.move(-1, -1);
      await page.waitForTimeout(1900);
    }

    // Strzałki ukryte tylko na zrzutach; nawigację sprawdza osobny krok.
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
      if (metrics.scrollWidth > metrics.clientWidth + 2) issues.push('przepełnienie w poziomie wewnątrz slajdu');
      if (metrics.scrollHeight > metrics.clientHeight + 2) issues.push('przepełnienie w pionie wewnątrz slajdu');
      if (metrics.left < -2 || metrics.top < -2 || metrics.right > viewport.width + 2 || metrics.bottom > viewport.height + 2) issues.push('slajd wychodzi poza okno');
      if (issues.length) viewportReport.overflow.push({ slide: current, issues, metrics });

      const filename = `${viewport.label}-slide-${String(i + 1).padStart(2, '0')}.png`;
      await page.mouse.move(0, 0); // kursor poza kontrolkami na zrzucie
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(outDir, filename), animations: 'disabled' });
      viewportReport.screenshots.push(filename);

      if (i < slideCount - 1) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(260);
        if (await activeCount() !== 1) throw new Error(`Okno ${viewport.label}: po ArrowRight zmieniła się liczba aktywnych slajdów.`);
        const next = await activeIndex();
        if (next === current) throw new Error(`Okno ${viewport.label}: ArrowRight nie przełączył dalej ze slajdu ${current}.`);
      }
    }

    // Nawigacja wstecz i oba krańce.
    if (await nextButton.count() && !await nextButton.isDisabled().catch(() => false)) {
      viewportReport.navigation.push('Przycisk „Następny” powinien mieć disabled na ostatnim slajdzie.');
    }
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(260);
    if (await activeCount() !== 1) throw new Error(`Okno ${viewport.label}: po ArrowLeft zły stan aktywnego slajdu.`);
    for (let i = 0; i < Math.max(0, slideCount - 2); i += 1) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(230);
    }
    const firstIndex = await activeIndex();
    if (await prevButton.count() && !await prevButton.isDisabled().catch(() => false)) {
      viewportReport.navigation.push('Przycisk „Poprzedni” powinien mieć disabled na pierwszym slajdzie.');
    }
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(230);
    if (await activeIndex() !== firstIndex) viewportReport.navigation.push('ArrowLeft przeszedł przed pierwszy slajd.');

    // Przepełnienie strony; przepełnienie slajdu sprawdzone wyżej.
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
console.log(failed ? `\nQA: są problemy, raport: ${reportPath}` : `\nQA: bez problemów, raport i zrzuty: ${outDir}`);
process.exit(failed ? 1 : 0);
