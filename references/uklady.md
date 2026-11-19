# Układy slajdów

Wszystkie układy są gotowe w `assets/template.html`, każdy jako osobny slajd. Szablon jest
jedynym źródłem ich kodu: kopiuj slajd stamtąd, nie pisz układu od nowa. Audyt siatki
sprawdza je przy każdym teście.

## Katalog

| Slajd w szablonie | Układ | Kiedy | Wysokość w kontenerze (704) |
| --- | --- | --- | --- |
| 1 | Tytułowy | start, zawsze | logo Ageno (i opcjonalnie klienta) 64 + 128 + nadtytuł + tytuł + lead; tekst w kolumnie 864 po prawej, góry Ageno po lewej |
| 2 | Teza + 3 liczby | wyniki, skala | teza 64–128 + 64 + liczba 64 + opis 64 |
| 3 | Teza + screen (1/3 + 2/3) | funkcja, problem | 128 + 32 + 544 = 704 |
| 4 | Pełny screen | demo jednego ekranu | 64 + 32 + 608 = 704 (teza w 1 wierszu) |
| 5 | Dwa screeny | porównanie, przed / po, desktop vs mobile | 128 + 32 + 416 + podpis 32 = 608 |
| 6 | Mobile + tekst | widok telefonu | 640 |
| 7 | Tabela | porównanie danych | 128 + 32 + 64 + 6 × 64 = 608 |
| 8 | Warianty | wybór między 2–3 opcjami | teza 64 + 32 + karta 544 = 640 (zapas na 2 dodatkowe wiersze) |
| 9 | Zakres | w projekcie / poza projektem | 128 + 32 + 32 + 32 + punkty |
| 10 | Wycena | koszt etapu lub oferty | 64–128 + 32 + 64 + wiersze × 64 + suma 64 |
| 11 | Case study | wynik u klienta | logo 32 + 32 + teza + 32 + 3 kolumny |
| 12 | Kroki / oś czasu | maks. 3 etapy z opisem | 64–128 + 64 + kroki |
| 13 | Harmonogram (timeline) | plan projektu: równoległe zadania w czasie | teza 64 + 32 + skala 32 + 32 + wiersze × 64 |
| 14 | Cytat | głos klienta | 128 + cytat + podpis |
| 15 | Zdjęcie + treść, zdjęcie z prawej | otwarcie sekcji, klimat | treść w kolumnie 544: 128 + nadtytuł + teza + punkty |
| 16 | Zdjęcie + treść, zdjęcie z lewej | jak wyżej, lustrzanie | jak wyżej |
| 17 | Problem i rozwiązanie | co projekt naprawia, w parach | teza 64–128 + 32 + nagłówki 32 + 32 + pary (maks. 4) |
| 18 | Ryzyka i działania | rejestr ryzyk w ofercie lub statusie | teza + 32 + 64 + wiersze × 64–96 (maks. 5) |
| 19 | Role i odpowiedzialności | podział zadań Ageno i klienta | teza + 32 + 64 + wiersze × 64 (maks. 7) |
| 20 | Decyzje do podjęcia | domknięcie spotkania konkretem | teza + 32 + 64 + wiersze × 64 (maks. 5) |
| 21 | Opinie klientów | dowód współpracy głosem klientów | teza 64 + 32 + karty (maks. 3) |
| 22 | Rekomendacja | decyzja, kolejne kroki | 128 + treść |
| 23 | Klienci Ageno (logotypy) | slajd kończący | teza 64 + 32 + lead 64 + 64 + 2 × 128 + 32 = 512 |
| 24 | Kontakt | slajd zamykający, zawsze ostatni | logo 64 + 128 + tytuł 64 + 32 + lead 32 + 64 + portret 256 = 640 |

Slajd tytułowy jest obowiązkowy i zawsze pierwszy. Pozostałe wybieraj według planu slajdów;
ten sam układ może wystąpić wiele razy.

## Rama każdego slajdu

```html
<section data-slide class="slide" aria-hidden="true">
  <div class="container stack">…</div>
  <footer class="slide-footer">
    <span data-source>Źródło albo opis screenu, YYYY-MM-DD</span>
    <span data-slide-number></span>
  </footer>
</section>
```

