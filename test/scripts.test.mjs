/**
 * Testy parserów i lintera bez dodatkowego runnera: npm test (node --test).
 * Testy z przeglądarką (text-lint) są pomijane, gdy brakuje Playwrighta albo Chromium.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { imagesInSection } from "../scripts/ageno-assets.mjs";
import { pdfPages } from "../scripts/pdf.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (script, args) => spawnSync(process.execPath, [path.join(ROOT, "scripts", script), ...args], { encoding: "utf8" });
const NO_BROWSER = /brak pakietu Playwright|brak przeglądarki Chromium|nie udało się uruchomić Chromium/;

test("imagesInSection: strona 403 z bramki Cloudflare nie daje logotypów", () => {
  const html = "<!doctype html><html><head><title>Just a moment...</title></head><body>Checking your browser</body></html>";
  assert.deepEqual(imagesInSection(html, "https://ageno.pl/"), []);
});

test("imagesInSection: logotypy tylko z sekcji klientów, z leniwym ładowaniem i bez powtórzeń", () => {
  const html = `
    <img src="/przed-sekcja.png" alt="Poza sekcją">
    <h2>Ponad 100+ zadowolonych klientów</h2>
    <img src="/wp-content/uploads/auto-partner.svg" alt="Auto Partner">
    <img src="data:image/gif;base64,R0lGOD" data-lazy-src="https://cdn.example.com/martes.png" alt="Martes Sport">
    <img srcset="/eurofirany.webp 1x, /eurofirany@2x.webp 2x" alt="Eurofirany">
    <img src="/wp-content/uploads/auto-partner.svg" alt="Auto Partner (powtórka)">
    <h2>Nasze realizacje</h2>
    <img src="/po-sekcji.png" alt="Realizacja">`;
  assert.deepEqual(imagesInSection(html, "https://ageno.pl/"), [
    { url: "https://ageno.pl/wp-content/uploads/auto-partner.svg", alt: "Auto Partner" },
    { url: "https://cdn.example.com/martes.png", alt: "Martes Sport" },
    { url: "https://ageno.pl/eurofirany.webp", alt: "Eurofirany" },
  ]);
});

test("imagesInSection: brak końca sekcji = brak logotypów", () => {
  assert.deepEqual(imagesInSection("Ponad 100 zadowolonych klientów <img src='/a.svg'>", "https://ageno.pl/"), []);
});

test("pdfPages: liczy strony bez /Pages i odczytuje MediaBox", () => {
  const pdf = Buffer.from("<< /Type /Pages /Count 2 >> << /Type /Page /MediaBox [0 0 1152 648] >> << /Type/Page /MediaBox [0 0 1152 648] >>", "latin1");
  assert.deepEqual(pdfPages(pdf), { pages: 2, boxes: [[1152, 648], [1152, 648]] });
});

test("inline-assets: bez argumentów kod 2, obraz http(s) kod 1", (t) => {
  assert.equal(run("inline-assets.mjs", []).status, 2);
  const dir = mkdtempSync(path.join(tmpdir(), "ageno-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  writeFileSync(path.join(dir, "in.html"), '<img src="https://example.com/a.png">');
  const r = run("inline-assets.mjs", [path.join(dir, "in.html"), "--out", path.join(dir, "out.html")]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /obraz z sieci/);
});

test("text-lint: stanowisko, adresowy, zakres dat z półpauzą i cytat w blockquote", (t) => {
  // Jeden tekst na slajd; oczekiwane: lista reguł, które mają dać BŁĄD (pusta = brak błędu).
  const cases = [
    ["Stanowisko klienta jest jasne.", []],
    ["Dwa stanowiska pracy przy kasie.", []],
    ["Pole adresowy jest wymagane.", []],
    ["Książka adresowa klienta.", []],
    ["Moduł stanowi rdzeń systemu.", ["6"]],
    ["System adresuje problem zwrotów.", ["32"]],
    ["Projekt trwa 2026-10-01 – 2026-10-31.", []],
    ["Projekt trwa od 10.2026.", ["daty"]],
    ["Wdrożenie - etap drugi.", ["11"]],
    ['<blockquote>"Zrobimy to w oparciu o dane – dodatkowo 10.2026."</blockquote>', []],
  ];
  const dir = mkdtempSync(path.join(tmpdir(), "ageno-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "lint.html");
  const body = cases.map(([html]) => `<section data-slide>${html.startsWith("<") ? html : `<p>${html}</p>`}</section>`).join("\n");
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><body>${body}</body>`);
  const r = run("text-lint.mjs", [file]);
  if (r.status === 1 && NO_BROWSER.test(r.stderr)) return t.skip("brak Playwrighta albo Chromium");

  const bySlide = new Map();
  let current = 0;
  for (const line of r.stdout.split("\n")) {
    const head = line.match(/^Slajd (\d+)/);
    if (head) { current = Number(head[1]); bySlide.set(current, []); continue; }
    const err = line.match(/^\s+BŁĄD reguła (\S+):/);
    if (err) bySlide.get(current).push(err[1]);
  }
  cases.forEach(([text, expected], i) => {
    assert.deepEqual([...new Set(bySlide.get(i + 1) ?? [])].sort(), [...expected].sort(), `slajd ${i + 1}: ${text}`);
  });
  assert.equal(r.status, 1, "są przypadki z błędem, więc kod 1");
});
