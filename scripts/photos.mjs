#!/usr/bin/env node
/**
 * Pobiera wybrane zdjęcia z Unsplash do układu „Zdjęcie + treść” (references/zdjecia.md).
 * Używa zwykłego linku pobierania ze strony zdjęcia (jak przycisk „Download”), bez klucza API.
 * Kadruje po stronie Unsplash do 1504 × 1728 px (2 × ramka 752 × 864) i zapisuje JPEG.
 *
 * Użycie: node scripts/photos.mjs photos.json [--out ./screens]
 *
 * photos.json:
 * [
 *   { "name": "gory-mgla", "url": "https://unsplash.com/photos/<slug>-<id>",
 *     "author": "autor", "alt": "Pasma górskie we mgle o świcie", "focus": "center 40%" }
 * ]
 * name, url, author, alt – wymagane; focus – opcjonalny punkt kadru (object-position).
 * Na końcu wypisuje gotowy HTML ramki z podpisem autora.
 * Bez zależności (Node 18+ z wbudowanym fetch).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const W = 1504, H = 1728;
const args = process.argv.slice(2);
const listPath = args.find((a) => !a.startsWith("--"));
if (!listPath) {
  console.error("Użycie: node scripts/photos.mjs photos.json [--out ./screens]");
  process.exit(2);
}
const outIdx = args.indexOf("--out");
const outDir = path.resolve(outIdx >= 0 ? args[outIdx + 1] : path.join(path.dirname(listPath), "screens"));
await mkdir(outDir, { recursive: true });

// Id zdjęcia Unsplash ma 11 znaków i kończy ostatni segment adresu (/photos/<slug>-<id>).
const photoId = (url) => {
  const segment = new URL(url).pathname.split("/").filter(Boolean).pop() || "";
  return segment.length >= 11 ? segment.slice(-11) : null;
};

const list = JSON.parse(await readFile(listPath, "utf8"));
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
    if (!location) throw new Error(`brak przekierowania do pliku (HTTP ${dl.status}); zdjęcie może być płatne (Unsplash+) albo usunięte`);
    const src = new URL(location, "https://unsplash.com");
    for (const [k, v] of Object.entries({ w: W, h: H, fit: "crop", crop: "entropy", fm: "jpg", q: 80 })) {
      src.searchParams.set(k, String(v));
    }
    src.searchParams.delete("dl");
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status} przy pobieraniu pliku`);
    const file = path.join(outDir, `${item.name}.jpg`);
    await writeFile(file, Buffer.from(await res.arrayBuffer()));
    const handle = item.author.replace(/^@/, "");
    console.log(`OK  ${item.name} → ${file}`);
    console.log(`    <figure class="photo" data-grid="32y" style="--focus: ${item.focus ?? "center"};">
      <img src="screens/${item.name}.jpg" alt="${item.alt}">
      <figcaption class="photo-credit"><a href="https://unsplash.com/@${handle}">@${handle}</a></figcaption>
    </figure>`);
  } catch (error) {
    failed += 1;
    console.error(`BŁĄD ${item.name}: ${error.message}`);
  }
}
process.exit(failed ? 1 : 0);