`data-slide-number` i `aria-label` wypełnia skrypt. Pierwszy slajd ma `is-active`
i `aria-hidden="false"`, reszta nie.

## Screen zamiast zaślepki

W szablonie ramki screenów to zaślepki (`.shot-placeholder` z napisem). Przy prawdziwym
screenie usuń klasę `shot-placeholder` i napis, wstaw obraz:

```html
<figure class="shot shot-wide" data-grid="32">
  <img src="screens/koszyk.jpg" alt="Koszyk w nowym sklepie, widok desktop">
</figure>
```

W układzie „Dwa screeny” klasa `.shot` siedzi na `div` w `figure` z podpisem; zachowaj tę
strukturę. Ramki i zrzuty: `references/screeny.md`.

## Zasady poszczególnych układów

**Teza + 3 liczby.** 1–3 liczby; dwie to pełny slajd, nie dopełniaj do trzech (`references/redakcja.md`, reguła 8). Kluczowa liczba w `.mark`, pozostałe bez akcentu. Opis liczby: czego
dotyczy, okres (zakres dat), jednostka.

**Pełny screen.** Teza musi zmieścić się w jednym wierszu, inaczej użyj „Teza + screen”.

**Mobile + tekst.** Ramka 320 stoi przy lewej krawędzi kolumny 416. Nie centruj jej: offset
48 px zszedłby z siatki.

**Tabela.**
- maks. 4 kolumny i 6 wierszy danych; więcej = kolejny slajd albo dodatek,
- szerokości kolumn w `<colgroup>`, każda wielokrotnością 32 px, suma = szerokość tabeli
  (cała szerokość: 1312 = 416 + 288 + 288 + 320),
- wiersz 64 px (16 + 32 + 16), nagłówek 16 / 32 przygaszony, komórki 20 / 32,
- bez linii: co drugi wiersz w `--c-card`,
- liczby w `.num` (do prawej, cyfry tabelaryczne), jednostka w komórce albo w nagłówku,
- jeden akcent (`.mark`) na kluczowej wartości, pogrubienie (`strong`) najwyżej dla jednej,
- `aria-labelledby` wskazuje tezę slajdu, `scope="col"` w nagłówkach, źródło w stopce.

**Warianty.** 2–3 karty (`.card`) w `.grid-2` albo `.grid-3` z klasą `.options` (równa
wysokość). W każdej karcie te same wiersze w tej samej kolejności (`dl.facts`): Zakres, Czas,
Koszt, Ryzyko; wartości krótkie, w całej karcie najwyżej 2 dodatkowe wiersze. Teza w jednym
wierszu. Najwyżej jeden wariant „Rekomendowany” (nadtytuł
w `.mark`); teza slajdu mówi, który i dlaczego. Bez ikon ✓ / ✗ i tabel plusów i minusów.
Koszty i terminy tylko ze źródła.

**Zakres.** Dwie kolumny `.grid-2`: „W zakresie” (`.points`) i „Poza zakresem”
(`.points .points-out`, znacznik przygaszony). Maks. 6 punktów w kolumnie, każdy konkretny
(funkcja, integracja, praca), bez ogólników typu „inne prace”. Rzeczy przesunięte na kolejny
etap nazwij wprost.

**Wycena.** Wariant tabeli z wierszem sumy w `<tfoot>` (pogrubiony, kwota w `.mark`).
Kolumny 704 + 288 + 320. Maks. 6 pozycji. W stopce zawsze waluta, netto lub brutto i data
ważności oferty (`Ceny netto w PLN, oferta ważna do YYYY-MM-DD`). Kwoty i suma wyłącznie ze
źródła; agent nie szacuje cen i sprawdza, czy suma się zgadza.

**Case study.** Logo klienta (dostarczone przez użytkownika) w `.client-logo` (wysokość 32),
teza z wynikiem, trzy kolumny: Wyzwanie, Rozwiązanie, Wynik (1–2 liczby w `.number`,
kluczowa w `.mark`). Liczby tylko potwierdzone, z okresem w stopce. Bez logo: usuń
`.client-logo`, nie wstawiaj nazwy jako pseudo-logo.

