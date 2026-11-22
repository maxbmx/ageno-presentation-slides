# Siatka 8 / 32 px na slajdzie

System pochodzi ze strony maksymilian.sleziak.com i jest przeniesiony na płótno slajdu.
Sedno: **każda krawędź bloku i każdy wiersz tekstu leży na kratce 32 px**. Kratka w tle jest
domyślnie ukryta (`--grid-line: transparent`), ale rytm i tak ją zdradza: błąd o 8 px widać
w nierównych odstępach. Dlatego reguły są ścisłe i sprawdza je `scripts/grid-audit.mjs`.

## Płótno

Slajd ma stały rozmiar **1536 × 864 px** (16:9, 48 × 27 kratek). Skrypt w szablonie skaluje całe
płótno do okna (`transform: scale()`), wolne pola wypełnia kolor tła. Dzięki temu wszystkie
wymiary w slajdzie są w px logicznych i nie ma progów responsywnych.

| Strefa | X | Y | Rozmiar |
| --- | --- | --- | --- |
| Kontener treści `.container` | 112 → 1424 | 64 → 768 | 1312 × 704 (41 × 22 kratki) |
| Stopka `.slide-footer` | 112 → 1424 | 800 → 832 | jeden wiersz 32 px; małe logo 24 px na y = 804 |
| Strzałki nawigacji | marginesy 0–112 i 1424–1536 | środek wysokości | poza treścią |

Początek współrzędnych: **X = lewa krawędź kontenera (112), Y = góra slajdu (0)**.

Te same liczby dla skryptów są w `scripts/constants.mjs` (płótno, kontener, stopka, budżet,
siatka, ramki screenów, skala, jakość JPEG). Zmiana liczby tutaj bez zmiany tam, i odwrotnie, jest błędem.

## Kolumny

Szerokość kontenera spełnia `W = 2C₂ + G = 3C₃ + 2G` dla `G = 32`, więc dzieli się
na 2 i 3 kolumny z siatki.

| Token / klasa | Szerokość | Kratki | Użycie |
| --- | --- | --- | --- |
| `--w` | 1312 | 41 | cała szerokość |
| `.grid-2` → `--col-2` | 640 | 20 | dwie kolumny |
| `.grid-3` → `--col-3` | 416 | 13 | trzy kolumny, liczby, kroki |
| `.grid-1-2` / `.grid-2-1` | 416 + 864 | 13 + 27 | tekst + screen |
| `.w-2of3` | 864 | 27 | węższa kolumna tekstu (tytułowy, rekomendacja) |

Kolumny tylko tokenami. `1fr`, procenty i `gap` spoza tokenów dają szerokości poza siatką.

## Pion

- Odstęp między blokami: 32 px (`.stack`), większe: `.mt-64`, `.mt-96`, `.mt-128`, `.mt-192`.
- 8, 16, 24, 48 px w pionie tylko jako dopełnienie symetryczne, które z wierszem daje pełne
  kratki (np. karta: 32 + treść + 32).
- Blok o wysokości zależnej od treści (kolumna tekstu, grupa, zdjęcie o naturalnych
  proporcjach) dostaje `data-snap`: skrypt dosuwa jego wysokość w górę do 32 px przez
  `margin-bottom`. To siatka bezpieczeństwa, nie sposób układania.

### Budżet wysokości kontenera (704 px)

| Element | Wysokość |
| --- | --- |
| Teza 1 / 2 wiersze | 64 / 128 |
| Odstęp | 32 |
| Screen wide | 544 |
| Screen half + podpis | 416 + 32 |
| Screen full | 608 (tylko z tezą 1-wierszową: 64 + 32 + 608 = 704) |
| Liczba + 2 wiersze opisu | 64 + 64 |

Zsumuj przed kodowaniem. Przekroczenie 704 = podziel slajd.

## Ramki screenów

