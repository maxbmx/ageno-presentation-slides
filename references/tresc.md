# Treść: źródła, narracja, redakcja

## Rejestr źródeł

Zanim napiszesz pierwszy slajd, zbuduj roboczy rejestr (w `brief.md` decku albo w notatkach roboczych):

| Typ informacji | Jak traktować |
| --- | --- |
| Fakt | Zachowaj wartość, jednostkę, okres, zakres i kontekst |
| Decyzja | Tylko gdy źródło jasno ją potwierdza |
| Opinia | Przypisz autorowi, jeśli to ma znaczenie |
| Hipoteza / prognoza | Nazwij wprost, nie podawaj jako faktu |
| Rekomendacja | Oddziel od decyzji i stanu obecnego |
| Brak danych | Zaznacz lukę, nie uzupełniaj intuicją |
| Sprzeczność | Pokaż obie wersje i ich źródła |

Cytaty: dokładne brzmienie i autor. Liczby: wartość, jednostka, okres, źródło, ograniczenia.

Research zewnętrzny tylko na prośbę albo gdy jest konieczny dla aktualności. Preferuj źródła
pierwotne, sprawdź datę publikacji i oddzielaj research od materiałów użytkownika.

## Narracja

1. Odbiorca i jego poziom wiedzy.
2. Cel prezentacji w jednym zdaniu.
3. Główny przekaz, który odbiorca ma zapamiętać.
4. Oczekiwana decyzja, zgoda lub działanie.
5. Ciąg logiczny: kontekst → problem / potrzeba → dowody → analiza → warianty → rekomendacja →
   kolejne kroki. To punkt wyjścia, nie szablon do wypełnienia.
6. Każdy slajd wynika z poprzedniego i przygotowuje następny.

Agendy, podsumowania i „kolejnych kroków” nie dodawaj automatycznie, tylko gdy służą odbiorcy.

## Plan slajdów

Przed kodem zapisz plan (pokaż go użytkownikowi, jeśli prezentacja ma więcej niż kilka slajdów
albo źródła są niejednoznaczne):

| Nr | Rola | Teza (tytuł) | Dowód / dane | Układ | Screen |
| --- | --- | --- | --- | --- | --- |
| 3 | dowód | Koszyk porzucany na kroku dostawy | analityka X, 2026-10-01 – 2026-10-31 | teza + screen | koszyk-dostawa (wide) |

Jeśli dzielisz jedną sekcję źródłową na kilka slajdów, zapisz w planie konkretny powód
podziału, np. przekroczony budżet wysokości lub odrębna teza.

Przed kodowaniem i podczas QA sprawdź każdą parę sąsiednich slajdów. Czy ich treść zmieści się
razem w dwóch kolumnach bez naruszenia siatki, czytelności i zasady jednej tezy? Jeśli tak,
połącz slajdy.

## Tytuły

Tytuł slajdu to krótkie hasło, maksymalnie 3–5 słów (5 to twardy limit,
`references/redakcja.md`, reguła 36). Nadal niesie wniosek, nie temat, bez „my” i bez dwukropka
(S1 i reguła 12). Szczegół, data, mechanizm i wyliczenie idą do leadu albo treści slajdu:

- słabo: „Wyniki sprzedaży” (temat), „Pokażemy, jak rośnie sprzedaż” (deklaracja),
  „Wzrost sprzedaży skoncentrowany w dwóch kanałach, głównie w wyszukiwarce” (za długie),
- lepiej: „Wzrost sprzedaży w dwóch kanałach”, a nazwy kanałów i okres w treści.

Plan opisuj jako plan, nie jako rezultat (`references/redakcja.md`, S7).

Jeśli źródła nie uzasadniają tezy, daj neutralny tytuł. Długość tezy: `references/siatka.md`
(maks. 2 wiersze).

## Gęstość

- Nie przenoś akapitów dokumentu na slajd. Zostaw liczby, zastrzeżenia i argumenty konieczne
  do zrozumienia wniosku.
- Limit około 6 wierszy obowiązuje osobno w każdej kolumnie. Policz wiersze po złamaniu
  tekstu w docelowej szerokości kolumny. Liczba punktów i sama długość tekstu nie wystarczą
  do oceny.
- Zdjęcie zmniejsza dostępną przestrzeń, ale samo w sobie nie uzasadnia podziału listy.
  Najpierw sprawdź układ dwukolumnowy, zmianę strony zdjęcia albo przeniesienie zdjęcia
  na inny slajd tej sekcji.
- Podziel treść dopiero wtedy, gdy po sprawdzeniu odpowiednich układów nie mieści się
  w budżecie wysokości 704 px, przekracza limit wierszy w którejś kolumnie albo zawiera
  odrębne tezy wymagające osobnego wyjaśnienia. Nie zmniejszaj fontu, by uniknąć podziału.
- Pusta przestrzeń na slajdzie (treść wyraźnie poniżej budżetu 704 px) to sygnał złej gęstości,
  nie powód, by dodać zdjęcie stockowe jako wypełniacz (`references/zdjecia.md`). Połącz slajd
  z sąsiednim tej samej sekcji albo przenieś na niego istniejące zdjęcie, zamiast szukać
  nowego tylko po to, żeby zapełnić kadr.
- Wykres tylko, gdy jest czytelniejszy niż tekst lub tabela. Nie interpoluj braków, nie
  sugeruj przyczynowości z korelacji, oznacz szacunki i prognozy. Osie, jednostki, legenda,
  źródło.

## Redakcja

Język, styl, daty i korekta: `references/redakcja.md`.
