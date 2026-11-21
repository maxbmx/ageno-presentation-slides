---
name: ageno-presentation
description: Tworzy prezentacje Ageno jako jeden samodzielny plik HTML ze slajdami 16:9 na siatce 8 / 32 px, ze zrzutami ekranu stron i aplikacji, na podstawie dostarczonych materiałów (brief, notatki, raporty, dane, oferta, linki, logo). Użyj zawsze, gdy użytkownik prosi o prezentację, slajdy, deck, pitch dla klienta, prezentację oferty, wdrożenia, audytu lub wyników, chce zamienić notatki albo raport na slajdy, pokazać screeny sklepu lub aplikacji na slajdach, dodać zdjęcie na slajd, chce wersję PDF decku, pokazać harmonogram projektu, warianty, zakres, wycenę, case study, ryzyka, role, decyzje lub opinie klientów, albo poprawia istniejący deck z atrybutami data-slide / data-grid, nawet jeśli nie użyje słowa „HTML”.
metadata:
  author: Ageno
  version: "2.2.0"
  output: standalone-html
---

# Prezentacja Ageno w HTML

Prezentacja ma pomóc odbiorcy zrozumieć temat i podjąć decyzję. Kolejność jest stała:
**źródła → plan → screeny → slajdy → kontrola**. Nie zaczynaj od kodu: dobrze ułożony deck
z błędną tezą jest gorszy niż brak decku.

## Zasady nadrzędne

1. **Źródła przed narracją.** Nie wymyślaj liczb, cytatów, klientów, wyników, funkcji ani decyzji.
   Luki i sprzeczności oznacz.
2. **Jeden slajd, jedna teza.** Tytuł slajdu to wniosek, nie temat.
3. **Jeden plik.** Wynik działa lokalnie bez sieci: CSS, JS, screeny i logo są w środku.
   Bez CDN, `@import` i zewnętrznych fontów.
4. **Siatka 32 px.** Każda krawędź bloku i każdy wiersz tekstu leży na kratce. Kratka w tle
   jest ukryta, ale układ i tak musi do niej pasować: `G` ją pokazuje, audyt ją sprawdza.
5. **Sprawdzaj, nie deklaruj.** Renderuj i audytuj wszystkie slajdy przed oddaniem.
6. **Daty zawsze YYYY-MM-DD.** Na slajdach, w źródłach, nazwach plików i folderów; okres
   jako zakres `2026-10-01 – 2026-10-31`. Szczegóły: `references/redakcja.md`.
7. **Brzmienie jak materiał konsultingowy dla zarządu.** Neutralnie, konkretnie, bez „my”
   i bez wzorców typowych dla AI. Zasady: `references/redakcja.md` (S1–S7, reguły 3–35),
   kontrola: `scripts/text-lint.mjs`.

## Pliki skilla

| Plik | Co zawiera | Kiedy czytać |
| --- | --- | --- |
| `assets/ageno-logo.svg` | Oryginalne logo Ageno (już wstawione w szablon) | Gdy logo trzeba wstawić gdzie indziej |
| `assets/template.html` | Gotowy deck: tokeny, siatka, wszystkie 24 układy slajdów jako przykłady, skalowanie, nawigacja, snap, tryb diagnostyczny, druk do PDF | Zawsze: kopiuj jako start |
| `references/redakcja.md` | Język decku: styl (S1–S7), wzorce do usunięcia (reguły 3–35, stałe numery), daty, korekta | Krok 5 przy pisaniu tekstów i krok 6 |
| `references/ageno.md` | Fakty o Ageno: marka i grafiki, liczby, klienci i logotypy, realizacje, opinie, oferta, słownik, poufność; z mapą, który układ z nich korzysta | Krok 1 i przy każdym slajdzie o Ageno |
| `references/tresc.md` | Rejestr źródeł, narracja, tytuły, gęstość | Krok 2–3 |
| `references/siatka.md` | Płótno 1536 × 864, kolumny, budżet wysokości, typografia, lista punktów, kolory, błędy, decyzje projektowe | Przed układaniem slajdów |
| `references/uklady.md` | Katalog 24 układów (numer slajdu w szablonie, kiedy użyć, wysokość), zasady każdego układu, karta, tło | Krok 3 (wybór układu) i 5 |
| `references/screeny.md` | Ramki screenów, `screens.json`, zasady zrzutów i osadzania | Gdy deck ma screeny |
| `references/zdjecia.md` | Wyjątek dla zdjęć z Unsplash, dobór zdjęć górskich, pobieranie, podpis autora | Gdy deck ma slajd „Zdjęcie + treść” |
| `references/nawigacja.md` | Kontrakt DOM, sterowanie, druk do PDF | Przed zmianą skryptu lub struktury, przy PDF |
| `references/qa.md` | Procedura i lista kontrolna | Krok 6 |
| `scripts/screenshots.mjs` | Zrzuty Playwright w proporcjach ramek | Krok 4 |
| `scripts/ageno-assets.mjs` | Pobiera z ageno.pl góry (slajd tytułowy i kontaktowy), logotypy klientów i zdjęcia osób (bez zmian w plikach) | Krok 4 |
| `scripts/photos.mjs` | Pobiera wybrane zdjęcia z Unsplash w kadrze 752 × 864 (2×) | Krok 4 |
| `scripts/inline-assets.mjs` | Osadza lokalne obrazy; kod 1 przy obrazie `http(s)`, nieznanym typie, braku pliku i ponad 15 MB | Krok 5 |
| `scripts/grid-audit.mjs` | Audyt siatki każdego slajdu | Krok 6 |
| `scripts/text-lint.mjs` | Kontrola tekstu slajdów według `redakcja.md` | Krok 6 |
| `scripts/qa-html-deck.mjs` | Nawigacja, przepełnienia, zrzuty w 4 rozdzielczościach | Krok 6 |