Screen stoi w jednej z czterech ramek. Zrzut robi się w viewporcie o tych samych proporcjach,
z `deviceScaleFactor: 2` (ostry obraz także na projektorze 4K), zapis JPEG o jakości 80
(ta sama wartość dla zdjęć z Unsplash). Zrzuty i osadzanie: `references/screeny.md`.

| Ramka (`frame`) | Klasa | Wymiar na slajdzie | Viewport zrzutu | Do czego |
| --- | --- | --- | --- | --- |
| `full` | `.shot-full` | 1312 × 608 | 1312 × 608 | pełny ekran desktop |
| `wide` | `.shot-wide` | 864 × 544 | 1296 × 816 | screen obok tekstu |
| `half` | `.shot-half` | 640 × 416 | 1280 × 832 | dwa screeny obok siebie |
| `mobile` | `.shot-mobile` | 320 × 640 | 400 × 800 | telefon w kolumnie 416 |

Zdjęcie w układzie „Zdjęcie + treść”: ramka 752 × 864, plik 1504 × 1728 (2×).

## Typografia

Interlinia to zawsze 32 albo 64 px. Rozmiar dobiera się do interlinii, nigdy odwrotnie.

| Klasa / element | Rozmiar / interlinia | Uwagi |
| --- | --- | --- |
| `.title` (h1) | 56 / 64 | slajd tytułowy, −0.033em |
| `h2` (teza) | 40 / 64 | maks. 2 wiersze, −0.03em |
| `.number` | 56 / 64 | cyfry tabelaryczne |
| `.lead` | 24 / 32 | podtytuł |
| `h3` | 24 / 32 | śródtytuł |
| `p`, `li` | 20 / 32 | tekst |
| `.caption`, `.small` | 16 / 32 | podpisy, opisy liczb |
| `.eyebrow` | 16 / 32 | wersaliki, +0.145em, kolor przygaszony |
| `.meta`, stopka | 14 / 32 | monospace |

- Tylko fonty systemowe (`--font-sans`, `--font-mono`). Bez `@import`, Google Fonts i plików.
- Monospace tylko w metadanych, numerach i krótkich etykietach technicznych.
- `strong` ma `line-height: 1` i `0.9em`, żeby nie rozpychał wiersza.
- Nowy rozmiar = para rozmiar / interlinia z interlinią 32 lub 64. Tekst mniejszy niż 16 px
  na slajdzie jest za mały.

## Lista punktów

`.points`: znacznik to kwadrat 8 × 8 px w kolorze akcentu, na środku pierwszej kratki 32 × 32
(po 12 px odstępu z każdej strony, w poziomie i w pionie). Tekst zaczyna się od następnej
kratki (`padding-left: 32px`), każdy punkt to wiersz 32 px. Nie używaj zwykłych kropek
`list-style` ani znaków typu „•” w tekście.

## Kolory

| Token | Wartość | Użycie |
| --- | --- | --- |
| `--c-bg` | `#f7f7f7` | tło każdego slajdu i wolnych pól okna, zawsze |
| `--c-card` | `#ffffff` | karta, tło pod screenem, co drugi wiersz tabeli |
| (biały) | `#ffffff` | tylko podpis autora i strzałka nawigacji na zdjęciu |
| `--c-text` | `#231430` | tekst, ciemny fiolet z logo Ageno |
| `--c-muted` | `#5e5b52` | tylko nadtytuły, metadane, stopka |
| `--c-accent` | `#ff6b00` | pomarańcz z logo Ageno, jeden akcent: `.mark` przy kluczowej liczbie, znaczniki listy, kluczowy etap harmonogramu |
| `--c-bar` | `#e2ddca` | zwykłe paski harmonogramu |
| `--c-on-accent` | `#231430` | tekst na akcencie (kontrast 6:1; biały na pomarańczu jest nieczytelny) |
| `--grid-line` | `transparent` | kratka w tle, domyślnie ukryta; pokazanie: `rgb(70 130 220 / 0.1)` |

