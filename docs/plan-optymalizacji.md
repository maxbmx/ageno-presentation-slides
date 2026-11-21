# Plan optymalizacji i ujednolicenia skillu

Analiza tylko do odczytu (2026-11-21). Żaden istniejący plik nie był zmieniany. Uruchomione: `npm install --no-save playwright`, `npx playwright install chromium`, `grid-audit.mjs` i `text-lint.mjs` na `assets/template.html`, `qa-html-deck.mjs` na szablonie i na szablonie po `inline-assets.mjs`, `ageno-assets.mjs` i `photos.mjs` przeciw żywym adresom, oraz jednorazowy PDF z `qa.md` (Playwright, `preferCSSPageSize`). `screenshots.mjs` nie był uruchamiany na żywej stronie. Node w tym środowisku: 22.23.4.

Rozmiary: `SKILL.md` 160 linii, 10 418 B; `references/` 1 079 linii, 59 870 B; `assets/template.html` 1 409 linii, 63 928 B.

## Założenia

Wyciąg z `SKILL.md` i `references/`. Skrypty i szablon mają to realizować albo pilnować.

1. Kolejność pracy: źródła, plan, screeny, slajdy, kontrola. W numeracji SKILL dochodzą wejście i przekazanie (kroki 1–7). Nie zaczynać od kodu. Przy dłuższym decku plan przed kodem.
2. Jeden samodzielny plik HTML: CSS, JS, screeny i logo w środku. Bez CDN, `@import` i zewnętrznych fontów. Działa lokalnie bez sieci.
3. Płótno 1536 × 864 (16:9), skala `min(okno / 1536, okno / 864)`, wolne pola w kolorze tła. Kontener 112–1424 × 64–768 (1312 × 704). Stopka na y = 800, wysokość 32. Siatka 32 px dla krawędzi i wierszy; 8 px dla szerokości wewnętrznych. `data-grid`, `data-snap`. Kratka ukryta, podgląd klawiszem `G` i adresem `#siatka`.
4. 24 układy w `assets/template.html`. Nowy slajd powstaje przez kopiowanie układu, nie przez pisanie CSS od zera. Klasy z szablonu, tokeny kolorów.
5. Tło zawsze `#f7f7f7`. Tekst `#231430`, akcent `#ff6b00`, `--c-on-accent` `#231430` (w dokumentacji kontrast 6:1). Marka klienta zmienia tylko `--c-text`, `--c-accent`, `--c-on-accent`, `--c-muted`.
6. Logo Ageno: jeden `<symbol id="ageno-logo">`, kolory bez zmian. Duże na slajdzie tytułowym (ramka 208 × 64). Małe (24 px) w stopce kolejnych slajdów, wstawia je skrypt. Logo klienta tylko z pliku użytkownika (tytuł i case study).
7. Daty `YYYY-MM-DD`, okres `2026-10-01 – 2026-10-31`. Język: `references/redakcja.md` (S1–S7, reguły 3–35). Tytuł slajdu to teza. Jeden slajd, jedna teza. Fakty o Ageno tylko z `references/ageno.md`; pozycji **[uzupełnić]** się nie zgaduje. Dane starsze niż 12 miesięcy agent potwierdza.
8. Screeny: ramki `full`, `wide`, `half`, `mobile` o wymiarach ze `references/screeny.md`, zrzut w tych proporcjach, `deviceScaleFactor: 2`. Zdjęcia stockowe tylko w układzie „Zdjęcie + treść”, kadr 1504 × 1728, podpis `@autor`, licencja Unsplash (nie Unsplash+).
9. Grafiki Ageno: `scripts/ageno-assets.mjs` zapisuje `ageno-mountains.svg`, `logos/` + `logos.json` i `people/` bez przerabiania plików. Katalog decku: `decks/YYYY-MM-DD-klient-temat/` i `dist/YYYY-MM-DD-klient-temat.html`. Limit 15 MB.
10. Nawigacja i PDF: kontrakt DOM z `references/nawigacja.md`, strzałki, `F`, `G`, brak pętli, autoukrywanie 1,8 s, gest 50 px, przejście 200 ms / 48 px. PDF: strona 1536 × 864, jeden slajd = jedna strona, bez pustej strony na końcu.
11. Kontrola: `grid-audit.mjs`, `text-lint.mjs`, `qa-html-deck.mjs` (1600×900, 1366×768, 1280×720, 1280×800), potem oględziny i PDF. Kod 1 przy błędzie siatki, błędzie tekstu albo nieudanym smoke-teście. Sama uwaga lintera zostawia kod 0.

