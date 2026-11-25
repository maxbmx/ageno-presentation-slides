#!/usr/bin/env node
/**
 * Smoke-test prezentacji HTML: przepełnienia, nawigacja (strzałki, krańce, autoukrywanie),
 * dostępność (alt w obrazach, widoczny fokus strzałek, `prefers-reduced-motion`), błędy
 * konsoli i zrzut każdego slajdu w każdym oknie. Raport: <out>/qa-report.json.
 *
 * Użycie: node scripts/qa-html-deck.mjs prezentacja.html [--out katalog] [--viewports 1600x900,1366x768,1280x720,1280x800]
 * Domyślne okna: QA_VIEWPORTS z constants.mjs.
 * Domyślne --out: qa/ obok pliku HTML.
 * Kod wyjścia: 0 = bez problemów, 1 = przepełnienie, błąd nawigacji, dostępności albo konsoli,
 * 2 = złe wywołanie, także zły --viewports (scripts/cli.mjs), przed uruchomieniem przeglądarki.
 * Wymaga: npm install && npx playwright install chromium
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { launchChromium, parseCli, usageError } from './cli.mjs';
import { NAV, QA_VIEWPORTS } from './constants.mjs';

const DEFAULT_VIEWPORTS = QA_VIEWPORTS.map(([w, h]) => `${w}x${h}`).join(',');
// Oczekiwanie po przejściu slajdu i po czasie autoukrywania strzałek, z zapasem.
const AFTER_TRANSITION = NAV.transitionMs + 60;
const AFTER_HIDE = NAV.hideAfterMs + 100;
const USAGE = `node scripts/qa-html-deck.mjs prezentacja.html [--out katalog] [--viewports ${DEFAULT_VIEWPORTS}]`;
const { values, positionals: [input] } = parseCli({
  usage: USAGE,
  options: { out: { type: 'string' }, viewports: { type: 'string' } },
  positionals: [1, 1],
  files: true,
});
const viewports = (values.viewports ?? DEFAULT_VIEWPORTS).split(',').map((s) => s.trim()).map((s) => {
  const m = s.match(/^(\d+)x(\d+)$/);
  const [width, height] = m ? [Number(m[1]), Number(m[2])] : [0, 0];
  if (!width || !height) usageError(USAGE, `zły rozmiar okna w --viewports: „${s}” (oczekiwane SZERxWYS, np. 1366x768)`);
  return { width, height, label: `${width}x${height}` };
});
const htmlPath = path.resolve(input);
const outDir = path.resolve(values.out ?? path.join(path.dirname(htmlPath), 'qa'));
await mkdir(outDir, { recursive: true });

const browser = await launchChromium();
const report = { file: htmlPath, viewports: [], errors: [] };
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    // Błąd wczytania zasobu (np. net::ERR_FILE_NOT_FOUND) dostaje adres brakującego pliku.
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      const url = message.location()?.url;
      consoleErrors.push(url && !message.text().includes(url) ? `${message.text()} (${decodeURI(url)})` : message.text());
    });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(250);

    const slideCount = await page.locator('[data-slide]').count();
    if (slideCount < 1) throw new Error('Brak elementów [data-slide]. Kontrakt DOM: references/nawigacja.md.');
    const activeIndex = async () => page.locator('[data-slide].is-active').evaluate((el) => Number(el.getAttribute('data-slide-index') ?? [...el.parentElement.querySelectorAll('[data-slide]')].indexOf(el)));
    const activeCount = async () => page.locator('[data-slide].is-active').count();
    if (await activeCount() !== 1) throw new Error(`Oczekiwany dokładnie jeden aktywny slajd, jest ${await activeCount()}.`);

    const viewportReport = { viewport: viewport.label, slides: slideCount, screenshots: [], overflow: [], consoleErrors: [], navigation: [], accessibility: [] };

    // Obrazy bez atrybutu alt: niezależne od okna, sprawdzane raz, na pierwszym.
    if (viewport === viewports[0]) {
      const missingAlt = await page.evaluate(() => [...document.images]
        .filter((img) => !img.hasAttribute('alt'))
        .map((img) => img.getAttribute('src') || '(bez src)'));
      if (missingAlt.length) report.errors.push({ accessibility: missingAlt.map((src) => `obraz bez atrybutu alt: ${src}`) });
    }

    // Autoukrywanie strzałek, raz na okno.
    const nextButton = page.locator('button[data-nav="next"]');
    const prevButton = page.locator('button[data-nav="prev"]');
    if (await nextButton.count()) {
      await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
      await page.waitForTimeout(AFTER_TRANSITION);
      const shownOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
      if (shownOpacity < 0.5) viewportReport.navigation.push('Strzałka „Następny” nie pokazała się po ruchu myszy.');
      await page.waitForTimeout(AFTER_HIDE);
      const hiddenOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
      if (hiddenOpacity > 0.1) viewportReport.navigation.push('Strzałka „Następny” nie zniknęła po 2 s bezczynności.');
      await page.mouse.move(Math.round(viewport.width / 2), Math.round(viewport.height / 2));
      await page.waitForTimeout(100);
      const box = await nextButton.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(AFTER_HIDE);
        const hoverOpacity = await nextButton.evaluate((el) => Number.parseFloat(getComputedStyle(el).opacity));
        if (hoverOpacity < 0.5) viewportReport.navigation.push('Strzałka „Następny” zniknęła mimo najechania kursorem.');
      }
      await page.mouse.move(-1, -1);
      await page.waitForTimeout(AFTER_HIDE);

      // Widoczny fokus klawiatury na strzałkach (references/nawigacja.md, „Strzałki”).
      for (const [label, button] of [['Następny', nextButton], ['Poprzedni', prevButton]]) {
        if (await button.isDisabled().catch(() => false)) continue;
        await button.focus();
        await page.waitForTimeout(AFTER_TRANSITION);
        const focusStyle = await button.evaluate((el) => {
          const cs = getComputedStyle(el);
          return { outlineWidth: Number.parseFloat(cs.outlineWidth), outlineStyle: cs.outlineStyle, opacity: Number.parseFloat(cs.opacity) };
        });
        if (focusStyle.opacity < 0.5) viewportReport.accessibility.push(`Strzałka „${label}” niewidoczna przy fokusie klawiatury.`);
        if (focusStyle.outlineStyle === 'none' || focusStyle.outlineWidth === 0) viewportReport.accessibility.push(`Strzałka „${label}” bez widocznej obwódki fokusu (outline) przy fokusie klawiatury.`);
      }
      await page.evaluate(() => document.activeElement?.blur());
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
        await page.waitForTimeout(AFTER_TRANSITION);
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
    await page.waitForTimeout(AFTER_TRANSITION);
    if (await activeCount() !== 1) throw new Error(`Okno ${viewport.label}: po ArrowLeft zły stan aktywnego slajdu.`);
    for (let i = 0; i < Math.max(0, slideCount - 2); i += 1) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(AFTER_TRANSITION);
    }
    const firstIndex = await activeIndex();
    if (await prevButton.count() && !await prevButton.isDisabled().catch(() => false)) {
      viewportReport.navigation.push('Przycisk „Poprzedni” powinien mieć disabled na pierwszym slajdzie.');
    }
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(AFTER_TRANSITION);
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
    if (viewportReport.accessibility.length) report.errors.push({ viewport: viewport.label, accessibility: viewportReport.accessibility });
    report.viewports.push(viewportReport);
    await context.close();
  }

  // prefers-reduced-motion: przejście bez transform, sam krótki zanik (references/nawigacja.md, „Przejście”).
  {
    const reducedContext = await browser.newContext({
      viewport: { width: viewports[0].width, height: viewports[0].height },
      reducedMotion: 'reduce',
    });
    const reducedPage = await reducedContext.newPage();
    await reducedPage.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await reducedPage.evaluate(() => document.fonts?.ready);
    await reducedPage.waitForTimeout(250);
    if (await reducedPage.locator('[data-slide]').count() > 1) {
      await reducedPage.keyboard.press('ArrowRight');
      await reducedPage.waitForTimeout(60);
      const transforms = await reducedPage.evaluate(() => [...document.querySelectorAll('[data-slide]')]
        .map((el) => getComputedStyle(el).transform)
        .filter((t) => t && t !== 'none'));
      if (transforms.length) report.errors.push({ accessibility: ['prefers-reduced-motion: slajd nadal się przesuwa (transform), oczekiwany sam zanik bez ruchu.'] });
      await reducedPage.waitForTimeout(300);
    }
    await reducedContext.close();
  }
} catch (error) {
  report.errors.push({ fatal: error.message });
} finally {
  await browser.close();
}

const reportPath = path.join(outDir, 'qa-report.json');
await (await import('node:fs/promises')).writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
const failed = report.errors.length || report.viewports.some((v) => v.overflow?.length || v.consoleErrors?.length || v.navigation?.length || v.accessibility?.length);
console.log(failed ? `\nQA: są problemy, raport: ${reportPath}` : `\nQA: bez problemów, raport i zrzuty: ${outDir}`);
process.exit(failed ? 1 : 0);
