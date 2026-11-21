#!/usr/bin/env node
/**
 * Zapisuje prezentację do PDF tak jak „Zapisz jako PDF” w Chrome (styl @media print szablonu,
 * preferCSSPageSize, tło drukowane) i sprawdza wynik:
 *  - liczba stron = liczba slajdów [data-slide] (bez pustej strony na końcu),
 *  - każda strona ma MediaBox 1152 × 648 pt (16 × 9 cali, PDF_PAGE_PT z constants.mjs).
 *
 * Użycie: node scripts/pdf.mjs prezentacja.html [--out prezentacja.pdf]
 * Domyślne --out: plik .pdf obok HTML, o tej samej nazwie.
 * Kod wyjścia: 0 = PDF zgodny, 1 = niezgodna liczba stron albo rozmiar strony (PDF zostaje
 * zapisany do obejrzenia) albo brak Playwrighta, 2 = złe wywołanie (scripts/cli.mjs).
 * Wymaga: npm install && npx playwright install chromium (package.json)
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { launchChromium, parseCli } from "./cli.mjs";
import { CANVAS, PDF_PAGE_PT } from "./constants.mjs";

const USAGE = "node scripts/pdf.mjs prezentacja.html [--out prezentacja.pdf]";

/** Strony i MediaBoxy z surowego PDF (Chromium zapisuje słowniki stron jawnym tekstem). */
export function pdfPages(buffer) {
  const text = buffer.toString("latin1");
  const pages = (text.match(/\/Type\s*\/Page(?![a-zA-Z])/g) || []).length;
  const boxes = [...text.matchAll(/\/MediaBox\s*\[\s*([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s*\]/g)]
    .map((m) => [Number(m[3]) - Number(m[1]), Number(m[4]) - Number(m[2])]);
  return { pages, boxes };
}

async function main() {
  const { values, positionals: [input] } = parseCli({ usage: USAGE, options: { out: { type: "string" } }, positionals: [1, 1], files: true });
  const htmlPath = path.resolve(input);
  const output = path.resolve(values.out ?? htmlPath.replace(/\.html?$/i, "") + ".pdf");
  const browser = await launchChromium();
  let slides;
  try {
    const page = await browser.newPage({ viewport: { width: CANVAS.width, height: CANVAS.height } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts?.ready);
    slides = await page.locator("[data-slide]").count();
    await mkdir(path.dirname(output), { recursive: true });
    await page.pdf({ path: output, preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
  }

  const { pages, boxes } = pdfPages(await readFile(output));
  const [W, H] = PDF_PAGE_PT;
  const problems = [];
  if (!slides) problems.push("brak slajdów [data-slide] w pliku HTML");
  if (pages !== slides) problems.push(`stron w PDF: ${pages}, slajdów: ${slides}`);
  const bad = boxes.filter(([w, h]) => Math.abs(w - W) > 0.5 || Math.abs(h - H) > 0.5);
  if (!boxes.length) problems.push("nie znaleziono MediaBox w PDF");
  if (bad.length) problems.push(`strony o innym rozmiarze niż ${W} × ${H} pt: ${[...new Set(bad.map(([w, h]) => `${w} × ${h}`))].join(", ")}`);

  console.log(`PDF: ${output}`);
  console.log(`Slajdów: ${slides}, stron: ${pages}, rozmiar strony: ${[...new Set(boxes.map(([w, h]) => `${w} × ${h} pt`))].join(", ") || "brak"}`);
  for (const p of problems) console.error(`BŁĄD: ${p}`);
  console.log(problems.length ? "\nPDF: niezgodny, popraw deck (references/nawigacja.md, „Druk i PDF”)." : "\nPDF: zgodny.");
  process.exit(problems.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
