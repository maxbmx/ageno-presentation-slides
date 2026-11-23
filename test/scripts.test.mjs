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
import { createServer } from "node:http";
import { existsSync, readdirSync } from "node:fs";
import { downloadImage, imageExtension, imagesInSection } from "../scripts/ageno-assets.mjs";
import { pdfPages } from "../scripts/pdf.mjs";
import { BLOCKED, downloadTarget, entryProblem, photoId } from "../scripts/photos.mjs";

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

test("text-lint: stanowisko, adresowy, zakres dat z półpauzą, cytat w blockquote i tło akcentu", (t) => {
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
    ["Krok 1 - analiza wymagań.", ["11"]],
    ["W 2026 - start projektu.", ["11"]],
    ["W 2026 – start projektu.", ["11"]],
    ["Okres 2026-10-01 - 2026-10-31.", ["11"]],
    ["Zespół 10 – 20 osób.", []],
    ['<blockquote>"Zrobimy to w oparciu o dane – dodatkowo 10.2026."</blockquote>', []],
    ['<p class="number"><span style="background: var(--c-accent)">42%</span></p>', ["akcent"]],
    ['<span style="background: var(--c-accent)"><span class="sr-only">2026-12-01 – 2026-12-31</span></span>', []],
  ];
  const dir = mkdtempSync(path.join(tmpdir(), "ageno-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = path.join(dir, "lint.html");
  const body = cases.map(([html]) => `<section data-slide>${html.startsWith("<") ? html : `<p>${html}</p>`}</section>`).join("\n");
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>:root { --c-accent: #ff6b00; }</style><body>${body}</body>`);
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

const tempDir = (t) => {
  const dir = mkdtempSync(path.join(tmpdir(), "ageno-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
};

test("grid-audit i text-lint: plik bez [data-slide] to błąd z kodem 1", (t) => {
  const file = path.join(tempDir(t), "pusty.html");
  writeFileSync(file, "<!doctype html><meta charset=\"utf-8\"><p>Bez slajdów.</p>");
  for (const script of ["grid-audit.mjs", "text-lint.mjs"]) {
    const r = run(script, [file]);
    if (r.status === 1 && NO_BROWSER.test(r.stderr)) return t.skip("brak Playwrighta albo Chromium");
    assert.equal(r.status, 1, script);
    assert.match(r.stderr, /brak slajdów \[data-slide\]/, script);
  }
});

test("photos: photoId i entryProblem nie rzucają na złych wpisach", () => {
  assert.equal(photoId("nie-url"), null);
  assert.equal(photoId("ftp://unsplash.com/photos/gory-abcdefghijk"), null);
  assert.equal(photoId("https://unsplash.com/photos/gory-mgla-1Z2niiBPg5A"), "1Z2niiBPg5A");
  assert.equal(entryProblem(null), "wpis nie jest obiektem JSON");
  assert.equal(entryProblem("tekst"), "wpis nie jest obiektem JSON");
  assert.equal(entryProblem([1]), "wpis nie jest obiektem JSON");
  assert.match(entryProblem({ name: "a" }), /brak url, author, alt/);
  assert.match(entryProblem({ name: "a", url: "zły adres", author: "x", alt: "y" }), /nie rozpoznano id/);
  assert.equal(entryProblem({ name: "a", url: "https://unsplash.com/photos/gory-1Z2niiBPg5A", author: "x", alt: "y" }), null);
});

test("photos: odpowiedź HTML bez przekierowania to blokada, nie Unsplash+", () => {
  for (const status of [200, 401, 403]) {
    assert.match(downloadTarget({ status, location: null, contentType: "text/html; charset=utf-8" }).error, new RegExp(BLOCKED.slice(0, 40)));
  }
  assert.match(downloadTarget({ status: 404, location: null, contentType: "application/json" }).error, /Unsplash\+/);
  assert.match(downloadTarget({ status: 307, location: "/.within.website/?redir=x", contentType: "" }).error, /bramkę anty-botową/);
  assert.match(downloadTarget({ status: 302, location: "https://example.com/strona", contentType: "" }).error, /nie prowadzi do obrazu/);
  assert.equal(downloadTarget({ status: 302, location: "https://images.unsplash.com/photo-1?ixid=x", contentType: "" }).url.hostname, "images.unsplash.com");
});

test("photos.mjs: wpis null i zły adres dają BŁĄD i kod 1, bez wyjątku", (t) => {
  const dir = tempDir(t);
  const list = path.join(dir, "photos.json");
  writeFileSync(list, JSON.stringify([null, 7, { name: "zly", url: "nie-url", author: "x", alt: "Góry" }]));
  const r = run("photos.mjs", [list]);
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /TypeError|at .*photos\.mjs/);
  assert.equal((r.stderr.match(/^BŁĄD /gm) || []).length, 3);
});

test("ageno-assets: imageExtension tylko dla typów obrazów", () => {
  assert.equal(imageExtension("image/svg+xml"), ".svg");
  assert.equal(imageExtension("image/png; charset=binary"), ".png");
  assert.equal(imageExtension("image/jpeg"), ".jpg");
  assert.equal(imageExtension("text/html; charset=utf-8"), null);
  assert.equal(imageExtension(""), null);
});

test("ageno-assets: downloadImage odrzuca HTML 200, rozszerzenie bierze z Content-Type", async (t) => {
  const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const server = createServer((req, res) => {
    if (req.url === "/logo-bez-rozszerzenia") { res.writeHead(200, { "content-type": "image/png" }); return res.end(PNG); }
    if (req.url === "/gory.svg") { res.writeHead(200, { "content-type": "image/png" }); return res.end(PNG); }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<title>Just a moment...</title>");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const dir = tempDir(t);

  const saved = await downloadImage(`${base}/logo-bez-rozszerzenia`, path.join(dir, "01-logo"));
  assert.equal(path.basename(saved), "01-logo.png");
  await assert.rejects(downloadImage(`${base}/logo.svg`, path.join(dir, "02-logo")), /nie jest obrazem.*text\/html/);
  await assert.rejects(downloadImage(`${base}/gory.svg`, path.join(dir, "ageno-mountains"), ".svg"), /oczekiwany plik \.svg/);
  assert.deepEqual(readdirSync(dir), ["01-logo.png"]);
  assert.equal(existsSync(path.join(dir, "02-logo.svg")), false);
});