## Zgodność

| Założenie | Status | Gdzie | Uwagi |
| --- | --- | --- | --- |
| Kolejność workflow | częściowo | `SKILL.md`, `README.md`, `references/tresc.md` | Pięć ogniw w nagłówku SKILL, niżej siedem numerowanych kroków. `brief.md` nie jest parsowany (README mówi to wprost). Skrypty nie wymuszają kolejności. |
| Jeden plik, brak CDN / `@import` / fontów zewnętrznych | częściowo | `assets/template.html`, `scripts/inline-assets.mjs` | Szablon: CSS i JS w pliku, fonty systemowe, logo jako `<symbol>`. Skrypt ostrzega o `http(s)`, `@import`, zewnętrznym CSS/JS i o rozmiarze, ale kod 1 daje tylko ostrzeżenie zaczynające się od „brak pliku”. Na szablonie bez grafik: 3 takie ostrzeżenia, kod 1. |
| Płótno 1536 × 864 i skala | OK | `assets/template.html` (`--slide-w/h`, `SLIDE_W/H`), `scripts/grid-audit.mjs` | Audyt otwiera okno 1536 × 864. Po złożeniu obrazów QA na czterech oknach: przepełnienie 0. |
| Kontener, budżet 704, stopka y = 800 | OK | `references/siatka.md`, szablon, `grid-audit.mjs` | Audyt szablonu: 24 slajdy OK, kod 0. Zmierzona stopka slajdu 2: y = 800, h = 32, x = 112. |
| Siatka 32 / 8 i `data-snap` | częściowo | szablon, `scripts/grid-audit.mjs`, `references/siatka.md`, `references/zdjecia.md` | Slajdy 15–16 mają `data-grid="32y"`. Audyt wtedy nie sprawdza x ani szerokości. `32y` jest w `zdjecia.md` i w wyjściu `photos.mjs`, nie ma go w `siatka.md` ani w kroku 5.3 SKILL. |
| Grafika poza slajdem bez przewijania | częściowo | `.bleed` w szablonie, komentarz i selektor w `grid-audit.mjs` | Szablon używa klasy `.bleed` (`overflow: hidden`), bez atrybutu `data-bleed`. Audyt ukrywa tylko `[data-bleed]`. Mimo to audyt szablonu przechodzi. |
| 24 układy | OK | `assets/template.html`, `references/uklady.md` | 24 elementy `[data-slide]`, numery 1–24 zgodne z katalogiem. Audyt i lint obejmują wszystkie. |
| Typografia, sierotki, `fixOrphans` | częściowo | szablon, `references/redakcja.md` | Interlinia 32/64, `strong` z `line-height: 1`, `text-wrap`, `hyphens: manual` są w CSS. `fixOrphans` jest wołane raz przy starcie. W `redakcja.md` jest też „przed drukiem”; drugiego wywołania nie ma, tekst w DOM już jest poprawiony, więc PDF je dostaje. Slajdy 15–16 mają ręczne `&nbsp;` przy „w”, wbrew zdaniu, żeby tego nie wpisywać. |
| Kolory i tło `#f7f7f7` | OK | `:root` w szablonie, `references/siatka.md`, `references/ageno.md` | Policzone WCAG: `#231430` na `#ff6b00` = 6,06:1 (zapis „6:1”), biały na `#ff6b00` = 2,86:1. Zaślepka zdjęcia używa `#3a4246`, którego nie ma w tabeli tokenów. |
| Logo Ageno: jeden symbol, kolory, tytuł 208 × 64 | OK | `assets/ageno-logo.svg`, `<symbol id="ageno-logo">` | Trzy `d` i oba fill (`#ff6b00`, `#231430`) są takie same. `clipPath` w szablonie ma id `ageno-logo-clip`, w pliku SVG `a`. |
| Małe logo na każdym kolejnym slajdzie, dużego nie powtarzać | częściowo | `SKILL.md` (sekcja Logo), `references/uklady.md` (Kontakt), `references/qa.md`, skrypt szablonu | Skrypt pomija `.footer-logo`, gdy slajd ma `.brand-logo`. Zmierzone na złożonym pliku: slajdy 1 i 24 mają duże logo i nie mają małego; slajd 2 ma małe (y = 804, h = 24). `uklady.md` tak opisuje kontakt. SKILL każe małe logo na każdym kolejnym slajdzie i zabrania powtarzać duże. `qa.md`: „każdy kolejny slajd ma małe logo”. Komentarz CSS wymienia wyjątek tylko dla tytułowego. Offset 4 px (24 px w wierszu 32 px) nie jest w `siatka.md` i audyt go nie mierzy. |
| Logo klienta z pliku, bez pseudo-loga | OK | szablon (komentarz `.title-client-logo`, `.logo-placeholder`) | Reguła dla agenta. Skrypt jej nie sprawdza. |
| Daty `YYYY-MM-DD` | częściowo | `scripts/text-lint.mjs`, `references/redakcja.md` | Lint łapie `d.m.yyyy`, `m.yyyy`, `Qn yyyy` i miesiąc słownie z rokiem. Nie łapie dat względnych ani półpauzy bez spacji. Cytat w `blockquote` jest pomijany. Szablon: 0 błędów, 0 uwag, kod 0. |
| Reguły 3–35 i S1–S7 | częściowo | `scripts/text-lint.mjs`, `references/redakcja.md`, `references/qa.md` | W kodzie są: 5, 6, 7, 10, 11, 12 (tylko nagłówki), 16, 17, 20, 21, 23, 28, 31, 32, 33, 34, 35, wycinek S3, daty. Poziom uwagi: 10, 21, 23, 28, 33. Dokumentacja wymienia jako niesprawdzane 8, 9, 22, 24, 25, 29 i S1–S7. Poza tą listą kod nie ma też 3, 4, 13, 14, 15, 18, 19, 26, 27, 30. `redakcja.md` pisze, że S1–S7 „nie da się sprawdzić”, a skrypt sprawdza wycinek S3. `alt`, `<title>` i `aria-label` nie wchodzą do tekstu. Na próbce: reguła 6 łapie „stanowisko”, reguła 32 łapie „adresowy”. |
| Jedna teza, rejestr źródeł, fakty tylko z `ageno.md` | częściowo | `references/tresc.md`, `references/ageno.md`, slajdy 21, 23, 24 | To reguły agenta, bez skryptu. Kontakt: imię, e-mail i telefon zgodne z `ageno.md`, roli nie ma (w pliku **[uzupełnić]**). Slajd 23 ma zdanie o 100 klientach z `ageno.md`. Slajd 21 w stopce podaje `ageno.pl/opinie` i datę 2026-11-17, a cytaty są zaślepką „Dokładne brzmienie…”. Próg 12 miesięcy nie jest sprawdzany. Sprzeczność „200+” i „ponad 100 projektów” jest oznaczona w `ageno.md`. |
| Ramki screenów i viewporty | OK | `references/screeny.md`, `FRAMES` w `scripts/screenshots.mjs`, CSS `--shot-*` | Liczby się zgadzają, `deviceScaleFactor: 2`. Skryptu nie uruchamiałem na stronie. W przykładach `delay` to 800 (`screeny.md`), 500 (komentarz skryptu) i 400 (domyślna wartość w kodzie). |
| Zdjęcia Unsplash, 1504 × 1728, podpis | częściowo | `references/zdjecia.md`, `scripts/photos.mjs`, slajdy 15–16 | Układ, `figcaption` i zaślepka są w szablonie. Pobranie testowym id: `GET /photos/<id>/download?force=true` → 307 na `/.within.website` („Authorization required”), potem URL z doklejonymi `w,h,fit,crop,fm,q` → 401 i HTML „Checking your browser”. Kod 1, komunikat „HTTP 401 przy pobieraniu pliku”, pliku JPEG nie ma. Ten sam URL w headless Chromium: 403. Osobno `images.unsplash.com` z parametrami kadru zwrócił 200 `image/jpeg`. Wypisywany HTML ma na sztywno `src="screens/…"`, także przy innym `--out`. |
| `ageno-assets.mjs`: góry, logotypy, osoby, pliki bez zmian | częściowo | `scripts/ageno-assets.mjs`, `references/ageno.md`, `README.md` | Bezpośrednie URL gór i portretu: HTTP 200 (SVG 275 565 B, PNG 103 265 B, 399 × 307). Strona główna: HTTP 403 Cloudflare, tytuł „Just a moment…” (fetch i headless Chromium), zero `<img>`. Skrypt i tak kończy się kodem 1 tekstem „nie znaleziono logotypów… (zmienił się układ strony?)”. `logos.json` nie powstaje. Góry i portret są już zapisane, zgodnie z README. `fetch` strony nie sprawdza statusu. `PEOPLE` ma jeden wpis, ten sam URL co `ageno.md`. |
| `decks/` + `dist/`, nazwa z datą | OK | `SKILL.md`, `README.md` | Konwencja. Skrypty biorą ścieżki z argumentów i nie sprawdzają nazwy folderu. |
| Limit 15 MB | częściowo | `scripts/inline-assets.mjs`, `SKILL.md`, `references/qa.md` | SKILL: skrypt „pilnuje 15 MB”. W kodzie przekroczenie jest ostrzeżeniem, a kod wyjścia od niego nie zależy. Złożony szablon: 0,9 MB, kod 0. Pliku powyżej 15 MB nie uruchamiałem. |
| Kontrakt DOM, strzałki, autoukrywanie | OK | szablon, `scripts/qa-html-deck.mjs` | Na szablonie i po inline: dokładnie jeden aktywny slajd, strzałki przechodzą, krańce `disabled`, autoukrywanie i hover bez uwag, przepełnienie 0. |
| `F`, `G`, `#siatka`, gest, reduced motion, aria | częściowo | `references/nawigacja.md`, skrypt szablonu, `qa-html-deck.mjs` | Szablon to ma (odczyt CSS/JS). QA tego nie naciska. Lista ręczna jest w `qa.md`, punkt 6. |
| PDF 16:9, jedna strona na slajd | OK | `@page` w szablonie, one-liner w `references/qa.md` | Osobnego skryptu nie ma. One-liner na złożonym szablonie: 24 obiekty `/Type /Page`, jeden MediaBox `0 0 1152 648` (16 × 9 cali). Stron PDF nie oglądałem wizualnie. |
| QA czterech okien i błędy konsoli | OK | `scripts/qa-html-deck.mjs`, `README.md` | Szablon bez `ageno-mountains.svg` i `people/maksymilian-sleziak.png`: kod 1. Komunikat `net::ERR_FILE_NOT_FOUND` (2 wpisy przy 1600×900, 3 przy pozostałych oknach; tekst nie podaje URL). Po inline trzech obrazów: kod 0, konsola pusta. Domyślne `--out` w kodzie to `./qa-presentation`, w dokumentacji `decks/…/qa`. |
| Playwright przy każdym skrypcie | częściowo | `SKILL.md` linia 55, `README.md` | SKILL: „skrypty wymagają Node i Playwrighta”. README: `ageno-assets.mjs`, `photos.mjs` i `inline-assets.mjs` Playwrighta nie potrzebują. Tak jest w importach. |
| `package.json` i `.gitignore` | OK | `README.md` | README podaje, że ich nie ma. W repozytorium ich nie ma. `npm install --no-save` zostawił tylko nieśledzony `node_modules/`. |

