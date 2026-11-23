# Nawigacja i kontrakt HTML

`assets/template.html` już to wszystko implementuje. Ten plik mówi, czego nie zepsuć przy
edycji i jak sprawdzić zachowanie.

## Jeden plik

Wynik to jeden samodzielny plik HTML, który działa lokalnie bez sieci: CSS, JS, screeny,
zdjęcia i logo są w środku. Bez CDN, `@import`, zewnętrznych arkuszy, skryptów i fontów
(tylko fonty systemowe, `references/siatka.md`). Obrazy osadza `scripts/inline-assets.mjs`
(polecenie i kody wyjścia: `README.md`); limit 15 MB. Gdy pracujesz bez systemu plików
użytkownika (np. w czacie), dostarcz od razu jeden plik HTML z obrazami jako data URI.

## Kontrakt DOM (wymagany przez `scripts/qa-html-deck.mjs`)

- kontener: `[data-presentation]`,
- slajd: `[data-slide]` (skrypt dopisuje `data-slide-index` i `aria-label`),
- dokładnie jeden slajd z `.is-active` i `aria-hidden="false"`, pozostałe `aria-hidden="true"`,
- przyciski `button[data-nav="prev"]` i `button[data-nav="next"]` z `aria-label`
  „Poprzedni slajd” / „Następny slajd” w `<nav aria-label="Nawigacja prezentacji">`,
- przycisk na krańcu prezentacji ma `disabled` i jest niewidoczny; nigdy nie usuwaj go z DOM.

## Sterowanie

| Wejście | Działanie |
| --- | --- |
| Strzałka prawa / `ArrowRight` / przesunięcie palcem w lewo | następny slajd |
| Strzałka lewa / `ArrowLeft` / przesunięcie palcem w prawo | poprzedni slajd |
| `F` | pełny ekran (włącz / wyłącz) |
| `Escape` | wyjście z pełnego ekranu (zachowanie przeglądarki) |
| `G` lub adres `#siatka` | tryb diagnostyczny siatki |

- Bez zapętlenia. Na krańcach ruch w niedozwolonym kierunku nic nie robi.
- Klawisze nie działają w polach edycyjnych i gdy zdarzenie ma `defaultPrevented`.
- Szybkie kliknięcia: kolejne wejście kończy bieżące przejście i przechodzi o jeden slajd.
  Slajdy się nie nakładają, a żadne naciśnięcie nie przepada ani nie przeskakuje dwóch slajdów.
- Gest: próg 50 px, ruch poziomy wyraźnie większy niż pionowy, gesty na kontrolkach ignorowane.

## Strzałki

- Domyślnie `opacity: 0`. Pokazują się po ruchu myszy albo najechaniu na strzałkę, znikają
  po 2 s bezczynności (`HIDE_AFTER = 2000` w szablonie, `NAV.hideAfterMs` w `scripts/constants.mjs`).
- Zostają widoczne przy hoverze i fokusie klawiatury.
- Przycisk 64 × 64 px w marginesie slajdu, symbol 24 px na okrągłym tle (`border-radius: 50%`,
  `--c-nav-bg`, lekkie przyciemnienie), bez ramki i cienia. Po najechaniu tło ciemniejsze
  (`--c-nav-hover`). Na zdjęciu strzałka biała na jasnym półprzezroczystym kole.
- Na ekranach dotykowych (`hover: none`) są półprzezroczyste, bo nie ma hovera.

## Przejście

- 200 ms, `transform` + `opacity`. Do przodu: stary slajd w lewo i zanika, nowy wchodzi z prawej.
  Do tyłu odwrotnie. Przesunięcie 48 px.
- `prefers-reduced-motion: reduce`: sam krótki zanik, bez ruchu.
- Bez 3D, obrotów, skalowania i animacji elementów wewnątrz slajdu.

## Skalowanie i pełny ekran

- `scale = min(szerokość okna / 1536, wysokość okna / 864)`, liczone przy `resize`
  i `fullscreenchange`. Wolne pola okna wokół slajdu są czarne (`--c-letterbox`, `#000000`), sam slajd ma tło `--c-bg`
  i nigdy nie jest rozciągany. W druku czarnych pól nie ma.
- Żądanie pełnego ekranu może się nie udać (ograniczenia przeglądarki): błąd jest wyciszony.
- Brak przewijania strony i slajdu (poza drukiem).

## Druk i PDF

Styl `@media print` w szablonie zamienia deck w dokument do druku:

- `@page { size: 1536px 864px; margin: 0; }`: każda strona ma 16:9 (w PDF 16 × 9 cali),
- każdy slajd to osobna strona (`break-after: page`), ostatni bez pustej strony po nim,
- bez skalowania, przejść, strzałek i nakładek trybu `G`; wszystkie slajdy widoczne,
- tło `#f7f7f7` drukuje się dzięki `print-color-adjust: exact`,
- tekst w PDF zostaje tekstem, logo jest wektorowe.

Zapis: Chrome lub Edge → Drukuj (`Cmd/Ctrl + P`) → Zapisz jako PDF. Safari może zignorować
rozmiar strony i dać A4; wtedy Chrome albo `scripts/pdf.mjs` (polecenie: `README.md`, „Kontrola”). Nie dodawaj
przycisku „Pobierz PDF” na slajdach.

## Czego nie dodawać

Szarej ramy wokół slajdu, cieni, stałego paska narzędzi, licznika poza stopką, miniatur,
spisu treści, przycisków przypominających CTA. Nie dodawaj zewnętrznych bibliotek.
