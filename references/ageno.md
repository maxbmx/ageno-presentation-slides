# Ageno: fakty do prezentacji

Jedyne źródło informacji o Ageno w deckach. Agent bierze stąd liczby, realizacje, nazwy usług
i grafiki zamiast pisać ogólniki. Czego tu nie ma, tego nie wymyśla: pyta użytkownika albo
pomija. Każda sekcja ma datę aktualizacji; dane starsze niż 12 miesięcy agent potwierdza
z użytkownikiem przed użyciem.

Oznaczenia: **[ageno.pl]** = ze strony ageno.pl (stan na 2026-11-17), **[uzupełnić]** = brak
danych, użytkownik dopisze.

## Jak plik łączy się z prezentacją

| Sekcja pliku | Gdzie trafia w decku | Układ (slajd szablonu, `references/uklady.md`) |
| --- | --- | --- |
| Marka i grafiki | slajd tytułowy, stopki, tło slajdu klientów | 1 Tytułowy, stopka każdego slajdu |
| Podstawy | nadtytuł slajdu tytułowego, slajd kontaktowy | 1 Tytułowy, slajdy kończące |
| Liczby | slajd o Ageno, dowody w tezach | 2 Teza + 3 liczby |
| Klienci i logotypy | slajd kończący z logotypami | 23 Klienci Ageno |
| Realizacje | dowód, że podobny projekt się udał | 11 Case study, 3 Teza + screen |
| Opinie klientów | głos klienta | 21 Opinie klientów, 14 Cytat |
| Sposób pracy | plan projektu, etapy, warianty, role, ryzyka | 8 Warianty, 12 Kroki, 13 Harmonogram, 18 Ryzyka, 19 Role |
| Oferta i technologie | zakres, nazwy usług w tezach | 9 Zakres, 10 Wycena |
| Osoby | slajd zamykający z kontaktem | 24 Kontakt |
| Słownik | wszystkie teksty | `references/redakcja.md`, reguła 9 |
| Poufność | decyzja, co wolno pokazać | wszystkie slajdy z klientami |

## Marka i grafiki (2026-11-17)

- Logo Ageno: `assets/ageno-logo.svg`; w szablonie jako `<symbol id="ageno-logo">`. Duże na slajdzie
  tytułowym i „Kontakt”, małe w stopce pozostałych slajdów (na slajdach z dużym logo małego nie ma).
- Kolory z logo: ciemny fiolet `#231430` (tekst), pomarańcz `#ff6b00` (akcent).
- Góry Ageno: `https://ageno.pl/wp-content/uploads/2024/02/mountains-optim-1.svg` →
  `ageno-mountains.svg` (pobiera `scripts/ageno-assets.mjs`). Obowiązkowo na slajdzie tytułowym
  (po lewej, poza lewą i dolną krawędź) i na slajdzie kontaktowym (po prawej, poza prawą
  i dolną krawędź). Pliku nie zmieniamy.
- Hasło ze strony: „Zdobywamy szczyty e-commerce” **[ageno.pl]**. Na slajdach tylko dosłownie,
  jako hasło marki, nie jako teza.
- Górski charakter: siedziba w Bielsku-Białej, w Beskidzie Śląskim **[ageno.pl]**. Zdjęcia
  w układzie „Zdjęcie + treść”: `references/zdjecia.md`.

## Podstawy

- Nazwa: Ageno Sp. z o.o. **[ageno.pl]**
- Adres: Sobieskiego 105, 43-300 Bielsko-Biała **[ageno.pl]**
- Strona: ageno.pl; konsultacje: ageno.pl/konsultacje **[ageno.pl]**
- Blanc: na ageno.pl rozwiązanie „Blanc – Błyskawiczne wdrożenie Magento” **[ageno.pl]**.
  Kiedy deck jest pod marką Blanc, a kiedy Ageno: **[uzupełnić]**
- Rok założenia, liczba osób w zespole: **[uzupełnić]**
- Profil klientów: najczęściej średnie i duże organizacje B2C, B2B i D2C **[ageno.pl]**

## Liczby

| Liczba | Wartość | Źródło | Uwagi |
| --- | --- | --- | --- |
| Lata doświadczenia | 10+ | ageno.pl, 2026-11-17 | |
| Klienci | 100+ | ageno.pl, 2026-11-17 | |
| Zrealizowane projekty | 200+ | ageno.pl, 2026-11-17 | **sprzeczność:** w innym miejscu strony „ponad 100 projektów”; do potwierdzenia |
| Partnerzy biznesowi | 20+ | ageno.pl, 2026-11-17 | |
| Nowe projekty z rekomendacji | ponad 90% | ageno.pl, 2026-11-17 | |
| Ocena w opiniach | 4,9 / 5 (Clutch, Google) | ageno.pl, 2026-11-17 | liczba opinii na stronie: 62 |

Na slajdzie liczba zawsze z opisem i okresem lub datą stanu (`references/redakcja.md`).

## Klienci i logotypy

- Zdanie do slajdu „Klienci Ageno”: „Ponad 100 klientów, m.in. z branży sportowej, modowej,
  produkcyjnej, motoryzacyjnej i wyposażenia wnętrz.” (na podstawie **[ageno.pl]**, przepisane
  według `redakcja.md`: bez emoji, myślnika i „nam”).
- Logotypy: ze strony głównej ageno.pl, sekcja klientów; pobiera je `scripts/ageno-assets.mjs`
  do `logos/` i listy `logos.json`. Plików nie przycinamy i nie skalujemy: wszystkie mają ten
  sam obszar roboczy, więc w równych polach 256 × 128 są równe.
