#!/usr/bin/env node
/**
 * Skleja prezentację w jeden samodzielny plik: lokalne obrazy z <img src="..."> zamienia
 * na data URI. Obrazy data: zostawia bez zmian.
 *
 * Użycie: node scripts/inline-assets.mjs decks/…/index.html --out dist/2026-11-16-klient-temat.html
 * Bez zależności (sam Node).
 *
 * Kod wyjścia (README.md, sekcja „Umowa CLI”):
 *  0 = plik gotowy do wysłania,
 *  1 = plik zapisany, ale NIE nadaje się do wysłania: obraz http(s) (nie zadziała offline),
 *      nieznany typ obrazu, brak lokalnego pliku, zewnętrzny arkusz, skrypt lub @import,
 *      rozmiar powyżej 15 MB,
 *  2 = złe wywołanie (scripts/cli.mjs).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parseCli, usageError } from "./cli.mjs";
import { MAX_DECK_MB } from "./constants.mjs";

const USAGE = "node scripts/inline-assets.mjs wejscie.html --out wyjscie.html";
const { values, positionals: [input] } = parseCli({ usage: USAGE, options: { out: { type: "string" } }, positionals: [1, 1], files: true });
if (!values.out) usageError(USAGE, "brak opcji --out (plik wynikowy)");
const output = values.out;
const MAX_MB = MAX_DECK_MB;

const MIME = {
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
};
const baseDir = path.dirname(path.resolve(input));
let html = await readFile(input, "utf8");
const errors = [];
let count = 0;

// Obrazy w komentarzach HTML (np. zakomentowany <img> przy zaślepce) pomijamy.
const visible = html.replace(/<!--[\s\S]*?-->/g, "");
const matches = [...visible.matchAll(/<img\b[^>]*?\ssrc=(["'])(.*?)\1/gi)];
for (const m of matches) {
  const src = m[2];
  if (src.startsWith("data:")) continue;
  if (/^https?:/i.test(src)) { errors.push(`obraz z sieci (nie zadziała offline), pobierz go i wstaw lokalnie: ${src}`); continue; }
  const file = path.resolve(baseDir, decodeURI(src));
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) { errors.push(`nieznany typ obrazu (dozwolone: ${Object.keys(MIME).join(", ")}): ${src}`); continue; }
  try {
    const data = await readFile(file);
    html = html.split(`${m[1]}${src}${m[1]}`).join(`${m[1]}data:${mime};base64,${data.toString("base64")}${m[1]}`);
    count += 1;
  } catch {
    errors.push(`brak pliku ${src} (szukano: ${file})`);
  }
}

if (/<link\b[^>]*rel=["']?stylesheet/i.test(html) || /<script\b[^>]*\ssrc=/i.test(html) || /@import/i.test(html)) {
  errors.push("plik ma zewnętrzny arkusz, skrypt albo @import; prezentacja ma mieć wszystko w środku");
}

await mkdir(path.dirname(path.resolve(output)), { recursive: true });
await writeFile(output, html);
const mb = Buffer.byteLength(html) / 1024 / 1024;
if (mb > MAX_MB) errors.push(`plik ma ${mb.toFixed(1)} MB, limit ${MAX_MB} MB; zmniejsz liczbę screenów albo użyj mniejszej ramki`);
console.log(`Osadzono obrazów: ${count}. Rozmiar: ${mb.toFixed(1)} MB → ${output}`);
for (const e of errors) console.error(`BŁĄD: ${e}`);
if (errors.length) console.error(`\nBłędów: ${errors.length}. Plik zapisany, ale nie nadaje się do wysłania.`);
process.exit(errors.length ? 1 : 0);