## Problemy

1. **Sprzeczna reguła logo.** Trzy miejsca opisują stopkę inaczej niż szablon i niż `uklady.md`. Agent, który trzyma się SKILL albo listy w `qa.md`, usunie duże logo z kontaktu albo dołoży drugie, małe.
2. **Pobieranie grafik myli awarię z treścią.** Strona główna ageno.pl w tym środowisku zwraca 403 (Cloudflare). Skrypt zgłasza zmianę układu strony i nie zapisuje `logos.json`, choć góry i portret już pobrał. Unsplash `/download` prowadzi na bramkę (`/.within.website`); skrypt dokleja do niej parametry kadru i dostaje 401. Host `images.unsplash.com` na próbny URL odpowiedział 200. Headless Chromium nie przeszedł ani strony głównej ageno.pl, ani `/download`.
3. **Linter ma dziury, których lista „niesprawdzane” nie wymienia**, oraz fałszywe trafienia na „stanowisko” i „adresowy”. Reguła 12 w kodzie dotyczy tylko nagłówków. `redakcja.md` zbyt szeroko wyłącza całe S1–S7.
4. **Martwe i rozjechane nazwy.** `qa-html-deck.mjs` przy braku slajdów każe iść do `references/html-presentation.md` (pliku nie ma; kontrakt jest w `nawigacja.md`). Atrybut `data-bleed` jest w audycie i w komentarzu, w szablonie go nie ma. `data-grid="32y"` jest w szablonie i w jednym reference, a nie w dokumencie siatki. Klasa `.w-2` jest w CSS, nie ma jej w HTML szablonu ani w `siatka.md`. `imagesInSection` jest eksportowane i nie ma testu.
5. **Te same stałe w wielu plikach.** 1536, 864, 112, 800, 704, ramki screenów, 15 MB, lista `PEOPLE` i jakość JPEG (zrzut 85, zdjęcie 80, rada w `screeny.md` 75) są wpisane osobno w CSS, JS szablonu, skryptach i co najmniej dwóch dokumentach.
6. **CLI i kody wyjścia są różne.** `grid-audit` i `text-lint` biorą tylko `argv[2]` i piszą po polsku. `qa-html-deck` pisze po angielsku, ma `--out` i `--viewports`. `inline-assets` ma dwa argumenty pozycyjne. `ageno-assets` ma same flagi. Kod 2 jest przy braku argumentu (poza `ageno-assets`). Zły `--viewports` rzuca wyjątek przed `launch`, bez kodu 2. Ostrzeżenie 15 MB i obraz `http(s)` kończą się kodem 0, wbrew hasłu „pilnuje” i wbrew punktowi QA „bez ostrzeżeń”, jeśli ktoś patrzy tylko na kod wyjścia.
7. **Tekst skillu powtarza reguły, które i tak każe czytać.** Kolory, logo, daty, PDF i trzy komendy kontroli są w SKILL, README i w `siatka.md` / `nawigacja.md` / `qa.md` / `redakcja.md`. Przy odpaleniu skillu agent płaci za SKILL (10,4 kB) i ponownie za reference, który SKILL otwiera.
8. **Szablon uczy złego źródła na slajdzie 21** i ma angielskie etykiety, których lint nie widzi: „assessment”, „Development”, nadtytuł „Mobile”. „Code freeze” i „staging” są w regule 34 dozwolone. „Osiem miesięcy” w tytule slajdu 13 nie jest zakresem dat; stopka tego slajdu zakres ma.
9. **Audyt siatki urywa raport** po pierwszym elemencie kontenera poza granicą (`break`) i sprawdza interlinię przez `v % 32 !== 0`, bez tolerancji 0,1 px użytej przy krawędziach.
10. **PDF nie jest skryptem.** Działa one-liner z `qa.md` (sprawdzony: 24 strony, 16 × 9 cali), ale nie wchodzi do `qa-html-deck.mjs`. QA nie liczy stron.

