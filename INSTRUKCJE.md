# Prezentacje Ageno: instrukcja dla projektu w czacie

Wklej ten plik do instrukcji projektu (ChatGPT, claude.ai) i dodaj do plików projektu
`assets/template.html`. Skrypty z repozytorium tu nie działają, więc kontrolę robisz ręcznie
według listy na końcu.

## Wynik

Jeden plik HTML ze slajdami 16:9, zbudowany z `template.html`, działający bez sieci.
Kolejność pracy: źródła → plan → screeny → slajdy → kontrola → przekazanie. Język domyślnie polski.

1. **Wejście.** Cel, odbiorca i materiały są wymagane. Resztę załóż i wypisz. Pytaj tylko
   o to, bez czego deck byłby błędny, jedno pytanie naraz.
2. **Źródła.** Oddziel fakty, decyzje, opinie, hipotezy, rekomendacje, braki i sprzeczności.
   Nie wymyślaj liczb, cytatów, klientów, wyników ani decyzji. Lukę oznacz, sprzeczność pokaż.
3. **Plan.** Tabela: nr, rola, teza, dowód, układ, screen. Przy więcej niż kilku slajdach pokaż
   plan przed kodem. Zsumuj wysokości (niżej); nie mieści się = podziel slajd.
4. **Screeny i grafiki.** Przed slajdami zbierz od użytkownika screeny i logo klienta, a grafiki
   z ageno.pl zostaw jako zaślepki (sekcja „Grafiki w czacie”).
5. **Slajdy.** Z układów szablonu (niżej).
6. **Kontrola** ręczna i **przekazanie**.

## Szablon

- Skopiuj cały `template.html`: `<style>`, `<symbol id="ageno-logo">`, skrypt i `<nav>` zostają
  bez zmian. Zmieniasz tylko slajdy `<section data-slide>` w `.stage`.
- Slajd tytułowy zostaw pierwszy i zmień tylko teksty. Kolejne slajdy kopiuj z układów,
  wypełnij, nieużyte usuń. Ten sam układ może wystąpić wiele razy.
- Pierwszy slajd ma `is-active` i `aria-hidden="false"`, pozostałe `aria-hidden="true"`.
  Numer slajdu, `aria-label` slajdu i małe logo w stopce wstawia skrypt.
- Uzupełnij `<title>` i `aria-label` na `[data-presentation]`.
- Buduj z klas szablonu. Nowy CSS tylko wyjątkowo, z tokenami i wielokrotnościami 32 px.
  Każdy blok ma `data-grid` (`32`, `8` albo `32y`) jak w szablonie, blok o zmiennej wysokości
  także `data-snap`.
- W stopce `data-source`: źródło lub opis screenu z datą.

Układy (numer slajdu w szablonie): 1 Tytułowy (zawsze pierwszy), 2 Teza + 3 liczby,
3 Teza + screen, 4 Pełny screen (teza w 1 wierszu), 5 Dwa screeny, 6 Mobile + tekst, 7 Tabela,
8 Warianty, 9 Zakres, 10 Wycena, 11 Case study, 12 Kroki (maks. 3), 13 Harmonogram,
14 Cytat, 15–16 Zdjęcie + treść, 17 Problem i rozwiązanie, 18 Ryzyka, 19 Role, 20 Decyzje,
21 Opinie klientów, 22 Rekomendacja, 23 Klienci Ageno (przedostatni), 24 Kontakt (ostatni).

## Siatka i wygląd

- Płótno 1536 × 864, kontener 1312 × 704 (x 112–1424, y 64–768), stopka na y = 800.
- Budżet 704 px: teza 64 (1 wiersz) albo 128 (2 wiersze), odstęp 32, screen wide 544,
  half 416 + podpis 32, full 608 (tylko z tezą w 1 wierszu), liczba 64 + opis 64.
- Teza maks. 2 wiersze. Maks. ok. 6 wierszy tekstu w kolumnie. Za dużo treści = kolejny slajd,
  nigdy mniejszy font ani `<br>`.
- Tabela: maks. 4 kolumny i 6 wierszy danych, szerokości z `<colgroup>` jak w szablonie, liczby
  w `.num`, jeden akcent `.mark`. Wycena: suma w `<tfoot>`, kwoty tylko ze źródła, w stopce
  waluta, netto lub brutto i data ważności oferty.
- Warianty: 2–3 karty, te same wiersze (Zakres, Czas, Koszt, Ryzyko), najwyżej jeden
  „Rekomendowany”. Role: odpowiada, wspiera, akceptuje, decyduje, rekomenduje.
- Tło zawsze `#f7f7f7`, tekst `#231430`, jeden akcent `#ff6b00` (`.mark`, znaczniki listy).
  Bez ramek, linii, cieni, zaokrągleń, gradientów, ikon, ilustracji i zdjęć ze stocku. Wyjątki:
  portret w kole na slajdzie Kontakt, zdjęcie górskie z Unsplash w układzie 15–16 z podpisem
  `@autor`.
- Logo Ageno duże tylko na slajdzie tytułowym i Kontakt, bez zmian kolorów i kształtu.
  Logo klienta tylko z pliku od użytkownika; bez pliku wariant bez logo, nie tekst zamiast logo.

## Język

- Tytuł slajdu to wniosek, nie temat. Krótko, bez „my”, bez dwukropka.
- Opisuj projekt i rezultat, nie czynności autora. Wykonawca w 3. osobie („zespół Ageno wdraża”,
  „klient akceptuje”). Plan jako plan („planowane uruchomienie do 2027-07-31”).
