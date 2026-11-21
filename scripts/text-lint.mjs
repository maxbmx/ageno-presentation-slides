#!/usr/bin/env node
/**
 * Kontrola tekstu slajdów według references/redakcja.md.
 * Czyta widoczny tekst każdego slajdu (bez treści cytatów i zaślepek) i zgłasza fragmenty
 * z numerem reguły. BŁĄD = do poprawienia, UWAGA = do oceny w kontekście.
 * Sprawdza reguły 5, 6, 7, 10, 11, 12 (tylko nagłówki), 16, 17, 20, 21, 23, 28, 31, 32, 33, 34, 35,
 * wycinek S3 (lista czasowników w 1. os. lm.) i format dat. Lista ma być zgodna z references/redakcja.md.
 * Nie sprawdza reguł 3, 4, 8, 9, 13, 14, 15, 18, 19, 22, 24, 25, 26, 27, 29, 30 ani S1, S2, S4–S7;
 * nie czyta alt, <title> ani aria-label. Nie zastępuje czytania.
 *
 * Użycie: node scripts/text-lint.mjs prezentacja.html
 * Kod wyjścia: 0 = brak błędów (same uwagi też), 1 = są błędy, 2 = złe wywołanie (scripts/cli.mjs).
 * Wymaga: npm install --no-save playwright && npx playwright install chromium
 */
import { chromium } from "playwright";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseCli, requireFile } from "./cli.mjs";

const USAGE = "node scripts/text-lint.mjs prezentacja.html";
const { positionals: [input] } = parseCli({ usage: USAGE, positionals: [1, 1] });
requireFile(USAGE, input);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1536, height: 864 } });
await page.goto(pathToFileURL(path.resolve(input)).href, { waitUntil: "load" });

// Tekst zbierany per element blokowy; nagłówki osobno, bo mają ostrzejsze reguły.
const slides = await page.evaluate(() => {
  const BLOCK = "h1, h2, h3, .title, p, li, dt, dd, th, td, figcaption, .eyebrow, [data-source], .gantt-name";
  const SKIP = "blockquote, script, style, .shot-placeholder, .photo-placeholder, .logo-placeholder, .deck-nav, [data-slide-number]";
  return [...document.querySelectorAll("[data-slide]")].map((slide) => {
    const blocks = new Map();
    const walker = document.createTreeWalker(slide, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const parent = node.parentElement;
      if (!node.textContent.trim() || parent.closest(SKIP)) continue;
      const block = parent.closest(BLOCK) || parent;
      blocks.set(block, (blocks.get(block) || "") + node.textContent);
    }
    return [...blocks].map(([el, text]) => ({
      heading: el.matches("h1, h2, h3, .title, .eyebrow"),
      text: text.replace(/\s+/g, " ").trim(),
    }));
  });
});
await browser.close();

