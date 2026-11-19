# Zdjęcia górskie (układ „Zdjęcie + treść”)

## Wyjątek

Zdjęcia z Unsplash (ze stocku) są dozwolone tylko w układzie „Zdjęcie + treść”
(slajdy 15 i 16 szablonu), jako tło klimatu przy otwarciu sekcji, maksymalnie jedno na kilka
slajdów i zawsze z podpisem autora. Na innych slajdach obowiązuje zakaz zdjęć stockowych.

## Klimat: góry

Ageno ma górski klimat, więc zdjęcie dobiera agent sam, bez pytania użytkownika, chyba że
użytkownik poda konkretne zdjęcie.

**Szukaj:** pasma górskie, grzbiety, doliny, mgła i chmury w dolinach, światło o świcie lub
zmierzchu, las na stokach, kamień, szczyty z daleka.

**Charakter:** spokojny, przestrzenny, stonowane i raczej ciemne kolory (granat, zieleń, szarość,
ciepłe światło), dużo powietrza. Zdjęcie ma być tłem, nie tematem.

**Odrzuć:** ludzi, twarze, sprzęt i marki, napisy, budynki i drogi na pierwszym planie,
przesycone kolory, efekty HDR, filtry, kolaże, grafiki i ilustracje, zdjęcia generowane
przez AI, motywy zimowo-świąteczne i turystyczne pocztówki.

**Dopasowanie do treści, gdy to możliwe:**

| Temat sekcji | Motyw |
| --- | --- |
| kontrola, stabilność, platforma | masyw, skała, mocny grzbiet |
| rozwój, droga, plan, wdrożenie | ścieżka lub grań prowadząca w głąb kadru |
| dane, przejrzystość, analiza | widok z góry na doliny, rozległa panorama |
| zmiana, start, nowy etap | świt nad pasmem, światło na szczytach |
| ryzyko, wyzwanie | strome ściany, chmury nad szczytem |

**Technicznie:**
- kadr pionowy albo kwadratowy (ramka 752 × 864 jest prawie kwadratowa); poziome zdjęcie
  też działa, jeśli ważny fragment jest w środku,
- min. 1504 px szerokości i 1728 px wysokości w oryginale (2 × ramka),
- dolny róg od strony brzegu slajdu (tam stoi podpis autora) ciemny i spokojny,
- w jednym decku każde zdjęcie inne, w podobnej tonacji.

## Jak wybrać

1. Wyszukaj na unsplash.com z hasłami po angielsku, np. `mountain range fog`,
   `mountain valley mist`, `mountain ridge dawn`, `forest mountains aerial`, `alpine peaks clouds`.
   Dodaj filtr orientacji pionowej, jeśli wyszukiwarka na to pozwala.
2. Otwórz stronę zdjęcia i sprawdź:
   - licencja to **Unsplash License** (darmowa); zdjęcia **Unsplash+** są płatne i nie wolno ich brać,
   - autor: nazwa profilu z adresu `unsplash.com/@nazwa`,
   - rozdzielczość i kryteria z sekcji wyżej.
3. Zapisz wybór w `photos.json` w folderze decku (nazwa, adres strony zdjęcia, autor, `alt`,
   punkt kadru `focus`) i dopisz w `brief.md`, dlaczego to zdjęcie pasuje do tezy sekcji.

## Pobieranie

```bash
node scripts/photos.mjs decks/2026-11-16-klient-temat/photos.json
```

Skrypt pobiera zdjęcie zwykłym linkiem pobierania Unsplash (bez klucza API), kadruje do
1504 × 1728 i zapisuje w `screens/`. Wypisuje gotowy HTML ramki z podpisem. Na koniec
`inline-assets.mjs` osadza zdjęcie w pliku.

Gdy w danym środowisku nie da się pobrać pliku (brak sieci, czat bez dostępu do Unsplash):
zostaw w decku zaślepkę `.photo-placeholder`, przekaż użytkownikowi gotowy `photos.json`
z wybranymi zdjęciami i polecenie do uruchomienia u siebie. Nie wstawiaj zdjęcia
z innego źródła i nie generuj go.

## Na slajdzie

```html
<section data-slide class="slide photo-right" aria-hidden="true">   <!-- albo photo-left -->
  <figure class="photo" data-grid="32y" style="--focus: center 40%;">
    <img src="screens/gory-mgla.jpg" alt="Pasma górskie we mgle o świcie">
    <figcaption class="photo-credit"><a href="https://unsplash.com/@autor">@autor</a></figcaption>
  </figure>
  <div class="container">…treść w kolumnie 544 px…</div>
  <footer class="slide-footer">…</footer>
</section>
```

- **Podpis autora** jest obowiązkowy: `@autor` z linkiem do profilu autora na unsplash.com,
  14 px, biały, w wierszu stopki w dolnym rogu zdjęcia od strony brzegu slajdu.
- Gdy dolny róg zdjęcia jest jasny i biały podpis ginie: najpierw zmień kadr (`--focus`) albo
  zdjęcie. Ostateczność: przenieś podpis do stopki po stronie tekstu jako
  „Zdjęcie: @autor, Unsplash” (z tym samym linkiem). Bez teł i cieni pod podpisem.
- `alt` opisuje, co widać (np. „Pasma górskie we mgle o świcie”), nie „zdjęcie dekoracyjne”.
- Strona tekstu: tło `#f7f7f7`, nadtytuł, teza 40 / 64, 2–3 punkty `.points` (do 3 wierszy
  każdy), stopka (z małym logo Ageno, jak na każdym slajdzie). Duże logo Ageno tylko na slajdzie tytułowym.
- Kierunek: zmieniaj stronę zdjęcia między kolejnymi slajdami tego typu, jeśli jest ich kilka.
