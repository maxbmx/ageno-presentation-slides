#!/usr/bin/env node
/**
 * Skleja prezentację w jeden samodzielny plik: lokalne obrazy z <img src="..."> zamienia
 * na data URI. Adresy http(s) i data: zostawia bez zmian (i ostrzega o http, bo plik
 * ma działać offline).
 *
 * Użycie: node scripts/inline-assets.mjs deck/index.html dist/2026-11-16-klient-temat.html
 * Bez zależności (sam Node).
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Użycie: node scripts/inline-assets.mjs wejscie.html wyjscie.html");
  process.exit(2);
}

const MIME = {
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
};
const baseDir = path.dirname(path.resolve(input));
let html = await readFile(input, "utf8");
const warnings = [];
let count = 0;

// Obrazy w komentarzach HTML (np. zakomentowany <img> przy zaślepce) pomijamy.
const visible = html.replace(/<!--[\s\S]*?-->/g, "");
const matches = [...visible.matchAll(/<img\b[^>]*?\ssrc=(["'])(.*?)\1/gi)];
for (const m of matches) {
  const src = m[2];
  if (src.startsWith("data:")) continue;
  if (/^https?:/i.test(src)) { warnings.push(`zewnętrzny obraz (nie zadziała offline): ${src}`); continue; }
  const file = path.resolve(baseDir, decodeURI(src));
  const mime = MIME[path.extname(file).toLowerCase()];
  if (!mime) { warnings.push(`nieznany typ pliku: ${src}`); continue; }
  try {
    const data = await readFile(file);
    html = html.split(`${m[1]}${src}${m[1]}`).join(`${m[1]}data:${mime};base64,${data.toString("base64")}${m[1]}`);
    count += 1;
  } catch {
    warnings.push(`brak pliku: ${src}`);
  }
}

if (/<link\b[^>]*rel=["']?stylesheet/i.test(html) || /<script\b[^>]*\ssrc=/i.test(html) || /@import/i.test(html)) {
  warnings.push("plik ma zewnętrzny arkusz, skrypt lub @import – prezentacja ma mieć wszystko w środku");
}

await mkdir(path.dirname(path.resolve(output)), { recursive: true });
await writeFile(output, html);
const mb = Buffer.byteLength(html) / 1024 / 1024;
console.log(`Osadzono obrazów: ${count}. Rozmiar: ${mb.toFixed(1)} MB → ${output}`);
if (mb > 15) warnings.push(`plik ma ${mb.toFixed(1)} MB (limit 15 MB) – zmniejsz jakość lub liczbę screenów`);
for (const w of warnings) console.warn(`UWAGA: ${w}`);
process.exit(warnings.some((w) => w.startsWith("brak pliku")) ? 1 : 0);