Skrypty wymagają Node 18+; `screenshots.mjs`, `grid-audit.mjs`, `text-lint.mjs` i `qa-html-deck.mjs` także Playwrighta
(raz: `npm install && npx playwright install chromium`, wersja w `package.json`).

## Workflow

### 1. Wejście

Zbierz: cel i odbiorcę (wymagane), materiały źródłowe (wymagane), listę ekranów do pokazania,
logo klienta, jeśli ma być w decku (oryginalny plik od użytkownika), język (domyślnie polski). Brakujące rzeczy, które da
się bezpiecznie założyć, załóż i wypisz. Pytaj tylko o to, bez czego prezentacja byłaby
błędna, i zadawaj jedno pytanie naraz.

Fakty o Ageno (liczby, realizacje, logotypy, nazwy usług) bierz tylko z `references/ageno.md`.
Pozycji oznaczonej **[uzupełnić]** nie zgaduj: zapytaj albo pomiń.

### 2. Rejestr źródeł

Przeczytaj wszystkie materiały i rozdziel fakty, decyzje, opinie, hipotezy, rekomendacje,
braki i sprzeczności. Szczegóły: `references/tresc.md`.

### 3. Plan slajdów

Tabela: nr, rola, teza, dowód, układ, screen. Dla każdego slajdu zsumuj wysokości elementów
(budżet 704 px, `references/siatka.md`). Nie mieści się = podziel slajd. Przy decku dłuższym
niż kilka slajdów albo niejasnych źródłach pokaż plan użytkownikowi przed kodem.

### 4. Screeny i zdjęcia

Każdemu screenowi z planu przypisz ramkę (`full`, `wide`, `half`, `mobile`) i zrób zrzut
w jej proporcjach (`scripts/screenshots.mjs`) albo użyj plików użytkownika.
Szczegóły: `references/screeny.md`.

Grafiki Ageno do każdego decku: `node scripts/ageno-assets.mjs --out decks/…/` pobiera
`ageno-mountains.svg` (slajd tytułowy i kontaktowy), logotypy klientów do `logos/` z listą
`logos.json` (slajd „Klienci Ageno”) i zdjęcia osób do `people/` (slajd „Kontakt”).

Slajdom „Zdjęcie + treść” sam dobierz pasujące zdjęcie górskie z Unsplash (klimat Ageno),
chyba że użytkownik poda własne, i pobierz je `scripts/photos.mjs`. Zdjęcia ze stocku
tylko w tym układzie, zawsze z podpisem `@autor`. Szczegóły: `references/zdjecia.md`.

### 5. Slajdy

1. Skopiuj `assets/template.html` jako `index.html` decku. Slajd tytułowy zostaw i zmień tylko
   jego teksty (logo Ageno zostaje). Dalsze slajdy buduj z przykładowych układów: kopiuj potrzebny
   slajd, wypełnij treścią, nieużyte przykłady usuń. Style i skrypt zostaw.
2. Buduj slajdy z klas szablonu (`.stack`, `.grid-2`, `.grid-3`, `.grid-1-2`, `.card`, `.facts`, `.table`,
   `.gantt`, `.photo`, `.shot-*`, `.mt-*`).
   Nowego CSS dodawaj jak najmniej i tylko z tokenami.
3. Każdy blok układu oznacz `data-grid="32"` (wnętrza o szerokości z siatki 8 px: `data-grid="8"`;
   zdjęcie `.photo` dochodzące do krawędzi slajdu: `data-grid="32y"`, tylko pion),
   a blok o zmiennej wysokości także `data-snap`. Opis: `references/siatka.md`, sekcja „Oznaczenia”.