## Plan

### P1

1. **Jedna reguła logo.** Zostawić zachowanie szablonu: duże logo na slajdzie 1 i 24, małe w stopce pozostałych, kontakt bez małego. Poprawić SKILL (sekcja Logo i krok 5.4), punkt w `qa.md` i komentarz CSS przy `.footer-logo`. Dopisać wyjątek 24 px w wierszu 32 px (offset 4 px) do `siatka.md`.
   - Dlaczego: trzy dokumenty każą agentowi zepsuć slajd, który szablon już składa poprawnie.
   - Pliki: `SKILL.md`, `references/qa.md`, `references/siatka.md`, komentarz w `assets/template.html`.
   - Nakład: S. Ryzyko: niskie (sama dokumentacja i komentarz).

2. **Pobieranie: status HTTP osobno od parsowania.** W `ageno-assets.mjs` nie czytać body przy statusie innym niż 200; komunikat ma podawać status, nie „zmienił się układ”. Przy braku sekcji klientów zapisać to, co już się udało, i dalej kończyć kodem 1. W `photos.mjs` uznać Location za plik tylko wtedy, gdy prowadzi do obrazu; 401/403 z HTML bramki opisać jako blokadę, bez dopisywania `w/h/fit` do URL bramki. Nie obiecywać, że headless Chromium to obchodzi: w tym środowisku dostał 403 i na ageno.pl, i na `/download`.
   - Dlaczego: dziś poprawny objaw (Cloudflare, Anubis) wygląda jak zmiana strony albo jak błąd HTTP przy pliku. Góry i portret da się pobrać; logotypy i zdjęcia Unsplash tą metodą nie.
   - Pliki: `scripts/ageno-assets.mjs`, `scripts/photos.mjs`, `README.md`, `references/zdjecia.md`.
   - Nakład: M. Ryzyko: średnie (zmiana komunikatów i tego, kiedy powstaje `logos.json`).

