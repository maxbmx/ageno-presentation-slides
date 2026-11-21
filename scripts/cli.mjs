/**
 * Wspólna umowa CLI skryptów (README.md, sekcja „Umowa CLI”):
 *  - argumenty pozycyjne to pliki wejściowe, opcje mają postać --nazwa wartość (np. --out),
 *  - brak argumentu, nadmiarowy argument, nieznana opcja, opcja bez wartości, zła wartość
 *    albo brak pliku wejściowego: komunikat po polsku i kod 2, zanim skrypt uruchomi
 *    przeglądarkę albo cokolwiek zapisze,
 *  - -h / --help: sama instrukcja użycia, kod 0.
 * Kod 1 oznacza, że skrypt zadziałał i znalazł problem; kod 0, że problemów nie ma.
 */
import { parseArgs } from "node:util";
import { statSync } from "node:fs";

/** Komunikat o złym wywołaniu i kod 2. */
export function usageError(usage, message) {
  console.error(`BŁĄD: ${message}`);
  console.error(`Użycie: ${usage}`);
  process.exit(2);
}

function describe(error) {
  const token = ((error.message.match(/'([^']+)'/) || [])[1] || "").split(" ")[0] || undefined;
  switch (error.code) {
    case "ERR_PARSE_ARGS_UNKNOWN_OPTION": return `nieznana opcja ${token ?? ""}`.trim();
    case "ERR_PARSE_ARGS_INVALID_OPTION_VALUE": return `opcja ${token ?? ""} wymaga wartości`.replace(/\s+/g, " ");
    default: return error.message;
  }
}

/**
 * @param {{ usage: string, options?: Record<string, {type: "string" | "boolean"}>, positionals?: [number, number] }} spec
 * @returns {{ values: Record<string, string | boolean | undefined>, positionals: string[] }}
 */
export function parseCli({ usage, options = {}, positionals: [min, max] = [0, 0] }) {
  let parsed;
  try {
    parsed = parseArgs({
      args: process.argv.slice(2),
      options: { ...options, help: { type: "boolean", short: "h" } },
      allowPositionals: true,
      strict: true,
    });
  } catch (error) {
    usageError(usage, describe(error));
  }
  const { values, positionals } = parsed;
  if (values.help) {
    console.log(`Użycie: ${usage}`);
    process.exit(0);
  }
  delete values.help;
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "string" && (value === "" || value.startsWith("-"))) usageError(usage, `opcja --${name} wymaga wartości`);
  }
  if (positionals.length < min) usageError(usage, "brak wymaganego argumentu");
  if (positionals.length > max) usageError(usage, `nadmiarowy argument: ${positionals.slice(max).join(" ")}`);
  return { values, positionals };
}

/** Plik wejściowy musi istnieć; inaczej kod 2. */
export function requireFile(usage, file) {
  let ok = false;
  try { ok = statSync(file).isFile(); } catch { ok = false; }
  if (!ok) usageError(usage, `nie ma pliku ${file}`);
  return file;
}

/** Adres http(s); inaczej kod 2. */
export function requireUrl(usage, name, value) {
  try {
    const url = new URL(value);
    if (/^https?:$/.test(url.protocol)) return url.href;
  } catch { /* niżej */ }
  return usageError(usage, `opcja --${name} wymaga adresu http(s), podano: ${value}`);
}
