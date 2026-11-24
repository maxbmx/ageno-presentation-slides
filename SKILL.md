---
name: ageno-presentation
description: Tworzy prezentacje Ageno jako jeden samodzielny plik HTML ze slajdami 16:9 na siatce 8 / 32 px, ze zrzutami ekranu stron i aplikacji, na podstawie dostarczonych materiałów (brief, notatki, raporty, dane, oferta, linki, logo). Użyj zawsze, gdy użytkownik prosi o prezentację, slajdy, deck, pitch dla klienta, prezentację oferty, wdrożenia, audytu lub wyników, chce zamienić notatki albo raport na slajdy, pokazać screeny sklepu lub aplikacji na slajdach, dodać zdjęcie na slajd, chce wersję PDF decku, pokazać harmonogram projektu, warianty, zakres, wycenę, case study, ryzyka, role, decyzje lub opinie klientów, albo poprawia istniejący deck z atrybutami data-slide / data-grid, nawet jeśli nie użyje słowa „HTML”.
metadata:
  author: Ageno
  version: "2.3.0"
  output: standalone-html
---

# Prezentacja Ageno w HTML

Prezentacja ma pomóc odbiorcy zrozumieć temat i podjąć decyzję. Kolejność jest stała:
**źródła → plan → screeny → slajdy → kontrola**. Nie zaczynaj od kodu: dobrze ułożony deck
z błędną tezą jest gorszy niż brak decku. Szczegóły są w plikach z tabeli niżej; ten plik ich
nie powtarza, więc w każdym kroku otwórz wskazany plik.

## Czego nie wolno złamać

1. **Źródła przed narracją.** Nie wymyślaj liczb, cytatów, klientów, wyników, funkcji ani decyzji;
   luki i sprzeczności oznacz (`references/tresc.md`). Fakty o Ageno tylko z `references/ageno.md`.
2. **Jeden slajd, jedna teza.** Tytuł slajdu to wniosek, nie temat, w formie hasła do 5 słów;
   szczegół idzie do leadu albo treści (`references/tresc.md`).
3. **Jeden plik HTML, działa bez sieci** (`references/nawigacja.md`, „Jeden plik”).
4. **Siatka 32 px na płótnie 1536 × 864**: każda krawędź bloku i każdy wiersz na kratce
   (`references/siatka.md`); tekst ciągły najwyżej 864 px szerokości, nigdy na cały slajd
   (`references/siatka.md`, „Szerokość tekstu”).
5. **Szablon jako start**: slajdy powstają z 24 układów `assets/template.html`, nie od zera
   (`references/uklady.md`).
6. **Marka Ageno**: tło, kolory i logo według `references/siatka.md` („Kolory”, „Logo”).
7. **Daty YYYY-MM-DD i język decku** według `references/redakcja.md`.
8. **Sprawdzaj, nie deklaruj**: przed oddaniem automat, oględziny i lista z `references/qa.md`.

## Pliki skilla

| Plik | Co zawiera | Kiedy czytać |
| --- | --- | --- |
| `README.md` | Instalacja, wszystkie polecenia, umowa CLI (kody 0 / 1 / 2), struktura katalogu decku | Przed pierwszym poleceniem (krok 4–6) |
| `assets/template.html` | Gotowy deck: tokeny, siatka, 24 układy jako przykłady, skalowanie, nawigacja, snap, tryb `G`, druk do PDF | Zawsze: kopiuj jako start |
| `assets/ageno-logo.svg` | Oryginalne logo Ageno (już wstawione w szablon) | Gdy logo trzeba wstawić gdzie indziej |
| `references/ageno.md` | Fakty o Ageno: marka i grafiki, liczby, klienci, realizacje, opinie, oferta, osoby, słownik, poufność | Krok 1 i przy każdym slajdzie o Ageno |
| `references/tresc.md` | Rejestr źródeł, narracja, plan slajdów, tytuły, gęstość | Krok 2–3 |
| `references/siatka.md` | Płótno, kolumny, budżet wysokości, typografia, kolory, logo, oznaczenia `data-grid`, błędy, decyzje projektowe | Krok 3 i 5 |
| `references/uklady.md` | Katalog 24 układów (numer slajdu, kiedy użyć, wysokość) i zasady każdego układu | Krok 3 (wybór układu) i 5 |
| `references/redakcja.md` | Język: styl S1–S7, reguły 3–36, daty, korekta, sierotki, co sprawdza linter | Krok 5 przy tekstach i krok 6 |
| `references/screeny.md` | Ramki screenów, `screens.json`, zrzuty i osadzanie | Gdy deck ma screeny |
| `references/zdjecia.md` | Zdjęcia górskie z Unsplash: dobór, pobieranie, podpis autora | Gdy deck ma slajd „Zdjęcie + treść” |
| `references/nawigacja.md` | Jeden plik, kontrakt DOM, sterowanie, druk do PDF | Przed zmianą skryptu lub struktury, przy PDF, krok 7 |
| `references/qa.md` | Procedura kontroli i lista kontrolna | Krok 6 |
| `scripts/` | Skrypty z `README.md`; stałe w `constants.mjs`, umowa CLI w `cli.mjs` | Krok 4–6 |