- Punkty i opisy to pełne zdania; etykiety i komórki tabel mogą być rzeczownikami.
- Jedna nazwa dla jednej rzeczy. Konkret, liczba albo mechanizm zamiast przymiotnika.
- Nie używaj: dodatkowo, kluczowy, kompleksowy, innowacyjny, holistyczny, synergia, ekosystem,
  krajobraz, unikalny, przełomowy, wartość dodana; stanowi, pełni rolę; „nie tylko…, ale”;
  w celu, należy zauważyć; dokonać, przeprowadzenie; w oparciu o, adresować, dedykowany;
  w ramach, na poziomie, w obszarze, umożliwia; fundament, filar, motor; feature, insight;
  „zostanie wdrożone”; emoji; zwrotów czatbota.
- Bez myślników i nawiasów w ich miejsce. Półpauza tylko w zakresie: `2026-10-01 – 2026-10-31`.
  Dwukropek tylko przed listą lub przykładem. Cudzysłowy proste `"…"`.
- Daty zawsze YYYY-MM-DD, także w stopkach i nazwach plików; okres jako zakres dat.
- Liczba zawsze z jednostką, okresem lub datą stanu i źródłem. Cytat dosłownie, z autorem.
- Twarde spacje (sierotki) wstawia skrypt szablonu; nie wpisuj `&nbsp;`. Wyrażenie, które musi
  zostać w jednym wierszu, rzadko w `<span class="nowrap">`.

## Fakty o Ageno (ageno.pl, stan na 2026-11-17)

Tylko te fakty; czego tu nie ma, nie wymyślaj, zapytaj użytkownika albo pomiń.

- Ageno Sp. z o.o., Sobieskiego 105, 43-300 Bielsko-Biała; ageno.pl, ageno.pl/konsultacje.
- 10+ lat doświadczenia, 100+ klientów, ponad 90% nowych projektów z rekomendacji,
  20+ partnerów biznesowych, ocena 4,9 / 5 (Clutch, Google, 62 opinie). Liczba projektów
  (200+ albo „ponad 100”) jest sprzeczna na stronie: potwierdź przed użyciem.
- Hasło „Zdobywamy szczyty e-commerce” tylko dosłownie, jako hasło marki.
- Slajd Klienci Ageno, zdanie: „Ponad 100 klientów, m.in. z branży sportowej, modowej,
  produkcyjnej, motoryzacyjnej i wyposażenia wnętrz.” Logotypy (10, dwa wiersze po 5):
  Auto Partner, Martes Sport, Safety First, Avionaut, PRO, Eurofirany, Henry Schein, Nobile,
  Marrodent, Kontakt-Simon.
- Realizacja z wynikiem: Martes Sport, czas realizacji zamówień z 7 dni do 24 godzin (okres
  nieznany: użyj tylko po potwierdzeniu okresu).
- Słownik: platforma e-commerce (nie „system sklepowy”), wdrożenie (nie „implementacja”),
  Magento 2 (nie „M2”).
- Kontakt (slajd 24): Maksymilian Śleziak, maksymilian.sleziak@ageno.pl i info@ageno.pl jako
  linki `mailto:`. Nigdy numeru telefonu.
- Bez zgody użytkownika nie pokazuj klientów spoza ageno.pl, cen z innych ofert ani danych
  wewnętrznych Ageno.

## Grafiki w czacie

Góry Ageno (`ageno-mountains.svg`), portret (`people/maksymilian-sleziak.png`) i logotypy
klientów pochodzą z ageno.pl i czat ich nie pobierze. Zostaw w HTML ścieżki i zaślepki szablonu
i napisz w przekazaniu, że lokalnie trzeba uruchomić w repozytorium:
`node scripts/ageno-assets.mjs --out <katalog>` i `node scripts/inline-assets.mjs <katalog>/index.html --out dist/<plik>.html`.
Pliki dołączone przez użytkownika (screeny, logo klienta) osadź jako data URI w `<img>`.
Screen dopasuj do ramki układu; nie rozciągaj, nie retuszuj, dane osobowe zasłoń.

## Kontrola ręczna

- [ ] Każdy slajd: jedna teza, maks. 2 wiersze, suma wysokości ≤ 704 px.
- [ ] Tylko układy i klasy szablonu, `data-grid` na każdym bloku, bez nowych odstępów spoza 32 px.
- [ ] Pierwszy slajd tytułowy, przedostatni Klienci Ageno, ostatni Kontakt.
- [ ] Każda liczba ze źródłem, jednostką i okresem; kwoty i sumy się zgadzają.
- [ ] Daty YYYY-MM-DD, bez myślników, zakazanych słów, „my” i dwukropków w tytułach.
- [ ] `<title>`, `aria-label`, `alt` i stopki poprawione tak samo jak slajdy.
- [ ] Brak telefonu, brak zewnętrznych skryptów, arkuszy i fontów.

## Przekazanie

Podaj: plik HTML i liczbę slajdów; sterowanie (strzałki, gest, `F` pełny ekran, `G` siatka,
PDF przez Drukuj → Zapisz jako PDF w Chrome); co sprawdzono ręcznie, a czego nie (siatki
w przeglądarce i grafik z ageno.pl nie sprawdzono); założenia, luki i zasłonięte dane.
