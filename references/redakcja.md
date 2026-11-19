# Redakcja tekstów

Wszystkie zasady dotyczące języka w decku: styl (S1–S7), wzorce do usunięcia (reguły 3–35),
daty i korekta. Dotyczą każdego tekstu: tytułów, nadtytułów, punktów, opisów, etykiet,
podpisów, stopek, tabel i `brief.md`. Źródła i narrację opisuje `references/tresc.md`.

Kolejność pracy: napisz tekst, przejdź tę listę, przepisz, zachowując sens i ton, potem
uruchom `scripts/text-lint.mjs`. Efekt ma przypominać materiał konsultingowy dla zarządu,
nie opowieść wykonawcy o tym, co zamierza zrobić.

Deck po angielsku: te same zasady; angielskie słowa do unikania są w regule 5.

## Styl tekstów (S1–S7)

Ton: profesjonalny, neutralny, konkretny i zwięzły, jak w prezentacji zarządczej, strategicznej
lub technologicznej.

- **S1. Tytuły i nagłówki.** Krótkie konstrukcje rzeczownikowe zamiast zdań w pierwszej osobie
  i deklaracji przyszłych działań. Tytuł nadal niesie tezę slajdu (`references/tresc.md`).
  Słabo: „Rekomendujemy MVP i rozwój etapami”. Lepiej: „MVP z rozwojem etapami jako wariant
  rekomendowany”.
- **S2. Perspektywa.** Opisuj projekt, zakres, cele, korzyści i rezultaty, nie czynności
  autora prezentacji.
- **S3. Bez „my”.** Unikaj „zrobimy”, „sprawdzimy”, „chcemy”, „pokażemy”, „dostarczymy”,
  chyba że odpowiedzialność wykonawcy jest istotą komunikatu (np. podział obowiązków).
  Gdy wykonawca ma znaczenie, nazwij go w 3. osobie: „zespół Ageno wdraża”, „klient
  akceptuje”, „system ERP przesyła”. Tak S3 łączy się z regułą 26.
- **S4. Precyzja.** Konkretne określenia biznesowe i technologiczne zamiast sloganów
  i przymiotników. Szczegóły: reguły 24, 27 i 28.
- **S5. Spójność.** Jeden styl dla tytułów, nadtytułów, opisów, etykiet, punktów
  i podsumowań w całym decku; jedna nazwa dla jednej rzeczy (reguła 9).
- **S6. Naturalność.** Nie zamieniaj mechanicznie wszystkich zdań na równoważniki. Tytuły,
  etykiety i komórki tabel mogą być konstrukcjami rzeczownikowymi; opisy i punkty są pełnymi
  zdaniami (reguła 30).
- **S7. Wiarygodność.** Odróżniaj fakty od założeń, hipotez i rekomendacji. Planowany rezultat
  opisuj jako plan („planowane uruchomienie MVP do 2027-07-31”), nigdy jako osiągnięty
  („MVP gotowe”).

## Wzorce do usunięcia (reguły 3–35)

Numery reguł są stałe i inne skille się do nich odwołują. Reguł 1 i 2 celowo nie ma.
Usunięta reguła zostawia lukę; nie przenumerowuj listy. Nowe reguły dostają kolejne numery.

- **3.** Bez doczepionych imiesłowów, które nie dodają faktu („podkreślając…”,
  „zapewniając…”, „umożliwiając…”).
- **4.** Bez ogólnikowych źródeł („eksperci uważają”, „badania pokazują”). Podaj źródło
  albo usuń zdanie.
- **5.** Bez słownictwa typowego dla AI: dodatkowo, kluczowy, kompleksowy, innowacyjny,
  holistyczny, synergia, ekosystem, krajobraz, unikalny, przełomowy, wartość dodana,
  „w dzisiejszych czasach”; po angielsku: additionally, crucial, delve, enhance, foster,
  landscape, pivotal, showcase, testament, underscore, vibrant.
- **6.** Pisz „jest” albo „ma”, nie „pełni rolę”, „stanowi”, „może pochwalić się”.
- **7.** Bez „nie tylko X, ale także Y”. Napisz wprost, o co chodzi.
- **8.** Nie dopasowuj treści do trójek. Dwie liczby albo dwa punkty to pełny slajd.
- **9.** Jedna nazwa dla jednej rzeczy. Powtarzaj ją zamiast szukać synonimów
  („platforma”, nie na zmianę „platforma”, „system”, „rozwiązanie”).
- **10.** Bez „od X po Y”, chyba że X i Y leżą na prawdziwej skali.
- **11.** Bez myślników (pauzy, półpauzy, dywizu jako myślnika) i bez nawiasów w ich miejsce.
  Użyj kropki albo przecinka. Wyjątek: półpauza w zakresie dat i liczb
  (`2026-10-01 – 2026-10-31`).
