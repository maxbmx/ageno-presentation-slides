# AGENTS.md

To repozytorium to skill do prezentacji Ageno w jednym pliku HTML. Instrukcja pracy jest
w `SKILL.md`: przeczytaj go przed każdym zadaniem i otwieraj pliki z `references/`, które wskazuje.
Start każdej prezentacji to kopia `assets/template.html`. Polecenia i kody wyjścia: `README.md`.

## Polecenia

```bash
npm install && npx playwright install chromium   # raz
npm test                                         # testy skryptów
npm run verify                                   # grid-audit i text-lint na szablonie
npm run assets -- --out decks/2026-11-16-klient-temat/
npm run inline -- decks/2026-11-16-klient-temat/index.html --out dist/2026-11-16-klient-temat.html
npm run grid -- dist/2026-11-16-klient-temat.html
npm run lint -- dist/2026-11-16-klient-temat.html
npm run qa -- dist/2026-11-16-klient-temat.html --out decks/2026-11-16-klient-temat/qa
npm run pdf -- dist/2026-11-16-klient-temat.html
```

Kod 0 = OK, 1 = znaleziony problem, 2 = złe wywołanie. Do oddania nadaje się tylko deck,
dla którego `inline`, `grid`, `lint`, `qa` i `pdf` kończą się kodem 0, a zrzuty i PDF są
obejrzane (`references/qa.md`).
