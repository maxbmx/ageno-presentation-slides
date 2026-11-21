#!/usr/bin/env node
/**
 * Zrzuty ekranu do slajdów, dopasowane do ramek z siatki (references/screeny.md).
 * Viewport zrzutu ma te same proporcje co ramka, więc obraz wypełnia ją bez kadrowania.
 * deviceScaleFactor 2 daje ostry obraz na dużym ekranie.
 *
 * Użycie: node scripts/screenshots.mjs screens.json [--out ./screens]
 * Kod wyjścia: 0 = wszystkie zrzuty, 1 = któryś zrzut się nie udał, 2 = złe wywołanie (scripts/cli.mjs).
 *
 * screens.json:
 * [
 *   { "name": "home", "url": "https://example.com", "frame": "wide" },
 *   { "name": "koszyk-mobile", "url": "https://example.com/koszyk", "frame": "mobile",
 *     "hide": ["#cookie-banner"], "waitFor": ".cart", "scrollY": 0, "delay": 500 }
 * ]
 *
 * Pola: name, url, frame (full | wide | half | mobile) – wymagane;
 * hide (selektory ukrywane przez CSS, np. banery), waitFor (selektor), scrollY (px), delay (ms) – opcjonalne.
 * Wymaga: npm install --no-save playwright && npx playwright install chromium
 */
import { chromium } from "playwright";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseCli, requireFile, usageError } from "./cli.mjs";

const FRAMES = {
  full:   { frame: [1312, 608], viewport: [1312, 608], mobile: false },
  wide:   { frame: [864, 544],  viewport: [1296, 816], mobile: false },
  half:   { frame: [640, 416],  viewport: [1280, 832], mobile: false },
  mobile: { frame: [320, 640],  viewport: [400, 800],  mobile: true },
};

const USAGE = "node scripts/screenshots.mjs screens.json [--out katalog]  (domyślnie screens/ obok JSON)";
const { values, positionals: [listPath] } = parseCli({ usage: USAGE, options: { out: { type: "string" } }, positionals: [1, 1] });
requireFile(USAGE, listPath);
let list;
try { list = JSON.parse(await readFile(listPath, "utf8")); } catch (error) { usageError(USAGE, `${listPath} nie jest poprawnym JSON: ${error.message}`); }
if (!Array.isArray(list)) usageError(USAGE, `${listPath} ma zawierać listę (tablicę JSON)`);
const outDir = path.resolve(values.out ?? path.join(path.dirname(listPath), "screens"));
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
let failed = 0;

for (const item of list) {
  const preset = FRAMES[item.frame];
  if (!preset || !item.name || !item.url) {
    console.error(`Pominięto (brak name/url lub zła ramka): ${JSON.stringify(item)}`);
    failed += 1;
    continue;
  }
  const [vw, vh] = preset.viewport;
  const context = await browser.newContext({
    viewport: { width: vw, height: vh },
    deviceScaleFactor: 2,
    isMobile: preset.mobile,
    hasTouch: preset.mobile,
    locale: "pl-PL",
  });
  const page = await context.newPage();
  try {
    await page.goto(item.url, { waitUntil: "networkidle", timeout: 45000 });
    if (item.hide?.length) {
      await page.addStyleTag({ content: `${item.hide.join(", ")} { display: none !important; }` });
    }
    if (item.waitFor) await page.waitForSelector(item.waitFor, { timeout: 15000 });
    await page.evaluate(() => document.fonts?.ready);
    if (item.scrollY) await page.evaluate((y) => window.scrollTo(0, y), item.scrollY);
    await page.waitForTimeout(item.delay ?? 400);
    const file = path.join(outDir, `${item.name}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 85, animations: "disabled" });
    console.log(`OK  ${item.name}  ramka ${preset.frame.join("×")}  viewport ${vw}×${vh}  → ${file}`);
  } catch (error) {
    failed += 1;
    console.error(`BŁĄD ${item.name}: ${error.message}`);
  } finally {
    await context.close();
  }
}

await browser.close();
process.exit(failed ? 1 : 0);