4. Slajd tytułowy i slajd „Kontakt” zawsze z dużym logo Ageno (blok `.brand-logo` z szablonu,
   zostaw bez zmian). Stopka: małe logo Ageno wstawia skrypt na każdym slajdzie bez `.brand-logo`
   (na tytułowym i kontaktowym go nie ma), ty wpisujesz źródło lub opis screenu w `data-source`,
   numer też wypełnia skrypt. Logo klienta (jeśli jest) na slajdzie tytułowym po prawej.
5. Tło każdego slajdu zawsze `#f7f7f7`, kolory z logo Ageno (tekst `#231430`, akcent `#ff6b00`). Marka klienta: zmień tylko kolor tekstu i akcentu
   (`--c-text`, `--c-accent`, `--c-on-accent`, `--c-muted`). Tła i geometrii nie ruszaj.
6. Uzupełnij `<title>` i `aria-label` prezentacji. Zredaguj wszystkie teksty według
   `references/redakcja.md`.
7. Złóż jeden plik: `node scripts/inline-assets.mjs decks/…/index.html --out dist/YYYY-MM-DD-klient-temat.html`.
   Do wysłania nadaje się tylko wynik z kodem 0. Kody wyjścia wszystkich skryptów (0 bez problemu,
   1 problem znaleziony, 2 złe wywołanie): `README.md`, sekcja „Umowa CLI”.

### 6. Kontrola

Uruchom `grid-audit.mjs`, `text-lint.mjs` i `qa-html-deck.mjs`, sprawdź PDF, obejrzyj zrzut każdego slajdu, przejdź listę
w `references/qa.md`. Po każdej poprawce sprawdź slajd i sąsiadów, po ostatniej zmianie całość.

### 7. Przekazanie

Podaj krótko:
1. plik HTML i liczbę slajdów,
2. sterowanie: strzałki, `F` pełny ekran, `G` siatka; PDF: Chrome → Drukuj → Zapisz jako PDF
   (strona 16:9, jeden slajd = jedna strona),
3. jakie testy faktycznie wykonano i w jakich rozdzielczościach,
4. założenia, luki w danych, zasłonięte dane, rzeczy niezweryfikowane.

## Logo

- **Logo Ageno, duże** (blok `.brand-logo`) jest zawsze na slajdzie tytułowym i na ostatnim
  slajdzie „Kontakt”: lewy górny róg kontenera, wysokość 64 px, ramka 208 × 64. Na innych
  slajdach dużego logo nie wstawiaj.
- **Logo Ageno, małe** (24 px, `.footer-logo`) stoi w stopce przed źródłem na każdym slajdzie,
  który nie ma `.brand-logo`; wstawia je skrypt szablonu. Slajd z dużym logo nie ma małego.
- Logo jest zdefiniowane raz w szablonie (`<symbol id="ageno-logo">`) i używane przez `<use>`;
  oryginał: `assets/ageno-logo.svg`. Nie usuwaj go, nie przesuwaj i nie zmieniaj kolorów
  (#ff6b00, #231430), także w prezentacji w marce klienta.
- **Logo klienta** dostarcza użytkownik przy danej prezentacji; skill go nie przechowuje.
  Miejsce: slajd tytułowy, ten sam wiersz co logo Ageno, wyrównane do prawej
  (`.title-client-logo`, wysokość 64 px), oraz układ „Case study”.
  Używaj dokładnie tego pliku (najlepiej SVG): bez odrysowywania, zmiany proporcji i kolorów.
  Brak logo klienta = wariant bez niego, nie tekstowe pseudo-logo, i nie szukaj go w sieci bez zgody.
- Wstawiając SVG do HTML, nadaj identyfikatorom w środku (`clipPath`, gradienty) unikalne nazwy,
  żeby dwa loga się nie gryzły.

## Struktura projektu prezentacji

```
decks/2026-11-16-klient-temat/
├── brief.md        ← cel, odbiorca, rejestr źródeł, plan slajdów
├── screens.json    ← lista zrzutów
├── photos.json     ← wybrane zdjęcia z Unsplash
├── ageno-mountains.svg ← góry Ageno na slajd tytułowy
├── logos/, logos.json  ← logotypy klientów z ageno.pl
├── people/         ← zdjęcia osób na slajd kontaktowy
├── screens/        ← zrzuty, zdjęcia i logo klienta
├── index.html      ← deck z szablonu, obrazy jako ścieżki
└── qa/             ← zrzuty i raporty QA
dist/2026-11-16-klient-temat.html   ← jeden plik do wysłania
```

Gdy pracujesz bez systemu plików użytkownika (np. w czacie), dostarcz od razu jeden plik HTML
z obrazami osadzonymi jako data URI.
