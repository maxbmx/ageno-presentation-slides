# Screeny

Zdjęcia klimatyczne (góry, Unsplash) mają osobne zasady: `references/zdjecia.md`.

Screen to dowód tezy slajdu, nie dekoracja. Każdy ma opis w stopce slajdu: co widać, adres,
data zrzutu (np. „Screen: sklep.klient.pl/koszyk, 2026-11-16”) i `alt` w `<img>`.

## Ramki z siatki

Najpierw wybierz ramkę (`full`, `wide`, `half`, `mobile`), potem zrób zrzut w tych samych
proporcjach. Wtedy obraz wypełnia ramkę bez kadrowania. Wymiary ramek na slajdzie, viewporty
zrzutów, skala 2× i jakość JPEG: `references/siatka.md`, „Ramki screenów”.

## Zrzut automatyczny

W folderze decku utwórz `screens.json`:

```json
[
  { "name": "home", "url": "https://sklep.klient.pl", "frame": "wide",
    "hide": ["#cookie-banner", ".chat-widget"] },
  { "name": "koszyk-mobile", "url": "https://sklep.klient.pl/koszyk", "frame": "mobile",
    "waitFor": ".cart", "delay": 400 }
]
```

Zrzuty robi `scripts/screenshots.mjs` (polecenie: `README.md`). Pliki trafiają do `screens/`
obok `screens.json` jako `nazwa.jpg`.

- `hide` ukrywa banery cookies, czaty i popupy przez CSS. Nie klikaj zgód w cudzym serwisie.
- Strony za logowaniem, koszyk z produktami, panel admina: zrzut ręczny użytkownika.
- Fragment niżej na stronie: `scrollY`.
- `delay`: pauza przed zrzutem w ms, domyślnie 400 (`SCREENSHOT_DELAY_MS` w `scripts/constants.mjs`);
  dłuższa tylko dla stron z animacją wejścia.

## Zrzut ręczny

Gdy użytkownik dostarcza gotowe pliki:

1. Sprawdź proporcje. Jeśli nie pasują do żadnej ramki, wybierz najbliższą i ustal, co może
   zostać ucięte (domyślnie `object-position: top`, ucina się dół).
2. Nigdy nie rozciągaj obrazu (`object-fit: fill`) i nie zmieniaj ramki na wymiar spoza siatki.
3. Za mały obraz (węższy niż ramka × 1,5) będzie miękki: powiedz o tym użytkownikowi.

## Osadzanie

- W trakcie pracy: `<img src="screens/home.jpg" alt="…">` w `index.html` decku.
- Na koniec `scripts/inline-assets.mjs` zamienia lokalne obrazy na data URI; plik ponad 15 MB kończy go kodem 1.
- Za duży plik: mniej screenów albo ramka `half` zamiast `full`. Jakości JPEG nie obniżaj
  dla jednego decku (stała 80 w `scripts/constants.mjs`).

## Wygląd

- `object-fit: cover; object-position: top` jest w klasie `.shot`.
- Bez ramek urządzeń, cieni i zaokrągleń. Jasny screen zlewa się z tłem: dodaj `.shot-edge`
  (outline 1 px, nie zmienia wymiaru).
- Nie retuszuj screenów i nie zmieniaj w nich danych.
- Dane osobowe, ceny zakupu, dane klientów końcowych: zasłoń jednolitym blokiem w `--c-text`
  i powiedz o tym użytkownikowi w podsumowaniu.