**Kroki / oś czasu.** Maks. 3 kroki w `.grid-3`, w etykiecie numer i zakres dat
(`01 · 2026-12-01 – 2026-12-31`). Więcej kroków: dwa slajdy albo lista `.points` w `.w-2of3`.

**Harmonogram (timeline).** Wykres Gantta w stylu decku, gdy zadania nakładają się w czasie
(„Kroki” są dla 3 etapów po kolei).
- Kolumna nazw 320 px, oś czasu 960 px. Nazwa zadania 16 / 32, jeden wiersz, do ok. 28 znaków.
- `--periods` na `.gantt`: 4, 5, 6, 8 albo 10 okresów (miesiące albo tygodnie), żeby szerokość
  okresu była wielokrotnością 8 px. Etykiety okresów to daty początku w formacie YYYY-MM-DD.
- Pasek: `--start` (numer okresu od 0) i `--span` (liczba okresów), tylko liczby całkowite.
  Krótsze zadanie zaokrąglij do okresu albo zmień okresy na tygodnie.
- Maks. 8 wierszy przy tezie w jednym wierszu (64 + 96 + 8 × 64 = 672), 7 przy dwóch. Więcej zadań: grupuj w fazy
  albo podziel na dwa slajdy.
- Kolory: zwykły pasek `--c-bar` (beż), jeden kluczowy etap (np. MVP, start) w `.is-key`
  (pomarańczowy akcent). Kolor nie koduje zespołów; bez czerwieni, gradientów i zaokrągleń.
- Bez linii siatki: okresy rozdziela tło, co druga kolumna biała.
- Napisów nie wstawiaj w paski. W każdym pasku jest ukryty dla oka zakres dat (`.sr-only`)
  dla czytników ekranu, a pełny zakres projektu w stopce.
- Komentarze i dymki z uwagami nie trafiają na wykres; ważną uwagę daj w tezie albo na
  osobnym slajdzie.

**Cytat.** Tylko wierny cytat z atrybucją, w prostych cudzysłowach. Krótki: klasa `.h2` (40 / 64), dłuższy: `.lead`
(24 / 32).

**Zdjęcie + treść.** Jedyny układ, w którym wolno użyć zdjęcia ze stocku (Unsplash, motyw
górski). Zdjęcie 752 × 864 na pełną wysokość od krawędzi slajdu, treść w kolumnie 544 px po
drugiej stronie, podpis `@autor` z linkiem w dolnym rogu zdjęcia. Klasa `.photo-right` albo
`.photo-left`. Dobór zdjęcia, podpis i pobieranie: `references/zdjecia.md`.

**Tytułowy.** Góry Ageno (`ageno-mountains.svg`, `references/ageno.md`) zawsze po lewej,
wychodzą poza lewą i dolną krawędź slajdu; leżą w warstwie `.bleed`, która przycina je do
slajdu, więc slajd się nie przewija. Logo Ageno w lewym górnym rogu nad górami. Nadtytuł,
tytuł i lead w kolumnie `.title-text` (864 px, x = 560), logo klienta opcjonalnie po prawej
w wierszu logo. Bez pliku gór szablon pokazuje zaślepkę „brak ageno-mountains.svg”: przed
oddaniem decku plik musi być obok `index.html`.

**Klienci Ageno (logotypy).** Slajd kończący, przed kontaktem. Teza „Klienci Ageno”, jedno zdanie
o skali i branżach z `references/ageno.md`, pod nim 10 logotypów w dwóch wierszach po 5
(`.logo-wall`, pola 256 × 128 z odstępem 8 px). Logotypy pobiera `scripts/ageno-assets.mjs`
ze strony głównej ageno.pl; pliki wstawiaj bez zmian (bez przycinania i skalowania obszaru
roboczego, bez zmiany kolorów), bo równe obszary robocze dają równe logotypy. Bez ramek,
podpisów i tła pod logotypami. Źródło i data stanu w stopce. Mniej niż 10 logotypów:
jeden pełny wiersz 5, nie zostawiaj dziur.

