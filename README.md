# Prezentacje Ageno

Instrukcja dla agenta (`SKILL.md`) i skrypty, które składają prezentację Ageno w jeden plik HTML. Slajdy są 16:9, płótno ma 1536 × 864 px, siatka 8 / 32 px. CSS i JS są w pliku od razu, obrazy po `scripts/inline-assets.mjs`. Agent układa treść z materiałów, osoba lokalnie uruchamia te same polecenia. Język slajdów jest domyślnie polski. Fakty o Ageno bierz z `references/ageno.md`.

## Użycie w Claude, Codex i ChatGPT

- **Claude Code.** Skill nazywa się tak jak pole `name` w `SKILL.md`, więc sklonuj repozytorium do katalogu `~/.claude/skills/ageno-presentation/` (wszystkie projekty) albo `.claude/skills/ageno-presentation/` (jeden projekt). W tym katalogu raz uruchom `npm install && npx playwright install chromium`. Claude wczytuje skill sam, gdy prośba dotyczy prezentacji, albo po poleceniu `/ageno-presentation`.
- **Codex.** Otwórz repozytorium jako katalog roboczy. `AGENTS.md` kieruje do `SKILL.md` i poleceń `npm`, a prezentacje trafiają do `decks/` i `dist/` (oba w `.gitignore`).
- **ChatGPT i claude.ai (projekt).** Wklej `INSTRUKCJE.md` do instrukcji projektu i dodaj `assets/template.html` do jego plików. Skrypty tam nie działają: kontrola jest ręczna według listy w `INSTRUKCJE.md`, a grafiki z ageno.pl osadza się potem lokalnie przez `ageno-assets.mjs` i `inline-assets.mjs`.

Podgląd: po każdym pushu do `main` workflow `.github/workflows/pages.yml` publikuje na GitHub Pages złożony przykład `examples/przyklad.html` (`index.html`) i złożony szablon (`template.html`). Gdy grafik z ageno.pl nie da się pobrać, strona i tak powstaje, ale pliki nie są wtedy w pełni samowystarczalne i pokazują zaślepki.

## Struktura

- `SKILL.md` — kolejność: źródła, plan, screeny, slajdy, kontrola.
- `assets/template.html` — start każdej prezentacji: 24 układy, style, nawigacja, druk do PDF.
- `assets/ageno-logo.svg` — logo, w szablonie już jako `<symbol id="ageno-logo">`.
- `examples/przyklad.html` — przykładowa prezentacja z fikcyjnym klientem, zbudowana z układów szablonu.
- `AGENTS.md` — wskazówki dla Codex; `INSTRUKCJE.md` — reguły do projektu w ChatGPT lub claude.ai.
- `.github/workflows/pages.yml` — testy i podgląd na GitHub Pages.
- `references/` — `ageno.md`, `tresc.md`, `redakcja.md`, `siatka.md`, `uklady.md`, `screeny.md`, `zdjecia.md`, `nawigacja.md`, `qa.md`.
- `scripts/` — polecenia poniżej; `constants.mjs` (wspólne stałe) i `cli.mjs` (umowa CLI) to moduły pomocnicze.
- `test/` — testy skryptów (`npm test`, bez dodatkowego runnera).
- `package.json` — Playwright jako devDependency, skróty `npm run`; `.gitignore` — `node_modules`, `package-lock.json`, `decks/`, `dist/`, katalogi QA oraz pliki pobierane roboczo (`logos.json`, `people/`, `screens/`, `ageno-mountains.svg`, JPEG); wybrane SVG w `logos/` są w repo.

Katalog prezentacji jest konwencją ze `SKILL.md`. Skrypty czytają tylko pliki podane w poleceniu. `brief.md` nie jest parsowany.

```
decks/2026-11-16-klient-temat/
├── brief.md                 cel, odbiorca, rejestr źródeł, plan slajdów
├── index.html               kopia szablonu, obrazy jako ścieżki
├── ageno-mountains.svg      góry na slajd tytułowy i kontaktowy
├── logos/   logos.json      logotypy klientów (SVG z repo lub pobrane)
├── people/                  zdjęcia osób na slajd kontaktowy
├── screens.json             lista zrzutów
├── photos.json              wybrane zdjęcia z Unsplash
├── screens/                 zrzuty, zdjęcia i logo klienta
└── qa/                      zrzuty i qa-report.json
dist/2026-11-16-klient-temat.html   jeden plik do wysłania
```

## Szybki start

Node 18 lub nowszy. Raz, w katalogu repozytorium, dla `screenshots.mjs`, `grid-audit.mjs`, `text-lint.mjs`, `qa-html-deck.mjs` i `pdf.mjs`:

```bash
npm install && npx playwright install chromium
```