- **12.** Dwukropek tylko przed listą albo przykładem, nigdy jako łącznik w środku zdania
  ani tytułu („Nowa platforma B2B: MVP…” jest błędem).
- **13.** Nie pogrubiaj każdej nazwy własnej i skrótu.
- **14.** Bez pogrubionej etykiety z dwukropkiem, która powtarza treść wiersza
  („Wydajność: wydajność wzrosła…”). Pogrubiony początek zakończony kropką, po którym pada
  nowa informacja, jest w porządku („**Własna roadmapa.** Klient decyduje o kolejności
  funkcji.”).
- **15.** Tytuły i nagłówki zdaniowe: wielka litera tylko na początku i w nazwach własnych.
  Wersaliki nadtytułu robi CSS, w treści piszemy normalnie.
- **16.** Bez ozdobnych emoji.
- **17.** Proste cudzysłowy ("…"), także w cytatach na slajdach.
- **18.** Bez zwrotów czatbota („Mam nadzieję, że to pomoże”, „Daj znać, jeśli…”).
- **19.** Bez otwarć z pochwałą lub zgodą. Od razu do rzeczy.
- **20.** Wytnij wypełniacze. „W celu” → „aby”, „należy zauważyć, że” → usuń.
- **21.** Najwyżej jedno zastrzeżenie w zdaniu: „może”.
- **22.** Bez ogólnych zakończeń („To otwiera nowe możliwości”). Podaj konkretny plan albo fakt.
- **23.** Bez abstrakcyjnych metafor-rzeczowników (fundament, kręgosłup, motor, filar,
  paradygmat, koło zamachowe, gwiazda przewodnia). Użyj konkretnego słowa.
- **24.** Pisz, co rzecz robi, nie jak się z nią czuć. Podaj mechanizm albo liczbę. Usuń zdanie,
  które bez zmian pasowałoby do prezentacji innego projektu.
- **25.** Jedna myśl w zdaniu. Zdanie, które trzeba przeczytać dwa razy, podziel.
- **26.** Strona czynna. Nazwij wykonawcę w 3. osobie, chyba że jest nieznany albo nieistotny.
- **27.** Zamiast przysłówka mocniejszy czasownik albo liczba („znacznie szybciej” →
  „o 2 dni szybciej”).
- **28.** Proste słowo: „użyć”, nie „wykorzystać”, „zaimplementować” ani „lewarować”,
  gdy chodzi o zwykłe użycie.
- **29.** Bez metafor, aforyzmów, uosobień kodu i przenośnych czasowników, gdy istnieje
  dosłowne określenie („bezpieczna droga do MVP” → „plan MVP z testami przed uruchomieniem”).
- **30.** Pełne zdania z orzeczeniem w opisach i punktach. Rozpisuj strzałki (→) i skróty
  nieoczywiste dla odbiorcy.
- **31.** Bez rzeczowników odczasownikowych z pustym czasownikiem: „dokonanie analizy” →
  „analiza”, „przeprowadzenie wdrożenia” → „wdrożenie”, „dokonać zmiany” → „zmienić”.
- **32.** Bez kalk z angielskiego: „w oparciu o” → „na podstawie”, „adresować problem” →
  „rozwiązać problem”, „dedykowany” → „przeznaczony” albo „własny”.
- **33.** Bez pustych łączników: „w ramach”, „na poziomie”, „w obszarze”, „w zakresie”,
  „pozwala na”, „umożliwia” zamiast zwykłego czasownika („system umożliwia składanie
  zamówień” → „klient składa zamówienia w systemie”).
- **34.** Bez zbędnych anglicyzmów, gdy jest polskie słowo: „feature” → „funkcja”,
  „insight” → „wniosek”, „deliverable” → „rezultat”, „performance” → „wydajność”.
  Utrwalone terminy (MVP, API, ERP, B2B, staging, code freeze) zostają.
- **35.** Bez strony biernej w przyszłości: „zostanie wdrożone” → „zespół Ageno wdroży”
  albo „wdrożenie: 2027-03-01”.

## Daty

Wszystkie daty zapisujemy w formacie **YYYY-MM-DD** (np. 2026-11-16), wszędzie: na slajdach,
w nadtytułach, stopkach, źródłach, podpisach screenów, tabelach, osiach wykresów, w planie
slajdów, `brief.md`, nazwach plików i folderów.

- Okres to zakres dat z półpauzą i spacjami: `2026-10-01 – 2026-10-31`. Nie pisz
  „październik 2026”, „10.2026”, „Q4 2026” ani „16.11.2026”.
- Termin względny („za dwa tygodnie”, „do końca kwartału”) zamień na konkretną datę, jeśli
  źródło ją podaje; jeśli nie, zostaw opis i nie zgaduj daty.
