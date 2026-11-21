#!/usr/bin/env node
/**
 * Pobiera wybrane zdjęcia z Unsplash do układu „Zdjęcie + treść” (references/zdjecia.md).
 * Używa zwykłego linku pobierania ze strony zdjęcia (jak przycisk „Download”), bez klucza API.
 * Kadruje po stronie Unsplash do 1504 × 1728 px (2 × ramka 752 × 864) i zapisuje JPEG.
 *
 * Użycie: node scripts/photos.mjs photos.json [--out ./screens]
 * src w wypisanym HTML jest liczony względem katalogu photos.json (tam leży index.html decku).
 * Kod wyjścia: 0 = wszystkie zdjęcia, 1 = któreś się nie pobrało, 2 = złe wywołanie (scripts/cli.mjs).
 *
 * photos.json:
 * [
 *   { "name": "gory-mgla", "url": "https://unsplash.com/photos/<slug>-<id>",
 *     "author": "autor", "alt": "Pasma górskie we mgle o świcie", "focus": "center 40%" }
 * ]
 * name, url, author, alt – wymagane; focus – opcjonalny punkt kadru (object-position).
 * Na końcu wypisuje gotowy HTML ramki z podpisem autora.
 * Bez zależności (Node 18+ z wbudowanym fetch).
 *
 * Przekierowanie z /download jest traktowane jako plik tylko wtedy, gdy prowadzi do obrazu
 * (images.unsplash.com albo ścieżka z rozszerzeniem obrazu). Przekierowanie na bramkę
 * anty-botową (/.within.website) albo odpowiedź 401/403 z HTML są zgłaszane jako blokada;
 * parametrów kadru nie dokleja się wtedy do adresu bramki, a pliku nie zapisuje.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseCli, usageError } from "./cli.mjs";
import { DEVICE_SCALE, JPEG_QUALITY, PHOTO_FRAME } from "./constants.mjs";

const [W, H] = PHOTO_FRAME.map((v) => v * DEVICE_SCALE); // 1504 × 1728
const USAGE = "node scripts/photos.mjs photos.json [--out katalog]  (domyślnie screens/ obok JSON)";
const { values, positionals: [listPath] } = parseCli({ usage: USAGE, options: { out: { type: "string" } }, positionals: [1, 1], files: true });
const deckDir = path.dirname(path.resolve(listPath));
const outDir = path.resolve(values.out ?? path.join(deckDir, "screens"));
// src w wypisywanym HTML: względem katalogu decku (index.html obok photos.json), zgodnie z --out.
const srcDir = path.relative(deckDir, outDir).split(path.sep).join("/");
const srcFor = (name) => `${srcDir ? `${srcDir}/` : ""}${name}.jpg`;

// Id zdjęcia Unsplash ma 11 znaków i kończy ostatni segment adresu (/photos/<slug>-<id>).
const photoId = (url) => {
  const segment = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
  return segment.length >= 11 ? segment.slice(-11) : null;
};

// Bramka anty-botowa przed Unsplash (strona „Checking your browser”, ścieżka /.within.website).
const isGate = (url) => url.pathname.startsWith("/.within.website");
const isImageUrl = (url) =>
  !isGate(url) && (/(^|\.)images\.unsplash\.com$/i.test(url.hostname) || /\.(jpe?g|png|webp|avif)$/i.test(url.pathname));
const isHtml = (res) => /text\/html/i.test(res.headers.get("content-type") || "");
const BLOCKED = "pobieranie zablokowane przez bramkę anty-botową Unsplash; pliku nie zapisano. "
  + "Zostaw zaślepkę i przekaż użytkownikowi photos.json z poleceniem do uruchomienia u siebie (references/zdjecia.md)";

let list;
try { list = JSON.parse(await readFile(listPath, "utf8")); } catch (error) { usageError(USAGE, `${listPath} nie jest poprawnym JSON: ${error.message}`); }
if (!Array.isArray(list)) usageError(USAGE, `${listPath} ma zawierać listę (tablicę JSON)`);
await mkdir(outDir, { recursive: true });
let failed = 0;
for (const item of list) {
  const missing = ["name", "url", "author", "alt"].filter((k) => !item[k]);
  if (missing.length) {
    console.error(`Pominięto ${item.name ?? "(bez nazwy)"}: brak ${missing.join(", ")}`);
    failed += 1;
    continue;
  }
  const id = photoId(item.url);
  if (!id) {
    console.error(`Pominięto ${item.name}: nie rozpoznano id zdjęcia w ${item.url}`);
    failed += 1;
    continue;
  }
  try {
    const dl = await fetch(`https://unsplash.com/photos/${id}/download?force=true`, { redirect: "manual" });
    const location = dl.headers.get("location");
    await dl.body?.cancel();
    if (!location) {
      if ((dl.status === 401 || dl.status === 403) && isHtml(dl)) throw new Error(`HTTP ${dl.status} z HTML przy /download: ${BLOCKED}`);
      throw new Error(`brak przekierowania do pliku (HTTP ${dl.status}); zdjęcie może być płatne (Unsplash+) albo usunięte`);
    }
    const src = new URL(location, "https://unsplash.com");
    if (isGate(src)) throw new Error(`HTTP ${dl.status} → ${src.origin}${src.pathname}: ${BLOCKED}`);
    if (!isImageUrl(src)) throw new Error(`przekierowanie (HTTP ${dl.status}) nie prowadzi do obrazu: ${src.origin}${src.pathname}; pliku nie zapisano`);
    for (const [k, v] of Object.entries({ w: W, h: H, fit: "crop", crop: "entropy", fm: "jpg", q: JPEG_QUALITY })) {
      src.searchParams.set(k, String(v));
    }
    src.searchParams.delete("dl");
    const res = await fetch(src);
    if (!res.ok) {
      await res.body?.cancel();
      if ((res.status === 401 || res.status === 403) && isHtml(res)) throw new Error(`HTTP ${res.status} z HTML przy pobieraniu pliku: ${BLOCKED}`);
      throw new Error(`HTTP ${res.status} przy pobieraniu pliku ${src.origin}${src.pathname}`);
    }
    if (!/^image\//i.test(res.headers.get("content-type") || "")) {
      const type = res.headers.get("content-type") || "brak";
      await res.body?.cancel();
      throw new Error(`odpowiedź nie jest obrazem (Content-Type: ${type})${isHtml(res) ? `; ${BLOCKED}` : ""}`);
    }
    const file = path.join(outDir, `${item.name}.jpg`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    const handle = item.author.replace(/^@/, "");
    console.log(`OK  ${item.name} → ${file}`);
    console.log(`    <figure class="photo" data-grid="32y" style="--focus: ${item.focus ?? "center"};">
      <img src="${srcFor(item.name)}" alt="${item.alt}">
      <figcaption class="photo-credit"><a href="https://unsplash.com/@${handle}">@${handle}</a></figcaption>
    </figure>`);
  } catch (error) {
    failed += 1;
    console.error(`BŁĄD ${item.name}: ${error.message}`);
  }
}
process.exit(failed ? 1 : 0);