const W = "[\\p{L}\\p{N}]"; // znak słowa z polskimi literami
const word = (stem) => new RegExp(`(?<!${W})(${stem})(?!${W})`, "iu");
const rules = [
  // [reguła, poziom, wzorzec, opis, tylko nagłówki]
  ["5", "błąd", word("dodatkowo|kluczow\\p{L}*|kompleksow\\p{L}*|innowacyjn\\p{L}*|holistyczn\\p{L}*|synergi\\p{L}*|ekosystem\\p{L}*|krajobraz\\p{L}*|unikaln\\p{L}*|przełomow\\p{L}*|wartoś\\p{L}* dodan\\p{L}*|w dzisiejszych czasach"), "słowo typowe dla AI"],
  ["5", "błąd", word("additionally|crucial|delve\\p{L}*|enhanc\\p{L}*|foster\\p{L}*|landscape|pivotal|showcas\\p{L}*|testament|underscor\\p{L}*|vibrant"), "słowo typowe dla AI (EN)"],
  ["6", "błąd", word("stanowi(?!sk)\\p{L}*|pełni\\p{L}* rolę|może pochwalić się"), "zamiast „jest” / „ma”"],
  ["7", "błąd", /nie tylko\b.*\bale/iu, "„nie tylko X, ale Y”"],
  ["10", "uwaga", /(?<![\p{L}\p{N}])od [^.,]{1,40}? po /iu, "„od X po Y”: czy to prawdziwa skala?"],
  ["11", "błąd", /—/u, "pauza (em dash)"],
  ["11", "błąd", /(?<![\p{N}]) [–-] |(?<![\p{N}]) [–-]$|^[–-] /u, "myślnik zamiast kropki lub przecinka"],
  ["11", "błąd", /[()]/u, "nawias"],
  ["12", "błąd", /:/u, "dwukropek w tytule lub nagłówku", true],
  ["16", "błąd", /\p{Extended_Pictographic}/u, "emoji"],
  ["17", "błąd", /[„”“‘’«»]/u, "cudzysłów inny niż prosty"],
  ["20", "błąd", word("w celu|należy zauważyć|warto zauważyć|warto podkreślić"), "wypełniacz"],
  ["23", "uwaga", word("fundament\\p{L}*|kręgosłup\\p{L}*|filar\\p{L}*|paradygmat\\p{L}*|koł\\p{L}* zamachow\\p{L}*|gwiazd\\p{L}* przewodni\\p{L}*|motor\\p{L}* napędow\\p{L}*"), "metafora zamiast konkretnego słowa"],
  ["28", "uwaga", word("wykorzyst\\p{L}*|zaimplementow\\p{L}*|lewarow\\p{L}*"), "czy wystarczy „użyć”?"],
  ["31", "błąd", word("dokona\\p{L}*|przeprowadzeni\\p{L}*"), "rzeczownik odczasownikowy z pustym czasownikiem"],
  ["32", "błąd", word("w oparciu o|adresowa[ćłn]\\p{L}*|adresuj\\p{L}*|dedykowan\\p{L}*"), "kalka z angielskiego"],
  ["33", "uwaga", word("w ramach|na poziomie|w obszarze|w zakresie|pozwala na|umożliwia\\p{L}*"), "pusty łącznik"],
  ["34", "błąd", word("feature\\p{L}*|insight\\p{L}*|deliverable\\p{L}*|performance"), "zbędny anglicyzm"],
  ["35", "błąd", /(?<![\p{L}])zostan(?:ie|ą) \p{L}+(?:ny|na|ne|ni|ty|ta|te|ci)(?![\p{L}])/iu, "strona bierna w przyszłości"],
  ["S3", "błąd", word("\\p{L}+liśmy|\\p{L}+łyśmy|chcemy|możemy|będziemy|zrobimy|sprawdzimy|pokażemy|dostarczymy|wdrożymy|przygotujemy|zaproponujemy|rekomendujemy|proponujemy|planujemy|zapewnimy|stworzymy|zbudujemy|oferujemy|realizujemy|robimy|uważamy|zobaczymy|omówimy|przedstawimy"), "1. osoba liczby mnogiej"],
  ["daty", "błąd", /(?<![\p{N}.])\d{1,2}\.\d{1,2}\.\d{4}(?![\p{N}])|(?<![\p{N}.])\d{1,2}\.\d{4}(?![\p{N}])|\bQ[1-4] ?\d{4}\b/u, "data poza formatem YYYY-MM-DD"],
  ["daty", "błąd", word("(?:styczeń|stycznia|luty|lutego|marzec|marca|kwiecień|kwietnia|maj|maja|czerwiec|czerwca|lipiec|lipca|sierpień|sierpnia|wrzesień|września|październik|października|listopad|listopada|grudzień|grudnia|styczniu|lutym|marcu|kwietniu|maju|czerwcu|lipcu|sierpniu|wrześniu|październiku|listopadzie|grudniu) \\d{4}"), "miesiąc słownie zamiast YYYY-MM-DD"],
];
const HEDGES = /(?<![\p{L}])(może|prawdopodobnie|potencjalnie|raczej|ewentualnie|być może|niekiedy)(?![\p{L}])/giu;

let errors = 0;
let warnings = 0;
slides.forEach((blocks, i) => {
  const found = [];
  for (const { heading, text } of blocks) {
    for (const [id, level, re, label, headingOnly] of rules) {
      if (headingOnly && !heading) continue;
      if (id === "33" && /^w zakresie$/iu.test(text)) continue; // nagłówek układu „Zakres”
      const m = text.match(re);
      if (m) found.push([level, id, label, text, m[0]]);
    }
    for (const sentence of text.split(/(?<=[.!?])\s+/)) {
      const hedges = sentence.match(HEDGES) || [];
      if (hedges.length > 1) found.push(["uwaga", "21", "więcej niż jedno zastrzeżenie", sentence, hedges.join(", ")]);
    }
  }
  if (!found.length) {
    console.log(`Slajd ${i + 1}: OK`);
    return;
  }
  console.log(`Slajd ${i + 1}:`);
  for (const [level, id, label, text, hit] of found) {
    if (level === "błąd") errors += 1; else warnings += 1;
    const short = text.length > 90 ? `${text.slice(0, 87)}…` : text;
    console.log(`  ${level.toUpperCase()} reguła ${id}: ${label} [${hit}] w: ${short}`);
  }
});
console.log(`\nTekst: ${errors} błędów, ${warnings} uwag.`);
process.exit(errors ? 1 : 0);