- Źródło podaje tylko miesiąc lub rok: zapisz zakres całego okresu (`2026-10-01 – 2026-10-31`)
  albo zaznacz, że dokładnej daty brak. Nie dopisuj dnia, którego źródło nie podaje.
- Wyjątek: dosłowny cytat zostaje w oryginalnym brzmieniu.

## Korekta

- Domyślnie polski. Nazwy własne i utrwalone terminy (AI, API, SaaS, B2B) w oryginale.
  Bez przypadkowych angielskich etykiet.
- Skracaj, ale nie zmieniaj sensu i nie usuwaj istotnych zastrzeżeń.
- Polskie znaki, odmiana nazw, interpunkcja. Sierotki: sekcja niżej.
- Osobna korekta podpisów, stopek, źródeł, etykiet, `alt` i `<title>`.
- Bez notatek prelegenta i komentarzy technicznych na slajdach, chyba że użytkownik o nie prosi.

## Sierotki i łamanie wierszy

W polskiej typografii pewne wyrazy nie mogą zostać same na końcu wiersza, a pewne pary nie mogą
się rozdzielić. Łączy je twarda spacja (U+00A0, w HTML `&nbsp;`).

**Co trzymamy razem:**

| Przypadek | Przykład | Zapis |
| --- | --- | --- |
| Jednoliterowe spójniki i przyimki z następnym słowem | i, a, o, u, w, z | `z&nbsp;klientem`, `i&nbsp;w&nbsp;ERP` |
| Liczba z jednostką | 300 zł, 16 tyg., 5 dni, 42% | `300&nbsp;000&nbsp;zł` |
| Grupy cyfr w liczbie | 1 200, 48 200 | `48&nbsp;200` |
| Skrót z następnym słowem | np., m.in., tj., ok., nr, tzw. | `np.&nbsp;integracja` |
| Myślnik zakresu z pierwszą datą | 2026-12-01 – 2027-03-31 | `2026-12-01&nbsp;– 2027-03-31` |
| Nazwa lub wyrażenie, które musi zostać w jednym wierszu | nazwa produktu, „code freeze” | `<span class="nowrap">code freeze</span>` |

**Jak to działa w szablonie:**

- Funkcja `fixOrphans` w skrypcie szablonu wstawia twarde spacje we wszystkich przypadkach
  z pięciu pierwszych wierszy tabeli, w całym tekście slajdów, przy otwarciu pliku i przed
  drukiem. Nie wpisuj `&nbsp;` ręcznie w tych przypadkach i nie usuwaj tej funkcji.
- Ręcznie tylko ostatni wiersz tabeli: wyrażenie, które ma zostać razem, w `.nowrap`. Używaj
  rzadko; długie `.nowrap` wypycha tekst poza kolumnę.
- Ostatni wiersz akapitu z jednym słowem (wdowa) ogranicza CSS: `text-wrap: balance`
  w nagłówkach, `text-wrap: pretty` w akapitach, punktach i komórkach tabel.
- Bez automatycznego dzielenia wyrazów (`hyphens: manual`). Za długie słowo w wąskiej kolumnie:
  przeredaguj zdanie albo poszerz kolumnę, nie wstawiaj dywizu.

**Gdy po tym wszystkim wiersz nadal łamie się źle** (np. teza z jednym słowem w drugim wierszu):
przeredaguj tekst, skróć albo wydłuż o konkret. Nie zmniejszaj fontu i nie wstawiaj `<br>`,
bo przy innej szerokości złamanie się rozjedzie.

**Kontrola:** oglądanie zrzutów każdego slajdu (`references/qa.md`). Skrypty sprawdzają tekst
i siatkę, ale nie ocenią, czy złamanie wiersza wygląda dobrze.

## Jak stosować na slajdzie

| Element | Forma |
| --- | --- |
| Tytuł (teza) | konstrukcja rzeczownikowa albo krótkie zdanie w 3. osobie, bez „my”, bez dwukropka |
| Nadtytuł | 1–3 słowa, rzeczownik |
| Punkt `.points` | pełne zdanie; opcjonalnie pogrubiony początek zakończony kropką |
| Etykieta, komórka tabeli | rzeczownik lub liczba z jednostką |
| Opis liczby | czego dotyczy, jednostka, okres |
| Stopka | źródło, data w YYYY-MM-DD, bez zdań reklamowych |
| Cytat | dosłownie ze źródła, w prostych cudzysłowach; reguły nie dotyczą treści cytatu |

## Kontrola automatyczna

`scripts/text-lint.mjs` sprawdza widoczny tekst każdego slajdu (bez treści cytatów)
i zgłasza fragment z numerem reguły. **Błąd** trzeba poprawić; **uwaga** wymaga oceny, bo
słowo bywa poprawne w kontekście. Skrypt nie zastępuje czytania: reguł 8, 9, 22, 24, 25, 29
i S1–S7 nie da się sprawdzić automatycznie.