3. **Lista reguł lintera = kod.** W `redakcja.md` i `qa.md` dopisać 3, 4, 13, 14, 15, 18, 19, 26, 27, 30 oraz to, że 12 dotyczy nagłówków, a S3 jest tylko wycinkiem. Zawęzić rdzenie: `stanowi` tak, żeby nie łapał „stanowisko”; `adresow` tak, żeby nie łapał „adresowy”.
   - Dlaczego: agent uznaje milczenie lintera za zgodę, a lista „niesprawdzane” jest krótsza niż kod.
   - Pliki: `references/redakcja.md`, `references/qa.md`, `scripts/text-lint.mjs`.
   - Nakład: M. Ryzyko: średnie przy zmianie wzorców (fałszywe trafienia w drugą stronę). Sama poprawka listy jest S i niskiego ryzyka; da się ją oddać osobno.

4. **Domknąć nazwy, które już się rozjechały.** Komunikat QA przenieść na `references/nawigacja.md`. W `siatka.md` i w kroku 5.3 SKILL opisać `data-grid="32y"` (albo zamienić je na `8`, jeśli pomiar x/szerokości ma zostać). Albo audyt ma traktować `.bleed` jak dziś `[data-bleed]`, albo z szablonu i komentarza znika nieużywana forma.
   - Dlaczego: agent szuka pliku, którego nie ma, i nie wie, że `32y` jest legalne.
   - Pliki: `scripts/qa-html-deck.mjs`, `scripts/grid-audit.mjs`, `references/siatka.md`, `SKILL.md`, `assets/template.html`.
   - Nakład: S. Ryzyko: niskie, jeśli `32y` zostaje i tylko dochodzi opis. Zmiana selektora audytu wymaga powtórki `grid-audit` na szablonie.

