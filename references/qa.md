# Kontrola jakości

Kolejność: automat → oględziny zrzutów → poprawka → ponownie całość. Nie pisz, że coś
sprawdzono, jeśli tego nie zrobiono.

## 1. Automat

```bash
npm install && npx playwright install chromium   # raz (wersja Playwrighta z package.json)
node scripts/grid-audit.mjs dist/prezentacja.html
node scripts/text-lint.mjs dist/prezentacja.html
node scripts/qa-html-deck.mjs dist/prezentacja.html --out decks/…/qa
```

- `grid-audit.mjs`: każdy slajd w px płótna (okno 1536 × 864): pozycje i wymiary `data-grid`,
  wiersze tekstu, interlinie, granice kontenera, stopka na y = 800, przewijanie.
- `text-lint.mjs`: widoczny tekst każdego slajdu według `references/redakcja.md` (słownictwo,
  myślniki, nawiasy, dwukropki w tytułach, cudzysłowy, wycinek „my”, daty, kalki); błędy i uwagi.
  Sprawdza tylko część reguł, lista: `references/redakcja.md`, sekcja „Kontrola automatyczna”.
- `qa-html-deck.mjs`: 1600×900, 1366×768, 1280×720, 1280×800: przepełnienia, nawigacja,
  autoukrywanie strzałek, krańce, błędy konsoli, zrzut każdego slajdu.

Kod 0 = bez problemu, 1 = problem do poprawienia, 2 = złe wywołanie (popraw polecenie, nie deck).
Umowa CLI: `README.md`.

PDF (ten sam wynik co „Zapisz jako PDF” w Chrome):

```bash
node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+require('path').resolve('dist/prezentacja.html'));await p.pdf({path:'dist/prezentacja.pdf',preferCSSPageSize:true,printBackground:true});await b.close()})()"
```

Brak Playwrighta: powiedz o tym wprost i opisz, co sprawdzono inaczej.

## 2. Oględziny każdego zrzutu

- [ ] Brak uciętego tekstu i elementów, brak kolizji, stopka nie dotyka treści.
- [ ] Teza w maks. 2 wierszach, bez sierotek, wdów i dziwnych złamań (`references/redakcja.md`, sekcja „Sierotki”).
- [ ] Screeny ostre, właściwy fragment widoczny, nic ważnego nie ucięte.
- [ ] Jeden akcent na slajd, hierarchia czytelna z daleka.
- [ ] Slajd tytułowy ma duże logo Ageno w lewym górnym rogu, w oryginalnych kolorach,
      i góry Ageno po lewej, przycięte krawędzią slajdu (nie zaślepkę „brak ageno-mountains.svg”).
- [ ] Slajd „Klienci Ageno”: logotypy z ageno.pl bez zmian, równe, 2 pełne wiersze po 5.
- [ ] Ostatni slajd „Kontakt”: duże logo Ageno w lewym górnym rogu, prawdziwe zdjęcie (nie zaślepka „brak zdjęcia”), e-mail i telefon
      z `references/ageno.md`, linki `mailto:` i `tel:` działają, góry po prawej.
- [ ] Każdy slajd poza tytułowym i „Kontakt” ma małe logo Ageno w stopce, także w PDF;
      slajdy tytułowy i „Kontakt” mają duże logo i nie mają małego.
- [ ] Logo klienta (jeśli jest) na slajdzie tytułowym po prawej, oryginalne, nie zniekształcone.
- [ ] Zdjęcia tylko w układzie „Zdjęcie + treść”: górskie, z licencją Unsplash License (nie Unsplash+),
      zgodne z kryteriami z `references/zdjecia.md`, każde inne.
- [ ] Podpis `@autor` na każdym zdjęciu, czytelny, z linkiem do profilu autora; `alt` opisuje zdjęcie.
- [ ] Wolne pola przy innych proporcjach okna mają kolor tła.
- [ ] Tryb `G`: bloki na liniach kratki.

## 3. PDF

- [ ] Liczba stron = liczba slajdów, bez pustej strony na końcu.
- [ ] Każda strona 16:9 (16 × 9 cali), bez marginesów.
- [ ] Szare tło na każdej stronie, brak strzałek i nakładek siatki.
- [ ] Układ identyczny jak na ekranie, nic nie ucięte.

## 4. Treść

- [ ] Każda liczba: wartość, jednostka, okres, kontekst, źródło.
- [ ] Cytaty wierne, z atrybucją.
- [ ] Fakty, opinie, hipotezy, prognozy, rekomendacje rozróżnione.
- [ ] Sprzeczności i braki pokazane, nie uzupełnione po cichu.
- [ ] Wnioski nie wykraczają poza źródła; research zewnętrzny oznaczony.
- [ ] Każdy slajd ma jedną tezę.

## 5. Redakcja

- [ ] Polskie znaki, odmiana nazw, interpunkcja, skróty.
- [ ] Bez przypadkowych angielskich etykiet.
- [ ] Wszystkie daty w formacie YYYY-MM-DD, okresy jako zakres; nazwa pliku też.
- [ ] Podpisy, stopki, źródła, `alt` i `<title>` też poprawione.
- [ ] Bez sloganów i tekstu dodanego dla wypełnienia.
- [ ] `text-lint.mjs` bez błędów; każda uwaga oceniona.
- [ ] Cały deck przeczytany pod kątem `references/redakcja.md`, zwłaszcza tego, czego skrypt
      nie sprawdza (tabela w sekcji „Kontrola automatyczna”): reguły 3, 4, 8, 9, 13, 14, 15,
      18, 19, 22, 24, 25, 26, 27, 29, 30; S1, S2, S4–S7 i S3 poza listą czasowników;
      reguła 12 w treści (skrypt patrzy tylko na nagłówki); `alt`, `<title>`, `aria-label`
      (plan opisany jako plan, jedna nazwa dla jednej rzeczy, konkret zamiast ogólników).

## 6. Interakcje (ręcznie, jeśli automat ich nie obejmuje)

- [ ] Gesty dotykowe w obie strony, tapnięcie nie przełącza.
- [ ] `F` włącza i wyłącza pełny ekran, skala się przelicza.
- [ ] `prefers-reduced-motion` ogranicza ruch.
- [ ] Fokus klawiatury widoczny na strzałkach.

## 7. Regresja i przekazanie

- [ ] Po każdej poprawce: ten slajd i sąsiednie; po ostatniej zmianie: całość od nowa.
- [ ] Plik działa otwarty lokalnie, bez sieci (`inline-assets.mjs` zakończony kodem 0: brak obrazów
      `http(s)`, nieznanych typów, brakujących plików i przekroczenia 15 MB).
- [ ] Rozmiar poniżej 15 MB.
- [ ] Brak błędów w konsoli.