## Workflow

### 1. Wejście

Zbierz: cel i odbiorcę (wymagane), materiały źródłowe (wymagane), listę ekranów do pokazania,
logo klienta, jeśli ma być w decku (oryginalny plik od użytkownika), język (domyślnie polski).
Brakujące rzeczy, które da się bezpiecznie założyć, załóż i wypisz. Pytaj tylko o to, bez czego
prezentacja byłaby błędna, i zadawaj jedno pytanie naraz. Pozycji oznaczonej w `references/ageno.md`
jako **[uzupełnić]** nie zgaduj: zapytaj albo pomiń.

### 2. Rejestr źródeł

Przeczytaj wszystkie materiały i rozdziel fakty, decyzje, opinie, hipotezy, rekomendacje,
braki i sprzeczności (`references/tresc.md`).

### 3. Plan slajdów

Tabela: nr, rola, teza, dowód, układ, screen (`references/tresc.md`). Układ wybierz z katalogu
w `references/uklady.md` (pierwszy zawsze tytułowy, ostatni zawsze „Kontakt”) i zsumuj wysokości (budżet: `references/siatka.md`); nie mieści się =
podziel slajd. Przy decku dłuższym niż kilka slajdów albo niejasnych źródłach pokaż plan
użytkownikowi przed kodem.

### 4. Screeny i grafiki

Załóż katalog decku `decks/YYYY-MM-DD-klient-temat/` (struktura: `README.md`). Pobierz grafiki
Ageno (`scripts/ageno-assets.mjs`, `references/ageno.md`), zrób zrzuty w proporcjach ramek albo
użyj plików użytkownika (`references/screeny.md`), a slajdom „Zdjęcie + treść” dobierz zdjęcie
górskie z Unsplash (`references/zdjecia.md`). Polecenia: `README.md`.

### 5. Slajdy

1. Skopiuj `assets/template.html` jako `index.html` decku. Slajd tytułowy zostaw i zmień tylko
   jego teksty; slajd „Kontakt” zostaw jako ostatni i zmień tylko dane osoby (`references/ageno.md`, „Osoby”). Dalsze slajdy kopiuj z przykładowych układów, wypełnij treścią, nieużyte usuń.
   Style i skrypt zostaw (`references/uklady.md`).
2. Buduj z klas szablonu; nowego CSS jak najmniej i tylko z tokenami (`references/siatka.md`).
3. Każdy blok oznacz `data-grid` (`32`, `8` albo `32y`), blok o zmiennej wysokości także
   `data-snap` (`references/siatka.md`, „Oznaczenia”).
4. Logo Ageno i klienta według `references/siatka.md`, „Logo”. W stopce wpisz źródło lub opis
   screenu w `data-source`; numer i małe logo wstawia skrypt.
5. Uzupełnij `<title>` i `aria-label` prezentacji. Zredaguj wszystkie teksty według
   `references/redakcja.md`.
6. Złóż jeden plik `dist/YYYY-MM-DD-klient-temat.html` przez `scripts/inline-assets.mjs`;
   do wysłania nadaje się tylko wynik z kodem 0 (`README.md`, „Umowa CLI”).

### 6. Kontrola

Przejdź `references/qa.md`: automat (siatka, tekst, smoke-test, PDF), oględziny zrzutu każdego
slajdu i stron PDF oraz lista kontrolna. Po każdej poprawce sprawdź slajd i sąsiadów, po ostatniej zmianie całość.

### 7. Przekazanie

Podaj krótko:
1. plik HTML i liczbę slajdów,
2. sterowanie i zapis do PDF (`references/nawigacja.md`),
3. jakie testy faktycznie wykonano i w jakich rozdzielczościach,
4. założenia, luki w danych, zasłonięte dane, rzeczy niezweryfikowane.
