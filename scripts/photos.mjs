#!/usr/bin/env node
/**
 * Pobiera wybrane zdjęcia z Unsplash do układu „Zdjęcie + treść” (references/zdjecia.md).
 * Używa zwykłego linku pobierania ze strony zdjęcia (jak przycisk „Download”), bez klucza API.
 * Kadruje po stronie Unsplash do 1504 × 1728 px (2 × ramka 752 × 864) i zapisuje JPEG.
 *
 * Użycie: node scripts/photos.mjs photos.json [--out ./screens]
 * src w wypisanym HTML jest liczony względem katalogu photos.json (tam leży index.html decku).
 * Kod wyjścia: 0 = wszystkie zdjęcia, 1 = któreś się nie pobrało albo wpis jest błędny,
 * 2 = złe wywołanie (scripts/cli.mjs).
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
 * anty-botową (/.within.website) albo odpowiedź 200/401/403 z HTML zamiast przekierowania są
 * zgłaszane jako blokada; parametrów kadru nie dokleja się wtedy do adresu bramki, a pliku
 * nie zapisuje.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseCli, usageError } from "./cli.mjs";
import { DEVICE_SCALE, JPEG_QUALITY, PHOTO_FRAME } from "./constants.mjs";

const [W, H] = PHOTO_FRAME.map((v) => v * DEVICE_SCALE); // 1504 × 1728
const USAGE = "node scripts/photos.mjs photos.json [--out katalog]  (domyślnie screens/ obok JSON)";

export const BLOCKED = "pobieranie zablokowane przez bramkę anty-botową Unsplash; pliku nie zapisano. "
  + "Zostaw zaślepkę i przekaż użytkownikowi photos.json z poleceniem do uruchomienia u siebie (references/zdjecia.md)";

/** Id zdjęcia Unsplash (11 znaków na końcu ostatniego segmentu /photos/<slug>-<id>); zły adres = null. */
export function photoId(url) {
  let parsed;
  try { parsed = new URL(url); } catch { return null; }
  if (!/^https?:$/.test(parsed.protocol)) return null;
  const segment = parsed.pathname.split("/").filter(Boolean).pop() || "";
  return segment.length >= 11 ? segment.slice(-11) : null;
}

/** Błąd wpisu photos.json albo null, gdy wpis jest poprawny. */
export function entryProblem(item) {
  if (!item || typeof item !== "object" || Array.isArray(item)) return "wpis nie jest obiektem JSON";
  const missing = ["name", "url", "author", "alt"].filter((k) => typeof item[k] !== "string" || !item[k].trim());
  if (missing.length) return `brak ${missing.join(", ")}`;
  if (!photoId(item.url)) return `nie rozpoznano id zdjęcia w ${item.url}`;
  return null;
}

// Bramka anty-botowa przed Unsplash (strona „Checking your browser”, ścieżka /.within.website).
const isGate = (url) => url.pathname.startsWith("/.within.website");
const isImageUrl = (url) =>
  !isGate(url) && (/(^|\.)images\.unsplash\.com$/i.test(url.hostname) || /\.(jpe?g|png|webp|avif)$/i.test(url.pathname));
const isHtmlType = (type) => /text\/html/i.test(type || "");

/**
 * Ocena odpowiedzi z /download (redirect: "manual").
 * @returns {{ url: URL } | { error: string }} adres pliku obrazu albo opis problemu
 */
export function downloadTarget({ status, location, contentType }) {
  if (!location) {
    if ([200, 401, 403].includes(status) && isHtmlType(contentType)) return { error: `HTTP ${status} z HTML zamiast przekierowania do pliku: ${BLOCKED}` };
    return { error: `brak przekierowania do pliku (HTTP ${status}); zdjęcie może być płatne (Unsplash+) albo usunięte` };
  }
  const src = new URL(location, "https://unsplash.com");
  if (isGate(src)) return { error: `HTTP ${status} → ${src.origin}${src.pathname}: ${BLOCKED}` };
  if (!isImageUrl(src)) return { error: `przekierowanie (HTTP ${status}) nie prowadzi do obrazu: ${src.origin}${src.pathname}; pliku nie zapisano` };
  return { url: src };
}

async function fetchPhoto(id) {
  const dl = await fetch(`https://unsplash.com/photos/${id}/download?force=true`, { redirect: "manual" });
  await dl.body?.cancel();
  const target = downloadTarget({ status: dl.status, location: dl.headers.get("location"), contentType: dl.headers.get("content-type") });
  if (target.error) throw new Error(target.error);
  const src = target.url;
  for (const [k, v] of Object.entries({ w: W, h: H, fit: "crop", crop: "entropy", fm: "jpg", q: JPEG_QUALITY })) {
    src.searchParams.set(k, String(v));
  }
  src.searchParams.delete("dl");
  const res = await fetch(src);
  const type = res.headers.get("content-type") || "";
  if (!res.ok) {
    await res.body?.cancel();
    if ((res.status === 401 || res.status === 403) && isHtmlType(type)) throw new Error(`HTTP ${res.status} z HTML przy pobieraniu pliku: ${BLOCKED}`);
    throw new Error(`HTTP ${res.status} przy pobieraniu pliku ${src.origin}${src.pathname}`);
  }
  if (!/^image\//i.test(type)) {
    await res.body?.cancel();
    throw new Error(`odpowiedź nie jest obrazem (Content-Type: ${type || "brak"})${isHtmlType(type) ? `; ${BLOCKED}` : ""}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const { values, positionals: [listPath] } = parseCli({ usage: USAGE, options: { out: { type: "string" } }, positionals: [1, 1], files: true });
  const deckDir = path.dirname(path.resolve(listPath));
  const outDir = path.resolve(values.out ?? path.join(deckDir, "screens"));
  // src w wypisywanym HTML: względem katalogu decku (index.html obok photos.json), zgodnie z --out.
  const srcDir = path.relative(deckDir, outDir).split(path.sep).join("/");
  const srcFor = (name) => `${srcDir ? `${srcDir}/` : ""}${name}.jpg`;

  let list;
  try { list = JSON.parse(await readFile(listPath, "utf8")); } catch (error) { usageError(USAGE, `${listPath} nie jest poprawnym JSON: ${error.message}`); }
  if (!Array.isArray(list)) usageError(USAGE, `${listPath} ma zawierać listę (tablicę JSON)`);
  await mkdir(outDir, { recursive: true });

  let failed = 0;
  for (const [i, item] of list.entries()) {
    const label = typeof item?.name === "string" && item.name ? item.name : `wpis ${i + 1}`;
    const problem = entryProblem(item);
    if (problem) {
      console.error(`BŁĄD ${label}: ${problem}; pominięto`);
      failed += 1;
      continue;
    }
    try {
      const data = await fetchPhoto(photoId(item.url));
      const file = path.join(outDir, `${item.name}.jpg`);
      await writeFile(file, data);
      const handle = item.author.replace(/^@/, "");
      console.log(`OK  ${item.name} → ${file}`);
      console.log(`    <figure class="photo" data-grid="32y" style="--focus: ${item.focus ?? "center"};">
      <img src="${srcFor(item.name)}" alt="${item.alt}">
      <figcaption class="photo-credit"><a href="https://unsplash.com/@${handle}">@${handle}</a></figcaption>
    </figure>`);
    } catch (error) {
      failed += 1;
      console.error(`BŁĄD ${label}: ${error.message}`);
    }
  }
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