`npm install` instaluje Playwrighta w wersji z `package.json` (`^1.65.1`) do `node_modules/`, drugie polecenie pobiera przeglądarkę. `ageno-assets.mjs`, `photos.mjs` i `inline-assets.mjs` nie potrzebują Playwrighta.

Skróty `npm run` (argumenty po `--`, np. `npm run grid -- dist/plik.html`):

| Skrót | Polecenie |
| --- | --- |
| `npm test` | testy `test/*.test.mjs` przez `node --test`: parser logotypów, odczyt PDF, kody `inline-assets.mjs`, reguły lintera (test lintera jest pomijany bez Playwrighta) |
| `npm run check` | `node --check` wszystkich skryptów |
| `npm run verify` | `grid-audit.mjs` i `text-lint.mjs` na `assets/template.html` (oczekiwane: kod 0) |
| `npm run assets`, `screens`, `photos`, `inline` | `ageno-assets.mjs`, `screenshots.mjs`, `photos.mjs`, `inline-assets.mjs` |
| `npm run grid`, `lint`, `qa`, `pdf` | `grid-audit.mjs`, `text-lint.mjs`, `qa-html-deck.mjs`, `pdf.mjs` |
| `npm run browsers` | `playwright install chromium` |

```bash
mkdir -p decks/2026-11-16-klient-temat
cp assets/template.html decks/2026-11-16-klient-temat/index.html
```

Zostaw style i skrypt szablonu. Kolejne slajdy kopiuj z układów w tym pliku, podmień tekst i usuń nieużyte przykłady (`references/uklady.md`).

```bash
node scripts/ageno-assets.mjs --out decks/2026-11-16-klient-temat/
```

Pobiera `ageno-mountains.svg`, `people/maksymilian-sleziak.png` oraz logotypy do `logos/` i `logos.json`. Góry i portret mają stałe adresy i są pobierane niezależnie od strony głównej. Logotypy są wycinane z HTML strony głównej ageno.pl, ale tylko przy odpowiedzi HTTP 200. Inny status (np. 403 z bramki Cloudflare „Just a moment…”) jest zgłaszany z numerem statusu, a body nie jest parsowane. Status 200 bez sekcji klientów jest zgłaszany jako możliwa zmiana układu strony. W obu przypadkach to, co się udało, zostaje zapisane, `logos.json` powstaje z pustą listą `logos` i polem `error`, a skrypt kończy się kodem 1. Headless przeglądarka nie obchodzi tej bramki: w środowisku z blokadą logotypów tą metodą nie da się pobrać.

Screeny, gdy mają być w prezentacji. Ramki `full`, `wide`, `half`, `mobile` i pola JSON: `references/screeny.md`.

```bash
node scripts/screenshots.mjs decks/2026-11-16-klient-temat/screens.json
```

Wynik to `screens/<name>.jpg` obok JSON (albo w katalogu `--out`), w podwójnej rozdzielczości viewportu ramki, JPEG o jakości 80.

Zdjęcie górskie tylko w układzie „Zdjęcie + treść”. Wybór i kształt `photos.json`: `references/zdjecia.md`.

```bash
node scripts/photos.mjs decks/2026-11-16-klient-temat/photos.json
```

Bez klucza API. Skrypt czeka na przekierowanie unsplash.com na plik zdjęcia, kadruje do 1504 × 1728 i zapisuje JPEG w `screens/`. Przekierowanie uznaje za plik tylko wtedy, gdy prowadzi do obrazu (`images.unsplash.com` albo ścieżka z rozszerzeniem obrazu). Przekierowanie na bramkę anty-botową (`/.within.website`), odpowiedź 401/403 z HTML albo odpowiedź, która nie jest obrazem, zgłasza jako blokadę lub błąd z numerem statusu, bez zapisu pliku, i kończy się kodem 1. Parametrów kadru nie dokleja do adresu bramki. Headless przeglądarka tej bramki też nie przechodzi.

Jeden plik do wysłania:

```bash
node scripts/inline-assets.mjs decks/2026-11-16-klient-temat/index.html --out dist/2026-11-16-klient-temat.html
```

Lokalne obrazy zamienia na data URI. Kod 1 (plik zapisany, ale nie do wysłania) przy: obrazie `http(s)`, nieznanym typie obrazu, braku lokalnego pliku, zewnętrznym arkuszu, skrypcie albo `@import` i rozmiarze powyżej 15 MB. Każdy przypadek ma osobny komunikat `BŁĄD:`. Do wysłania nadaje się tylko plik z kodem 0.

Sterowanie w otwartym pliku i zapis do PDF z przeglądarki: `references/nawigacja.md`.

## Kontrola

```bash
node scripts/grid-audit.mjs dist/2026-11-16-klient-temat.html
node scripts/text-lint.mjs dist/2026-11-16-klient-temat.html
node scripts/qa-html-deck.mjs dist/2026-11-16-klient-temat.html --out decks/2026-11-16-klient-temat/qa
```

