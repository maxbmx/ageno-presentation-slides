#!/usr/bin/env node
/**
 * Pobiera grafiki Ageno do decku, bez żadnych zmian w plikach:
 *  - góry na slajd tytułowy: ageno-mountains.svg,
 *  - logotypy klientów ze strony głównej ageno.pl (sekcja „Ponad 100+ zadowolonych klientów”)
 *    do logos/NN-nazwa.ext oraz listę logos.json,
 *  - zdjęcia osób na slajd kontaktowy do people/ (lista PEOPLE niżej, zgodna z references/ageno.md).
 * Pliki logo zapisuje bajt w bajt: nie przycina i nie skaluje obszaru roboczego, dlatego
 * w równych polach slajdu „Klienci Ageno” logotypy są równe.
 *
 * Użycie: node scripts/ageno-assets.mjs [--out decks/…/] [--site https://ageno.pl/]
 *         [--mountains <adres svg>]
 * Bez zależności (Node 18+). Wymaga dostępu do ageno.pl.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const SITE = opt("--site", "https://ageno.pl/");
const MOUNTAINS = opt("--mountains", "https://ageno.pl/wp-content/uploads/2024/02/mountains-optim-1.svg");
const OUT = path.resolve(opt("--out", "."));
// Osoby na slajd kontaktowy: plik = slug imienia i nazwiska, jak w szablonie (people/<slug>.png).
const PEOPLE = [
  { file: "maksymilian-sleziak.png", url: "https://ageno.pl/wp-content/uploads/2023/04/image-15-1.png" },
];
// Sekcja z logotypami: od zdania o klientach do nagłówka „Nasze realizacje”.
const SECTION_START = /zadowolonych\s+klient/i;
const SECTION_END = /Nasze\s+realizacje/i;

const slug = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l")
    .replace(/(logotyp|logo)/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "logo";

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

// Adres obrazka z <img>: src, leniwe ładowanie (data-src, data-lazy-src) albo pierwszy wpis srcset.
export function imagesInSection(html, base) {
  const start = html.search(SECTION_START);
  const endRel = start >= 0 ? html.slice(start).search(SECTION_END) : -1;
  if (start < 0 || endRel < 0) return [];
  const section = html.slice(start, start + endRel);
  const found = [];
  for (const tag of section.match(/<img\b[^>]*>/gi) || []) {
    const attr = (name) => (tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`, "i")) || [])[1];
    let src = attr("data-lazy-src") || attr("data-src") || attr("src");
    if (!src || src.startsWith("data:")) src = (attr("data-srcset") || attr("srcset") || "").split(/\s+/)[0];
    if (!src || src.startsWith("data:")) continue;
    const url = new URL(src, base).href;
    if (!found.some((f) => f.url === url)) found.push({ url, alt: attr("alt") || "" });
  }
  return found;
}

async function main() {
  await mkdir(path.join(OUT, "logos"), { recursive: true });
  let failed = 0;

  try {
    await download(MOUNTAINS, path.join(OUT, "ageno-mountains.svg"));
    console.log(`OK  góry → ${path.join(OUT, "ageno-mountains.svg")}`);
  } catch (error) {
    failed += 1;
    console.error(`BŁĄD góry: ${error.message}`);
  }

  await mkdir(path.join(OUT, "people"), { recursive: true });
  for (const person of PEOPLE) {
    try {
      await download(person.url, path.join(OUT, "people", person.file));
      console.log(`OK  people/${person.file}`);
    } catch (error) {
      failed += 1;
      console.error(`BŁĄD people/${person.file}: ${error.message}`);
    }
  }

  const html = await (await fetch(SITE)).text();
  const images = imagesInSection(html, SITE);
  if (!images.length) {
    console.error("BŁĄD: nie znaleziono logotypów w sekcji klientów na stronie głównej (zmienił się układ strony?).");
    process.exit(1);
  }
  const list = [];
  for (const [i, img] of images.entries()) {
    const ext = path.extname(new URL(img.url).pathname) || ".svg";
    const file = `logos/${String(i + 1).padStart(2, "0")}-${slug(img.alt || path.basename(img.url, ext))}${ext}`;
    try {
      await download(img.url, path.join(OUT, file));
      list.push({ file, alt: img.alt, url: img.url });
      console.log(`OK  ${file}  (${img.alt})`);
    } catch (error) {
      failed += 1;
      console.error(`BŁĄD ${img.url}: ${error.message}`);
    }
  }
  await writeFile(path.join(OUT, "logos.json"), JSON.stringify({ source: SITE, downloaded: new Date().toISOString().slice(0, 10), logos: list }, null, 2));
  console.log(`\nLogotypów: ${list.length} → ${path.join(OUT, "logos.json")}`);
  console.log("Na slajd „Klienci Ageno” wybierz 10 (2 wiersze po 5); kolejność jak w logos.json albo wg branży klienta.");
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