Tło całej prezentacji jest zawsze `#f7f7f7`: bez pasów, kolorowych i ciemnych teł slajdu.
Prezentacja w marce klienta: podmień tekst i akcent (`--c-text`, `--c-accent`, `--c-on-accent`,
`--c-muted`) z jego brandbooka. Tła i wymiarów nie ruszaj.

## Logo

- **Logo Ageno, duże** (`.brand-logo`, `data-grid="8"`): ramka 208 × 64, logo wysokości 64 px,
  lewy górny róg kontenera. Zawsze na slajdzie tytułowym i na ostatnim slajdzie „Kontakt”,
  na innych slajdach nie.
- **Logo Ageno, małe** (`.footer-logo`, 24 px): w stopce przed źródłem na każdym slajdzie bez
  `.brand-logo`; wstawia je skrypt szablonu. Slajd z dużym logo nie ma małego.
- Logo jest zdefiniowane raz w szablonie (`<symbol id="ageno-logo">`) i używane przez `<use>`;
  oryginał: `assets/ageno-logo.svg`. Nie usuwaj go, nie przesuwaj i nie zmieniaj kolorów
  (`#ff6b00`, `#231430`), także w prezentacji w marce klienta.
- **Logo klienta** dostarcza użytkownik przy danej prezentacji; skill go nie przechowuje.
  Miejsce: slajd tytułowy, ten sam wiersz co logo Ageno, wyrównane do prawej
  (`.title-client-logo`, wysokość 64 px, maks. 416 px szerokości), oraz układ „Case study”.
  Używaj dokładnie tego pliku (najlepiej SVG): bez odrysowywania, zmiany proporcji i kolorów.
  Brak logo klienta = wariant bez niego, nie tekstowe pseudo-logo; nie szukaj go w sieci bez zgody.
- Wstawiając SVG do HTML, nadaj identyfikatorom w środku (`clipPath`, gradienty) unikalne nazwy,
  żeby dwa loga się nie gryzły.

### Wyjątek: małe logo w stopce

Małe logo stoi pośrodku wiersza stopki 32 px (`align-items: center`): góra na y = 804, dół
na y = 828, po 4 px odstępu z każdej strony. To jedyny element poza kratką 32 px; wiersz stopki
(800 → 832) zostaje na siatce. Logo nie ma `data-grid` i audyt go nie mierzy. Nie zmieniaj jego
wysokości ani nie wyrównuj go do kratki.

## Czego nie robić

- Ramek, linii podziału, cieni i zaokrągleń pudełek. Na slajdzie nie ma żadnych linii, bo
  obramowanie 1 px dodaje piksel i spycha blok z siatki. Jedyny wyjątek: `.shot-edge` przy
  jasnym screenie zlewającym się z tłem (`outline`, nie zmienia wymiaru). Jedyne zaokrąglenie: portret
  w kole na slajdzie „Kontakt”.
- Gradientów, stockowych zdjęć i ilustracji, grafik generowanych, ozdobnych ikon, kilku akcentów.
  Jedyny wyjątek: zdjęcie górskie z Unsplash w układzie „Zdjęcie + treść” (`references/zdjecia.md`).
- Wielkich nagłówków dla wypełnienia miejsca. Wolna przestrzeń jest w porządku.

## Oznaczenia

| Atrybut | Znaczenie |
| --- | --- |
| `data-grid="32"` | X, Y, szerokość, wysokość na 32 px |
| `data-grid="8"` | X i szerokość na 8 px, Y i wysokość na 32 px |
| `data-grid="32y"` | tylko Y i wysokość na 32 px; X i szerokości audyt nie sprawdza |
| `data-snap` | wysokość dosuwana do 32 px |
| `.bleed` / `data-bleed` | warstwa z grafiką celowo wychodzącą poza slajd; audyt pomija ją przy kontroli przewijania |

