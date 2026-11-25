#!/usr/bin/env node
/**
 * Sprawdza, czy katalog układów w references/uklady.md jest zgodny z numerowanymi
 * komentarzami układów (`<!-- N. Nazwa -->`) w assets/template.html: ten sam zestaw
 * numerów 1–24, w tej samej kolejności, z tą samą nazwą (kolumna „Układ” w tabeli
 * jest nazwą układu albo jej początkiem, reszta komentarza w szablonie to dopisek
 * w nawiasie albo po dwukropku).
 *
 * Użycie: node scripts/uklady-sync.mjs
 * Kod wyjścia: 0 = katalog zgodny z szablonem, 1 = niezgodność, 2 = złe wywołanie.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCli, requireFile } from "./cli.mjs";

const USAGE = "node scripts/uklady-sync.mjs";
parseCli({ usage: USAGE, positionals: [0, 0] });

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(root, "assets/template.html");
const ukladyPath = path.join(root, "references/uklady.md");
requireFile(USAGE, templatePath);
requireFile(USAGE, ukladyPath);

const template = await readFile(templatePath, "utf8");
const uklady = await readFile(ukladyPath, "utf8");

const templateLayouts = [...template.matchAll(/<!--\s*(\d+)\.\s*(.+?)\s*-->/g)]
  .map(([, num, name]) => [Number(num), name])
  .filter(([num]) => num >= 1 && num <= 24);

const catalogLayouts = [...uklady.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*[^|]+?\s*\|/gm)]
  .map(([, num, name]) => [Number(num), name]);

const problems = [];

if (templateLayouts.length !== 24) {
  problems.push(`assets/template.html: znaleziono ${templateLayouts.length} numerowanych komentarzy układów (<!-- N. Nazwa -->), oczekiwano 24`);
}
if (catalogLayouts.length !== 24) {
  problems.push(`references/uklady.md: znaleziono ${catalogLayouts.length} wierszy katalogu, oczekiwano 24`);
}

const byNumber = new Map(templateLayouts.map(([num, name]) => [num, name]));
catalogLayouts.forEach(([num, name], i) => {
  if (num !== i + 1) {
    problems.push(`references/uklady.md: wiersz ${i + 1} ma numer ${num}, oczekiwano ${i + 1} (kolejność albo numeracja się rozjechała)`);
  }
  const templateName = byNumber.get(num);
  if (templateName === undefined) {
    problems.push(`układ ${num} („${name}”) jest w references/uklady.md, ale nie ma go w assets/template.html`);
    return;
  }
  // W szablonie nazwa układu bywa uzupełniona dopiskiem w nawiasie albo po dwukropku
  // (np. „Pełny screen (teza w jednym wierszu)”, „Zakres: w projekcie / poza projektem”);
  // każdy inny dalszy ciąg znaków po nazwie z katalogu liczy się jako niezgodność.
  const rest = templateName.startsWith(name) ? templateName.slice(name.length) : null;
  const matches = templateName === name || (rest !== null && (rest === "" || /^(: | \()/.test(rest)));
  if (!matches) {
    problems.push(`układ ${num}: nazwa w references/uklady.md („${name}”) nie pasuje do komentarza w assets/template.html („${templateName}”)`);
  }
});

for (const [num, name] of templateLayouts) {
  if (!catalogLayouts.some(([n]) => n === num)) {
    problems.push(`układ ${num} („${name}”) jest w assets/template.html, ale nie ma go w references/uklady.md`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`BŁĄD: ${p}`);
  console.log("\nUkłady: niezgodność między assets/template.html a references/uklady.md.");
} else {
  console.log("Układy: references/uklady.md zgodny z assets/template.html (24/24).");
}
process.exit(problems.length ? 1 : 0);