### P2

5. **Jedno miejsce stałych dla skryptów.** `scripts/constants.mjs`: płótno, marginesy, stopka, ramki i viewporty, limit 15 MB, jakość JPEG, `PEOPLE`. Skrypty importują moduł. `siatka.md` zostaje opisem dla człowieka; na górze modułu jedno zdanie, że zmiana liczby bez `siatka.md` jest błędem. `PEOPLE` nie jest kopiowane ręcznie z `ageno.md` w dwie strony bez tego pliku.
   - Dlaczego: ramki i płótno są dziś w CSS, w trzech skryptach i w dwóch reference. Rozjazd nie wyjdzie w review.
   - Pliki: nowy `scripts/constants.mjs`, `scripts/*.mjs`, `references/ageno.md` (wskazanie listy osób).
   - Nakład: M. Ryzyko: średnie (zły import psuje wszystkie skrypty; po zmianie powtórzyć audyt szablonu).

6. **Jedna umowa CLI.** Polskie komunikaty w `qa-html-deck.mjs`. Ten sam sposób flag (`--out`). Brak argumentu: kod 2, także przy złym viewportcie. Ustalić w SKILL i README, czy `http(s)`, nieznany MIME i rozmiar powyżej 15 MB są kodem 1. Dziś README mówi prawdę o kodzie 0, a SKILL mówi „pilnuje”. `photos.mjs` ma wypisywać `src` zgodny z `--out`.
   - Dlaczego: agent, który sprawdza tylko kod wyjścia, odda deck z zewnętrznym obrazem albo plikiem ponad 15 MB.
   - Pliki: `scripts/qa-html-deck.mjs`, `scripts/inline-assets.mjs`, `scripts/photos.mjs`, `SKILL.md`, `README.md`, `references/qa.md`.
   - Nakład: M. Ryzyko: średnie, jeśli kod 1 zacznie obejmować ostrzeżenia (zmieni się „zielony” przebieg). Najpierw uzgodnić umowę w dokumentacji (S, niskie).

