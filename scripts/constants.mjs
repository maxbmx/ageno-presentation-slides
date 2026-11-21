/**
 * Jedno miejsce stałych dla skryptów w scripts/.
 *
 * ZMIANA KTÓREJKOLWIEK LICZBY BEZ TAKIEJ SAMEJ ZMIANY W references/siatka.md (geometria,
 * typografia) ALBO W PLIKU WSKAZANYM PRZY STAŁEJ JEST BŁĘDEM. Opis dla człowieka jest
 * w references/, ten moduł tylko go powtarza dla kodu. Szablon assets/template.html jest
 * samodzielny i ma własne kopie (tokeny CSS w :root, SLIDE_W / SLIDE_H w skrypcie); przy
 * zmianie geometrii popraw też szablon i uruchom grid-audit.mjs.
 */

/** Siatka: wiersz i krawędzie bloków co 32 px, szerokości wewnętrzne co 8 px (references/siatka.md). */
export const GRID = { module: 32, unit: 8 };

/** Płótno slajdu 16:9 w px logicznych (references/siatka.md, „Płótno”). */
export const CANVAS = { width: 1536, height: 864 };

/** Kontener treści: x 112–1424, y 64–768, czyli 1312 × 704 (references/siatka.md). */
export const CONTAINER = { x0: 112, x1: 1424, y0: 64, y1: 768, width: 1312, height: 704 };

/** Budżet wysokości treści w kontenerze (references/siatka.md, „Budżet wysokości kontenera”). */
export const HEIGHT_BUDGET = CONTAINER.height;

/** Stopka: jeden wiersz 32 px na y = 800 (references/siatka.md). */
export const FOOTER = { y: 800, height: 32 };

/**
 * Ramki screenów: wymiar na slajdzie i viewport zrzutu w tych samych proporcjach
 * (references/siatka.md, „Ramki screenów”).
 */
export const FRAMES = {
  full:   { frame: [1312, 608], viewport: [1312, 608], mobile: false },
  wide:   { frame: [864, 544],  viewport: [1296, 816], mobile: false },
  half:   { frame: [640, 416],  viewport: [1280, 832], mobile: false },
  mobile: { frame: [320, 640],  viewport: [400, 800],  mobile: true },
};

/** Gęstość pikseli zrzutów i zdjęć (references/siatka.md, „Ramki screenów”). */
export const DEVICE_SCALE = 2;

/** Ramka zdjęcia w układzie „Zdjęcie + treść”: 752 × 864 na slajdzie (references/siatka.md). */
export const PHOTO_FRAME = [752, 864];

/** Jakość JPEG zrzutów (screenshots.mjs) i zdjęć z Unsplash (photos.mjs) (references/siatka.md). */
export const JPEG_QUALITY = 80;

/** Okna sprawdzane przez qa-html-deck.mjs (README.md, „Kontrola”). */
export const QA_VIEWPORTS = [[1600, 900], [1366, 768], [1280, 720], [1280, 800]];

/** Nawigacja szablonu: autoukrywanie strzałek i przejście (references/nawigacja.md). */
export const NAV = { hideAfterMs: 1800, transitionMs: 200 };

/** Limit rozmiaru złożonego pliku HTML w MB (inline-assets.mjs, references/nawigacja.md, „Jeden plik”). */
export const MAX_DECK_MB = 15;

/**
 * Osoby na slajd „Kontakt”: plik = slug imienia i nazwiska (people/<slug>.png w szablonie).
 * Źródło prawdy: tabela w references/ageno.md, sekcja „Osoby”. Nowa osoba: najpierw wiersz
 * tam (imię, rola, e-mail, telefon, adres zdjęcia), potem wpis tutaj z tym samym adresem.
 */
export const PEOPLE = [
  { file: "maksymilian-sleziak.png", url: "https://ageno.pl/wp-content/uploads/2023/04/image-15-1.png" },
];