**Kontakt.** Zawsze ostatni slajd. Duże logo Ageno w lewym górnym rogu (bez małego logo
w stopce), tytuł „Pytania i kontakt” (56 / 64), jedno zdanie leadu, pod nim osoba: portret
256 × 256 w kole, obok imię i nazwisko, e-mail jako link `mailto:` i telefon jako link `tel:`
w `.nowrap`. Dane i zdjęcie tylko z sekcji „Osoby” w `references/ageno.md`. Po prawej te same
góry Ageno co na slajdzie tytułowym, wychodzące poza prawą i dolną krawędź; tekst i stopka
w lewej kolumnie 640 px. Portret w kole to jedyne zaokrąglenie w decku (kadr zdjęcia, nie
pudełko). Bez „Dziękujemy”, pytań retorycznych i zwrotów w 1. osobie („Zapraszam do kontaktu”).

**Problem i rozwiązanie.** Dwie kolumny po 640 px (`.pairs`): nagłówki „Problem”
i „Rozwiązanie”, pod nimi pary `p.pair-problem` (znacznik przygaszony) i `p.pair` (znacznik
w akcencie). Para stoi w jednym wierszu siatki, więc problem i jego rozwiązanie zaczynają się na
tej samej wysokości. Każda strona to jedno zdanie (najwyżej 2 wiersze), maks. 4 pary. Rozwiązanie
odpowiada dokładnie na problem obok; bez par „na wyrost”.

**Ryzyka i działania.** Tabela 448 + 160 + 480 + 224: ryzyko, wpływ (niski, średni, wysoki),
działanie zapobiegawcze, właściciel (Ageno albo klient). Wpływ „wysoki” pogrubiony; bez kolorów
sygnalizacyjnych (czerwień, zieleń). Maks. 5 ryzyk, od najwyższego wpływu. Ryzyka tylko
z materiałów albo jako rekomendacja Ageno, opisana jako ryzyko, nie jako fakt.

**Role i odpowiedzialności.** Tabela 672 + 320 + 320: zadanie, Ageno, klient. W komórkach
czasowniki z jednego słownika: odpowiada, wspiera, akceptuje, decyduje, rekomenduje; pusta
komórka = brak udziału (bez myślnika). Każde zadanie ma dokładnie jedną stronę, która „odpowiada”
albo „decyduje”. Maks. 7 wierszy.

**Decyzje do podjęcia.** Tabela 768 + 288 + 256: decyzja, kto decyduje, termin (YYYY-MM-DD).
Najbliższy termin w `.mark`. Maks. 5 decyzji; decyzja zapisana jako rzeczownik („Wybór
wariantu projektu”), nie pytanie. Zwykle przedostatni lub ostatni slajd merytoryczny,
przed „Rekomendacją” albo zamiast niej.

**Opinie klientów.** 2–3 karty (`.grid-2` albo `.grid-3` z `.quotes`): krótki fragment opinii
dosłownie, w prostych cudzysłowach (24 / 32, maks. 4 wiersze), pod nim autor, rola i firma.
Tylko opinie z sekcji „Opinie klientów” w `references/ageno.md`, z adresem źródła w stopce.
Fragment skracaj tylko przez wybór zdania, nie przez przerabianie słów. Jedna opinia: układ
„Cytat” (14).

**Rekomendacja.** Nadtytuł, teza-decyzja, 2–3 punkty `.points`: kto, co, do kiedy
(data YYYY-MM-DD) i jaka decyzja jest potrzebna od odbiorcy.

## Karta

`.card` (białe tło, dopełnienie 32) na wyróżnienie bloku, np. decyzji. Bez ramek, cieni
i zaokrągleń.

## Tło

Tło każdego slajdu jest zawsze szare `#f7f7f7` (`--c-bg`). Bez pasów, kolorowych ani ciemnych
teł slajdu, także w prezentacji w marce klienta. Wyróżnienie robi akcent `.mark`, biała `.card`
albo odstęp.

## Nowy układ

Gdy żaden z 24 nie pasuje: zbuduj go z klas siatki (`references/siatka.md`), dodaj jako
kolejny przykładowy slajd do `assets/template.html`, dopisz wiersz do katalogu i uruchom
audyt siatki.