7. **`package.json` i `.gitignore`.** `playwright` jako devDependency, `engines` zgodne z README (Node 18+). `.gitignore`: `node_modules/`, `decks/`, `dist/`, katalogi QA. README dziś świadomie opisuje brak obu plików i `npm install --no-save`; po zmianie zaktualizować tę instrukcję.
   - Dlaczego: bez `.gitignore` `node_modules` łatwo dodać do commita. Bez `package.json` nie ma zablokowanej wersji Playwrighta (tu zainstalowała się przeglądarka Chrome for Testing 159.0.8154.6).
   - Pliki: nowe `package.json`, `.gitignore`, `README.md`, `SKILL.md`, `references/qa.md`.
   - Nakład: S. Ryzyko: niskie. Nie dodawać wygenerowanych decków.

8. **Krótszy SKILL.** Zostawić frontmatter, siedem kroków, tabelę „kiedy czytać” i listę rzeczy, których nie wolno złamać (jedno zdanie + link). Wyciąć z SKILL powtórzone kolory, wymiary logo, procedurę PDF i treść reguł redakcyjnych.
   - Dlaczego: 10,4 kB skillu w dużej części dubluje pliki, które ten sam workflow każe otworzyć. Błąd poprawia się w jednym miejscu i zostaje w drugim (tak jest już przy logo).
   - Pliki: `SKILL.md`. Po tej zmianie sprawdzić, że każdy usunięty fakt nadal stoi w dokładnie jednym reference.
   - Nakład: M. Ryzyko: średnie (agent, który nie otworzy reference, straci szczegół). Dlatego najpierw P1, potem skrót.

9. **Jedno miejsce na regułę w `references/`.** Geometria tylko w `siatka.md`, język tylko w `redakcja.md`, układy tylko w `uklady.md`, kontrakt DOM i PDF tylko w `nawigacja.md`, lista kontrolna tylko w `qa.md`. W pozostałych plikach jedno zdanie i link. Zlać trzy kopie komend (SKILL, README, `qa.md`) do README + jednej wzmianki w `qa.md`. Ujednolicić „slajd kończący” (23, logotypy) i „slajd zamykający” (24, kontakt). Poprawić stopkę slajdu 21 (zaślepka cytatu nie może wskazywać `ageno.pl/opinie` jako źródła tych zdań) i przykładowe angielskie etykiety.
   - Dlaczego: ta sama liczba i ta sama procedura żyją w trzech akapitach. Slajd 21 uczy fałszywej atrybucji.
   - Pliki: `references/*.md`, `README.md`, `assets/template.html` (teksty slajdów 13, 15, 16, 21 i etykiety slajdu 13).
   - Nakład: M. Ryzyko: średnie przy zmianie tekstów szablonu (po nich ponownie `text-lint` i `grid-audit`). Samo skrócenie reference bez zmian zdań na slajdach: niskie.

### P3