- Wzorcowy zestaw 10 logotypów (wg slajdu Ageno „Zaufali nam”): Auto Partner, Martes Sport,
  Safety First, Avionaut, PRO, Eurofirany, Henry Schein, Nobile, Marrodent, Kontakt-Simon.
  Kolejność i wybór do potwierdzenia przy danym decku; pod klienta z danej branży można
  podmienić logotypy na bliższe jego branży.
- Branże ze strony: moda, sport, budownictwo, home & decor, medycyna, farmacja, przemysł,
  kosmetyka, motoryzacja, elektrotechnika, BHP i inne **[ageno.pl]**.

## Realizacje

Dla każdej: klient, branża, problem, rozwiązanie, wynik z okresem, adres realizacji, zgoda.

| Klient | Rozwiązanie | Wynik | Źródło | Zgoda na pokazanie |
| --- | --- | --- | --- | --- |
| Martes Sport | e-commerce, przyspieszenie realizacji zamówień | czas realizacji zamówień z 7 dni do 24 godzin; okres **[uzupełnić]** | ageno.pl/realizacje/martes-sport | publiczna realizacja |
| Eurofirany | PIM zintegrowany z Magento, kalkulator produktów szytych na miarę | **[uzupełnić]** | ageno.pl/realizacje/eurofirany-pim | publiczna realizacja |
| Safety First | e-commerce B2C i B2B | **[uzupełnić]** | ageno.pl/realizacje/safety-first | publiczna realizacja |
| Iguana | hurtownia online B2B na Magento, headless | **[uzupełnić]** | ageno.pl/realizacje/iguana-b2b | publiczna realizacja |
| Gres | platforma e-commerce na Magento 2, płytki ceramiczne | **[uzupełnić]** | ageno.pl/realizacje/gres | publiczna realizacja |
| Avionaut | e-commerce B2C, foteliki samochodowe | **[uzupełnić]** | ageno.pl/realizacje/avionaut-b2c | publiczna realizacja |

Liczby wyników tylko potwierdzone, z okresem. Screeny realizacji: zrzuty ze stron klientów
(`references/screeny.md`) albo z ageno.pl/realizacje.

## Opinie klientów

Do układu „Cytat”, dosłownie, z autorem i firmą, tylko krótkie fragmenty:

- Paweł Danel, E-commerce Manager, Martes Sport **[ageno.pl]**
- Przemysław Golba, E-commerce Manager, Martes Sport: wdrożenie Magento 2 w ciągu 4 miesięcy **[ageno.pl]**
- Alicja Ptaszkiewicz, Marketing Manager, Marrodent **[ageno.pl]**
- Tomasz Piskorz, E-commerce Manager, PRO **[ageno.pl]**

Pełne brzmienie: ageno.pl/opinie. Cytat na slajdzie przepisz ze źródła słowo w słowo.

## Sposób pracy

- Etapy projektu, podejście MVP i rozwój etapami: **[uzupełnić]**
- Model rozliczeń (Time & Materials, Fixed Price): ageno.pl/blog/time-materials-fixed-price-agile-waterfall;
  domyślny model w ofertach: **[uzupełnić]**
- Procedury, Definition of Done, rejestr ryzyk: artykuły na ageno.pl/blog **[ageno.pl]**; skrót
  na slajd: **[uzupełnić]**
- AI w developmencie: analiza wymagań, jakość kodu, testy, refaktoryzacja, estymacje; decyzje
  architektoniczne podejmują inżynierowie **[ageno.pl]**
- Gwarancja, utrzymanie, SLA: **[uzupełnić]**

## Oferta i technologie (nazwy jak na ageno.pl)

- Usługi: wdrożenia e-commerce, utrzymanie i rozwój Magento, migracje e-commerce, integracje
  e-commerce, doradztwo e-commerce, przejęcie projektu e-commerce, wdrożenia i rozwój PLM,
  wdrożenia i integracje marketplace, audyt i wdrożenie WCAG, optymalizacja e-commerce,
  audyty wydajności, techniczna optymalizacja SEO.
- Technologie: Magento 2, Magento Hyvä, Pimcore, PWA, WordPress, Flutter.
- Rozwiązania: Blanc, e-commerce B2B, B2C, D2C, PIM, PWA / headless, e-procurement i PunchOut,
  aplikacje internetowe, m-commerce, PLM, katalogi produktów online, strony korporacyjne,
  agentic commerce.

## Osoby

Do slajdu „Kontakt” (24). Zdjęcie pobiera `scripts/ageno-assets.mjs` do `people/`; tylko
zdjęcia z tej listy, nigdy ze stocku.

| Osoba | Rola | E-mail | Telefon | Zdjęcie |
| --- | --- | --- | --- | --- |
| Maksymilian Śleziak | **[uzupełnić]** | maksymilian.sleziak@ageno.pl | +48 502 02 22 02 | https://ageno.pl/wp-content/uploads/2023/04/image-15-1.png → `people/maksymilian-sleziak.png` |

Domyślna osoba na slajdzie kontaktowym: Maksymilian Śleziak. Inna osoba: dopisz wiersz tu
i w liście `PEOPLE` w `scripts/ageno-assets.mjs`.

## Słownik

| Używamy | Nie używamy |
| --- | --- |
| platforma e-commerce | system sklepowy, rozwiązanie (na zmianę) |
| wdrożenie | implementacja |
| Magento 2 | Magento (gdy chodzi o wersję 2), M2 |
| **[uzupełnić]** | |

## Poufność

- Wolno: realizacje, logotypy i opinie opublikowane na ageno.pl.
- Nie wolno bez zgody użytkownika: nazwy i liczby klientów spoza ageno.pl, ceny z innych ofert,
  dane wewnętrzne Ageno (marże, wynagrodzenia, wyniki finansowe).
- Inne zasady: **[uzupełnić]**
