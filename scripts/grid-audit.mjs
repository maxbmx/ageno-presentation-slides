#!/usr/bin/env node
/**
 * Audyt siatki 8 / 32 px dla prezentacji z assets/template.html.
 * Otwiera plik w oknie płótna (CANVAS z constants.mjs, 1536 × 864, skala = 1), więc pomiary są w px logicznych slajdu.
 * Sprawdza KAŻDY slajd, także nieaktywne (są ułożone, tylko niewidoczne).
 *
 * Reguły:
 *  - [data-grid="32"]: X, Y, szerokość i wysokość podzielne przez 32,
 *  - [data-grid="8"]:  X i szerokość przez 8, Y i wysokość przez 32,
 *  - [data-grid="32y"]: tylko Y i wysokość przez 32 (blok dochodzący do krawędzi slajdu, np. .photo),
 *  - wiersze tekstu (h1–h3, p, li, figcaption, blockquote, dt, dd): Y i wysokość przez 32,
 *  - interlinia każdego tekstu: 32 lub 64 px (poza <strong> i stopką),
 *  - nic w kontenerze nie wychodzi poza 112–1424 × 64–768,
 *  - stopka na y = 800,
 *  - brak przewijania slajdu (grafiki wychodzące poza slajd umieszczaj w warstwie .bleed z szablonu
 *    albo oznacz atrybutem data-bleed; obie formy audyt traktuje tak samo).
 * X liczony od lewej krawędzi kontenera (112), Y od góry slajdu.
 *
 * Użycie: node scripts/grid-audit.mjs prezentacja.html
 * Kod wyjścia: 0 = wszystkie slajdy OK, 1 = błąd siatki, 2 = złe wywołanie (scripts/cli.mjs).
 * Wymaga: npm install && npx playwright install chromium (package.json)
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { launchChromium, parseCli } from "./cli.mjs";
import { CANVAS, CONTAINER, FOOTER, GRID } from "./constants.mjs";

const USAGE = "node scripts/grid-audit.mjs prezentacja.html";
const { positionals: [input] } = parseCli({ usage: USAGE, positionals: [1, 1], files: true });

const browser = await launchChromium();
const page = await browser.newPage({ viewport: { width: CANVAS.width, height: CANVAS.height } });
await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts?.ready);
await page.waitForTimeout(300); // ResizeObserver i snap

const result = await page.evaluate(({ CONTAINER, FOOTER, GRID }) => {
  const TOL = 0.1;
  const X0 = CONTAINER.x0, Y_MIN = CONTAINER.y0, Y_MAX = CONTAINER.y1, X_MAX = CONTAINER.x1, FOOTER_Y = FOOTER.y;
  const M = GRID.module, U = GRID.unit;
  const off = (v, step) => Math.abs(v - step * Math.round(v / step));
  const name = (el) => {
    const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).filter(Boolean).join(".") : "";
    const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""} „${text}”`;
  };
  const slides = [...document.querySelectorAll("[data-slide]")];
  const report = [];

  slides.forEach((slide, i) => {
    const problems = [];
    const sb = slide.getBoundingClientRect();
    const rel = (el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - sb.left - X0, y: r.top - sb.top, w: r.width, h: r.height, right: r.right - sb.left, bottom: r.bottom - sb.top, left: r.left - sb.left };
    };
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      return !(r.width === 0 && r.height === 0) && getComputedStyle(el).display !== "none";
    };

    for (const el of slide.querySelectorAll("[data-grid]")) {
      if (!visible(el)) continue;
      const mode = el.dataset.grid;
      const step = mode.startsWith("32") ? M : U;
      const b = rel(el);
      const snap = el.hasAttribute("data-snap") ? parseFloat(getComputedStyle(el).marginBottom) || 0 : 0;
      const checks = [["y", b.y, M], ["h", b.h + snap, M]];
      if (mode !== "32y") checks.push(["x", b.x, step], ["w", b.w, step]);
      const bad = checks.filter(([, v, m]) => off(v, m) > TOL);
      if (bad.length) problems.push(`${name(el)} [${mode}] ${bad.map(([k, v]) => `${k}=${v.toFixed(2)}`).join(" ")}`);
    }

    const lines = slide.querySelectorAll(".container :is(h1, h2, h3, p, li, dt, dd, figcaption, blockquote)");
    for (const el of lines) {
      if (el.hasAttribute("data-grid") || !visible(el)) continue;
      const b = rel(el);
      if (off(b.y, M) > TOL || off(b.h, M) > TOL) {
        problems.push(`${name(el)} [wiersz] y=${b.y.toFixed(2)} h=${b.h.toFixed(2)}`);
      }
    }

    // Interlinie
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
    const lh = new Set();
    while (walker.nextNode()) {
      const el = walker.currentNode.parentElement;
      if (!walker.currentNode.textContent.trim() || el.closest("strong, script, style, .slide-footer, .deck-nav")) continue;
      const v = parseFloat(getComputedStyle(el).lineHeight);
      if (Number.isNaN(v) || v % M !== 0) lh.add(`${el.tagName.toLowerCase()} line-height ${getComputedStyle(el).lineHeight}`);
    }
    problems.push(...lh);

    // Granice kontenera
    for (const el of slide.querySelectorAll(".container *")) {
      if (!visible(el)) continue;
      const b = rel(el);
      if (b.left < X0 - TOL || b.right > X_MAX + TOL || b.bottom > Y_MAX + TOL || b.y < Y_MIN - TOL) {
        problems.push(`${name(el)} poza kontenerem: x ${b.left.toFixed(0)}–${b.right.toFixed(0)}, y ${b.y.toFixed(0)}–${b.bottom.toFixed(0)}`);
        break;
      }
    }

    const footer = slide.querySelector(".slide-footer");
    if (footer && Math.abs(rel(footer).y - FOOTER_Y) > TOL) problems.push(`stopka na y=${rel(footer).y.toFixed(2)}, oczekiwane ${FOOTER_Y}`);
    // Grafiki celowo wychodzące poza slajd (warstwa .bleed albo [data-bleed], np. góry na slajdzie
    // tytułowym i „Kontakt”) nie liczą się do przewijania.
    const bleed = [...slide.querySelectorAll(".bleed, [data-bleed]")];
    bleed.forEach((el) => { el.dataset.auditDisplay = el.style.display; el.style.display = "none"; });
    if (slide.scrollHeight > slide.clientHeight + 1 || slide.scrollWidth > slide.clientWidth + 1) problems.push("przewijanie wewnątrz slajdu");
    bleed.forEach((el) => { el.style.display = el.dataset.auditDisplay; delete el.dataset.auditDisplay; });

    report.push({ slide: i + 1, problems });
  });
  return report;
}, { CONTAINER, FOOTER, GRID });

await browser.close();
let failed = 0;
for (const { slide, problems } of result) {
  if (problems.length) {
    failed += 1;
    console.log(`Slajd ${slide}: ${problems.length} problem(y)`);
    for (const p of problems) console.log(`  - ${p}`);
  } else {
    console.log(`Slajd ${slide}: OK`);
  }
}
console.log(failed ? `\nSiatka: błędy na ${failed} slajdach.` : "\nSiatka: wszystkie slajdy OK.");
process.exit(failed ? 1 : 0);