- `grid-audit.mjs` otwiera plik w oknie 1536 × 864 i sprawdza `data-grid`, wiersze tekstu, interlinię (wielokrotność 32 px, poza `strong` i stopką), granice kontenera (zgłasza każdy element poza kontenerem), szerokość tekstu ciągłego (`p`, `li`, `blockquote`, `dd` na ≥ 2 wiersze najwyżej 864 px, `references/siatka.md`, „Szerokość tekstu”) i stopkę na y = 800, z tolerancją 0,1 px. Kod 1, gdy slajd nie pasuje. Audyt `assets/template.html` kończy się kodem 0, 24 slajdy OK.
- `text-lint.mjs` czyta widoczny tekst slajdów według `references/redakcja.md`. Kod 1 jest tylko przy błędzie. Sama uwaga zostawia kod 0. Szablon: 0 błędów i 0 uwag. Które reguły sprawdza, a których nie: tabela w `references/redakcja.md`, sekcja „Kontrola automatyczna” (i nagłówek `scripts/text-lint.mjs`).
- `qa-html-deck.mjs` sprawdza 1600×900, 1366×768, 1280×720 i 1280×800 (inne okna: `--viewports 1366x768,1920x1080`): przepełnienie, strzałki (w tym krańce i autoukrywanie) oraz błędy konsoli. Zapisuje zrzut każdego slajdu w każdym oknie i `qa-report.json` w katalogu `--out` (domyślnie `qa/` obok pliku HTML). Kod 1, gdy któryś z tych punktów nie przejdzie. Sam szablon, bez `ageno-mountains.svg` i `people/maksymilian-sleziak.png` obok pliku, kończy się kodem 1 przez `ERR_FILE_NOT_FOUND` w konsoli. Po złożeniu tych obrazów przez `inline-assets.mjs` ten sam szablon przechodzi kontrolę z kodem 0.

PDF (ten sam wynik co „Zapisz jako PDF” w Chrome; zasady druku: `references/nawigacja.md`, lista kontrolna PDF: `references/qa.md`):

```bash
node scripts/pdf.mjs dist/2026-11-16-klient-temat.html --out dist/2026-11-16-klient-temat.pdf
```

- `pdf.mjs` drukuje plik przez Playwright (`preferCSSPageSize`, tło drukowane) i sprawdza, że liczba stron równa się liczbie slajdów, a każda strona ma MediaBox 1152 × 648 pt (16 × 9 cali). Kod 1 przy niezgodności; PDF zostaje zapisany do obejrzenia. Domyślne `--out`: plik `.pdf` obok HTML.

## Umowa CLI

Wszystkie skrypty w `scripts/` mają tę samą umowę (wspólny moduł `scripts/cli.mjs`: `parseCli` dla argumentów, `launchChromium` dla przeglądarki):

- argumenty pozycyjne to pliki wejściowe, opcje mają postać `--nazwa wartość` (`--out`, `--viewports`, `--site`, `--mountains`); `-h` albo `--help` wypisuje użycie,
- komunikaty są po polsku,
- **kod 0**: skrypt zadziałał i nie znalazł problemu; sama uwaga `text-lint.mjs` też daje 0,
- **kod 1**: skrypt zadziałał i znalazł problem (plik bez slajdów `[data-slide]`, błąd siatki, błąd tekstu, nieudany smoke-test, niezgodny PDF, nieudane pobranie, plik z `inline-assets.mjs`, który nie nadaje się do wysłania) albo nie mógł sprawdzić, bo brakuje Playwrighta lub przeglądarki Chromium (komunikat podaje polecenie instalacji),
- **kod 2**: złe wywołanie: brak albo nadmiar argumentu, nieznana opcja, opcja bez wartości, zła wartość (np. `--viewports 1366x`), brak pliku wejściowego. Skrypt kończy się wtedy, zanim uruchomi przeglądarkę albo cokolwiek zapisze.

| Skrypt | Wywołanie |
| --- | --- |
| `ageno-assets.mjs` | `[--out katalog] [--site url] [--mountains url]` |
| `screenshots.mjs` | `screens.json [--out katalog]` |
| `photos.mjs` | `photos.json [--out katalog]`; `src` w wypisanym HTML jest względem katalogu `photos.json` |
| `inline-assets.mjs` | `wejscie.html --out wyjscie.html` |
| `grid-audit.mjs` | `prezentacja.html` |
| `text-lint.mjs` | `prezentacja.html` |
| `qa-html-deck.mjs` | `prezentacja.html [--out katalog] [--viewports SZERxWYS,…]` |
| `pdf.mjs` | `prezentacja.html [--out plik.pdf]` |
