# Prezentacje Ageno

Instrukcja dla agenta (`SKILL.md`) i skrypty, które składają prezentację Ageno w jeden plik HTML. Slajdy są 16:9, płótno ma 1536 × 864 px, siatka 8 / 32 px. CSS i JS są w pliku od razu, obrazy po `scripts/inline-assets.mjs`. Agent układa treść z materiałów, osoba lokalnie uruchamia te same polecenia. Język slajdów jest domyślnie polski. Fakty o Ageno bierz z `references/ageno.md`.

## Struktura

- `SKILL.md` — kolejność: źródła, plan, screeny, slajdy, kontrola.
- `assets/template.html` — start każdej prezentacji: 24 układy, style, nawigacja, druk do PDF.
- `assets/ageno-logo.svg` — logo, w szablonie już jako `<symbol id="ageno-logo">`.
- `references/` — `ageno.md`, `tresc.md`, `redakcja.md`, `siatka.md`, `uklady.md`, `screeny.md`, `zdjecia.md`, `nawigacja.md`, `qa.md`.
- `scripts/` — polecenia poniżej. W repozytorium nie ma `package.json` ani `.gitignore`.

Katalog prezentacji jest konwencją ze `SKILL.md`. Skrypty czytają tylko pliki podane w poleceniu. `brief.md` nie jest parsowany.

```
decks/2026-11-16-klient-temat/
├── brief.md                 cel, źródła, plan
├── index.html               kopia szablonu
├── ageno-mountains.svg      góry na slajd tytułowy i kontaktowy
├── logos/   logos.json      logotypy klientów
├── people/                  zdjęcia osób
├── screens.json  photos.json  screens/
└── qa/                      zrzuty i qa-report.json
dist/2026-11-16-klient-temat.html
```

## Szybki start

Node 18 lub nowszy. Raz, w katalogu repozytorium, dla `screenshots.mjs`, `grid-audit.mjs`, `text-lint.mjs` i `qa-html-deck.mjs`:

```bash
npm install --no-save playwright && npx playwright install chromium
```

Polecenie tworzy `node_modules/` i nie zapisuje `package.json`. `ageno-assets.mjs`, `photos.mjs` i `inline-assets.mjs` nie potrzebują Playwrighta.

```bash
mkdir -p decks/2026-11-16-klient-temat
cp assets/template.html decks/2026-11-16-klient-temat/index.html
```

Zostaw style i skrypt szablonu. Kolejne slajdy kopiuj z układów w tym pliku, podmień tekst i usuń nieużyte przykłady (`references/uklady.md`).

```bash
node scripts/ageno-assets.mjs --out decks/2026-11-16-klient-temat/
```

Pobiera `ageno-mountains.svg`, `people/maksymilian-sleziak.png` oraz logotypy do `logos/` i `logos.json`. Logotypy są wycinane z HTML strony głównej ageno.pl. Brak tej sekcji w odpowiedzi kończy skrypt kodem 1. Góry i portret mogą być już zapisane, `logos.json` wtedy nie powstaje.

Screeny, gdy mają być w prezentacji. Ramki `full`, `wide`, `half`, `mobile` i pola JSON: `references/screeny.md`.

```bash
node scripts/screenshots.mjs decks/2026-11-16-klient-temat/screens.json
```

Wynik to `screens/<name>.jpg` obok JSON, w podwójnej rozdzielczości viewportu ramki.

Zdjęcie górskie tylko w układzie „Zdjęcie + treść”. Wybór i kształt `photos.json`: `references/zdjecia.md`.

```bash
node scripts/photos.mjs decks/2026-11-16-klient-temat/photos.json
```

Bez klucza API. Skrypt czeka na przekierowanie unsplash.com na plik zdjęcia, kadruje do 1504 × 1728 i zapisuje JPEG w `screens/`.

Jeden plik do wysłania:

```bash
node scripts/inline-assets.mjs decks/2026-11-16-klient-temat/index.html dist/2026-11-16-klient-temat.html
```

Lokalne obrazy zamienia na data URI. Adres `http(s)` zostaje, skrypt wypisuje ostrzeżenie i kończy się kodem 0. Brak lokalnego pliku daje kod 1. Powyżej 15 MB jest ostrzeżenie, kod zostaje 0.

W otwartym pliku strzałki przełączają slajdy, `F` włącza pełny ekran, `G` albo adres `#siatka` pokazuje kratkę. PDF: Chrome lub Edge, Drukuj, Zapisz jako PDF, strona 16:9, jeden slajd na stronę (`references/nawigacja.md`).

## Kontrola

```bash
node scripts/grid-audit.mjs dist/2026-11-16-klient-temat.html
node scripts/text-lint.mjs dist/2026-11-16-klient-temat.html
node scripts/qa-html-deck.mjs dist/2026-11-16-klient-temat.html --out decks/2026-11-16-klient-temat/qa
```

- `grid-audit.mjs` otwiera plik w oknie 1536 × 864 i sprawdza `data-grid`, wiersze tekstu, interlinię 32 lub 64 px (poza `strong` i stopką), granice kontenera i stopkę na y = 800. Kod 1, gdy slajd nie pasuje. Audyt `assets/template.html` kończy się kodem 0, 24 slajdy OK.
- `text-lint.mjs` czyta widoczny tekst slajdów według `references/redakcja.md`. Kod 1 jest tylko przy błędzie. Sama uwaga zostawia kod 0. Szablon: 0 błędów i 0 uwag. Czego skrypt nie sprawdza do końca, jest w nagłówku `scripts/text-lint.mjs` i na liście w `references/qa.md`.
- `qa-html-deck.mjs` sprawdza 1600×900, 1366×768, 1280×720 i 1280×800: przepełnienie, strzałki (w tym krańce i autoukrywanie) oraz błędy konsoli. Zapisuje zrzut każdego slajdu w każdym oknie i `qa-report.json`. Kod 1, gdy któryś z tych punktów nie przejdzie. Sam szablon, bez `ageno-mountains.svg` i `people/maksymilian-sleziak.png` obok pliku, kończy się kodem 1 przez `ERR_FILE_NOT_FOUND` w konsoli. Po złożeniu tych obrazów przez `inline-assets.mjs` ten sam szablon przechodzi kontrolę z kodem 0.