`data-grid="32y"` jest tylko dla bloków, które dochodzą do krawędzi slajdu i dlatego nie mogą
mieć X i szerokości z siatki kontenera. W szablonie to zdjęcie `.photo` w układzie
„Zdjęcie + treść” (slajdy 15–16): 752 × 864, w px slajdu od x = 784 do prawej krawędzi slajdu albo od lewej
krawędzi do x = 752 (wewnętrzna krawędź na linii siatki). Pion zostaje na kratce. Zwykłych bloków w kontenerze tak nie oznaczaj: zgub X i szerokość
z audytu, a błąd o 8 px przejdzie niezauważony.

Wiersze tekstu (`h1–h3`, `p`, `li`, `figcaption`, `blockquote`, `dt`, `dd`) audyt sprawdza bez
oznaczenia. Tryb diagnostyczny: klawisz `G` albo adres `#siatka`.


## Najczęstsze błędy

| Objaw | Przyczyna | Poprawka |
| --- | --- | --- |
| Wszystko pod blokiem przesunięte o 8–24 px | pionowy odstęp spoza 32 / 64 | `.stack`, `.mt-*` |
| Wiersz ma 33–36 px | wstawka innym krojem albo ikona w wierszu | `line-height: 1`, ikona jako osobny element |
| Blok o 1–2 px za wysoki | `border` | usuń, ewentualnie `outline` |
| Kolumny ułamkowe | `1fr`, procenty | klasy `.grid-*` i tokeny |
| Treść poniżej y = 768 | przekroczony budżet 704 px | skróć albo podziel slajd |
| Teza w 3 wierszach | za długie zdanie | skróć tezę, nie zmniejszaj fontu |
| Pomiar w JS „nie pasuje” | `getBoundingClientRect()` po `scale()` | `offsetHeight` albo podziel przez skalę |

## Decyzje projektowe (nie zmieniać bez zgody użytkownika)

| Decyzja | Powód |
| --- | --- |
| Płótno 1536 × 864 skalowane w całości, bez progów | siatka 32 px zgadza się w każdym oknie |
| Wszystkie teksty bezszeryfowe, monospace tylko w metadanych | czytelność z daleka; serif ze strony osobistej odpada |
| Żadnych linii podziału, ramek i cieni | odstęp i biel wystarczą; linie spychają bloki z siatki |
| Tło każdego slajdu zawsze `#f7f7f7`, bez pasów | spójny wygląd wszystkich prezentacji |
| Kratka w tle ukryta (`--grid-line: transparent`), kod zostaje | czysty slajd; podgląd klawiszem `G` |
| Slajd tytułowy z górami Ageno po lewej, wychodzącymi poza slajd; tekst w kolumnie po prawej | grafika z ageno.pl łączy deck z marką |
| Przedostatni slajd z 10 logotypami klientów z ageno.pl, pliki bez zmian | dowód skali; równe obszary robocze dają równe logotypy |
| Ostatni slajd „Kontakt” z portretem w kole i górami Ageno po prawej | rozmowa kończy się konkretną osobą; koło to kadr zdjęcia, jedyny wyjątek od zakazu zaokrągleń |
| Kolory z logo Ageno: tekst `#231430`, akcent `#ff6b00` | prezentacja rozpoznawalna jako Ageno, spójna z logo |
| Logo Ageno: duże na slajdzie tytułowym i „Kontakt”, małe (24 px) w stopce pozostałych slajdów | prezentacje Ageno zawsze podpisane marką |
| Marka klienta zmienia tylko kolor tekstu i akcentu | geometria, tło i logo Ageno zostają |
| Zdjęcia ze stocku tylko w układzie „Zdjęcie + treść”: górskie, z Unsplash, z podpisem `@autor` | górski klimat Ageno; reszta slajdów zostaje rzeczowa |
| Daty zawsze YYYY-MM-DD, okresy jako zakres dat | jednoznaczne i sortowalne; jedna konwencja we wszystkich deckach |
| Druk do PDF: strona 1536 × 864 (16:9), jeden slajd = jedna strona | PDF wygląda jak prezentacja na ekranie |