10. **Wspólny start skryptów.** Jedna funkcja: argumenty, kod 2, uruchomienie Chromium, komunikat gdy brak Playwrighta. Dziś brak przeglądarki kończy się nieobsłużonym wyjątkiem, nie kodem 1.
    - Pliki: nowy helper w `scripts/`, `grid-audit.mjs`, `text-lint.mjs`, `qa-html-deck.mjs`, `screenshots.mjs`.
    - Nakład: M. Ryzyko: niskie, jeśli zachowanie sprawdzone na szablonie zostaje (kod 0 / kod 1 jak wyżej).

11. **PDF i pełniejszy audyt siatki.** `scripts/pdf.mjs` z one-linera (liczba stron = liczba slajdów, MediaBox 1152 × 648). W `grid-audit.mjs` zbierać wszystkie wyjścia poza kontener, nie tylko pierwsze; przy interlinii użyć tej samej tolerancji 0,1 px co przy krawędziach.
    - Pliki: nowy `scripts/pdf.mjs`, `scripts/grid-audit.mjs`, `references/qa.md`.
    - Nakład: M. Ryzyko: niskie dla PDF (osobny skrypt). Średnie dla audytu, jeśli tolerancja zmieni wynik szablonu. Szablon dziś przechodzi bez tolerancji na interlinii, więc sama zmiana progu nie powinna go oblać.

12. **Fixture zamiast ręcznego sprawdzania parserów.** Mały test node (bez dodatkowego runnera): `imagesInSection` na HTML 403 i na fragmencie z sekcją klientów; `text-lint` na „stanowisko”, „adresowy”, zakres dat z półpauzą i cytat w `blockquote`. Usunąć nieużywane `.w-2` albo wpisać je do `siatka.md`. Zdecydować, czy `imagesInSection` zostaje eksportem.
    - Pliki: nowy `scripts/*.test.mjs` albo `test/`, `assets/template.html` (CSS), `scripts/ageno-assets.mjs`.
    - Nakład: M. Ryzyko: niskie.

13. **Drobne zgodności przykładów.** Usunąć ręczne `&nbsp;` ze slajdów 15–16 (zostaje `fixOrphans`). Jedna wartość `delay` w `screeny.md` i w komentarzu `screenshots.mjs` (kod zostawia 400). Jedna jakość JPEG w stałych z punktu 5. Zdanie o `beforeprint` w `redakcja.md` dopasować do jednego wywołania przy starcie.
    - Pliki: `assets/template.html`, `references/screeny.md`, `scripts/screenshots.mjs`, `references/redakcja.md`.
    - Nakład: S. Ryzyko: niskie. Po zmianie szablonu powtórzyć lint i audyt.

## Proponowana kolejność

1. P1.1 (logo) i P1.4 (nazwy `html-presentation`, `32y`, `.bleed`) — same dokumenty i komentarze, od razu przestają mylić.
2. P1.3 w części listy reguł (bez zmiany wzorców), potem zawężenie rdzeni `stanowi` / `adresow` na próbce z P3.12.
3. P1.2 (pobieranie). Najpierw status HTTP i komunikat, bez zmiany zestawu URL-i gór i portretu, które dziś zwracają 200.
4. P2.6 w części umowy kodów (dokumentacja), następnie ewentualna zmiana kodu 1 dla `http(s)` i 15 MB.
5. P2.5 (stałe) razem z jakością JPEG i `PEOPLE`.
6. P2.7 (`package.json`, `.gitignore`) i aktualizacja README.
7. P2.8 i P2.9 (skrót SKILL i reference) dopiero, gdy logo, siatka i linter mają po jednym miejscu. Na końcu poprawka tekstów szablonu (slajd 21, etykiety) i powtórka trzech skryptów QA.
8. P3.10–P3.13: helper, `pdf.mjs`, fixture, drobne przykłady.

Po każdym punkcie, który rusza szablon albo audyt: `grid-audit.mjs` i `text-lint.mjs` na `assets/template.html` (oczekiwane: kod 0, 24 slajdy, 0 błędów i 0 uwag) oraz `qa-html-deck.mjs` na pliku po `inline-assets.mjs` (oczekiwane: kod 0). Sam szablon bez gór i portretu ma dalej kończyć QA kodem 1 przez brak plików.
