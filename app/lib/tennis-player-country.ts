/** ISO 3166-1 alpha-2 en minúsculas; "clay" = fallback tierra batida RG. */
export type TennisCountryCode = string;

const PLAYER_COUNTRY: Record<string, TennisCountryCode> = {
  // ATP — top & RG 2025/26 field
  "jannik sinner": "it",
  "carlos alcaraz": "es",
  "novak djokovic": "rs",
  "alexander zverev": "de",
  "daniil medvedev": "ru",
  "andrey rublev": "ru",
  "stefanos tsitsipas": "gr",
  "casper ruud": "no",
  "taylor fritz": "us",
  "tommy paul": "us",
  "ben shelton": "us",
  "frances tiafoe": "us",
  "alex de minaur": "au",
  "alexander blockx": "be",
  "holger rune": "dk",
  "hubert hurkacz": "pl",
  "lorenzo musetti": "it",
  "matteo berrettini": "it",
  "flavio cobolli": "it",
  "luca van assche": "fr",
  "ugo humbert": "fr",
  "arthur fils": "fr",
  "gabriel diallo": "ca",
  "felix auger-aliassime": "ca",
  "denis shapovalov": "ca",
  "cameron norrie": "gb",
  "jack draper": "gb",
  "dan evans": "gb",
  "karen khachanov": "ru",
  "grigor dimitrov": "bg",
  "sebastian korda": "us",
  "francisco cerundolo": "ar",
  "juan martin del potro": "ar",
  "tomas martin etcheverry": "ar",
  "mariano navone": "ar",
  "pedro cachin": "ar",
  "jannik sinner (ita)": "it",
  "carlos alcaraz (esp)": "es",
  // WTA
  "iga swiatek": "pl",
  "aryna sabalenka": "by",
  "coco gauff": "us",
  "jessica pegula": "us",
  "elena rybakina": "kz",
  "madison keys": "us",
  "mirra andreeva": "ru",
  "qwen wen": "cn",
  "zheng qinwen": "cn",
  "maria sakkari": "gr",
  "jasmine paolini": "it",
  "emma navarro": "us",
  "danielle collins": "us",
  "barbora krejcikova": "cz",
  "marketa vondrousova": "cz",
  "ons jabeur": "tn",
  "caroline garcia": "fr",
  "daria kasatkina": "ru",
  "paula badosa": "es",
  "sara sorribes tormo": "es",
  "cristina bucsa": "es",
  "rebecca sramkova": "sk",
  "donna vekic": "hr",
  "amanda anisimova": "us",
  "naomi osaka": "jp",
  "bianca andreescu": "ca",
  "leylah fernandez": "ca",
};

const LASTNAME_COUNTRY: Record<string, TennisCountryCode> = {
  sinner: "it",
  alcaraz: "es",
  djokovic: "rs",
  zverev: "de",
  medvedev: "ru",
  rublev: "ru",
  tsitsipas: "gr",
  ruud: "no",
  fritz: "us",
  shelton: "us",
  tiafoe: "us",
  "de minaur": "au",
  blockx: "be",
  rune: "dk",
  hurkacz: "pl",
  musetti: "it",
  berrettini: "it",
  swiatek: "pl",
  sabalenka: "by",
  gauff: "us",
  pegula: "us",
  rybakina: "kz",
  nadal: "es",
  federer: "ch",
  murray: "gb",
  badosa: "es",
  paolini: "it",
  andreeva: "ru",
};

export function normalizeTennisPlayerName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lastNameKey(name: string): string | null {
  const parts = normalizeTennisPlayerName(name).split(" ");
  if (parts.length < 2) return parts[0] ?? null;

  const last = parts[parts.length - 1];
  const prev = parts[parts.length - 2];
  if (prev === "de" || prev === "van" || prev === "del") {
    return `${prev} ${last}`;
  }
  return last;
}

/** Resuelve bandera por nombre de tenista; fallback tierra batida si no hay match. */
export function resolveTennisPlayerCountry(name?: string | null): TennisCountryCode {
  if (!name?.trim()) return "clay";

  const normalized = normalizeTennisPlayerName(name);
  if (PLAYER_COUNTRY[normalized]) return PLAYER_COUNTRY[normalized];

  const last = lastNameKey(name);
  if (last && LASTNAME_COUNTRY[last]) return LASTNAME_COUNTRY[last];

  return "clay";
}

export function tennisFlagUrl(code: TennisCountryCode, width = 640): string | null {
  if (!code || code === "clay") return null;
  return `https://flagcdn.com/w${width}/${code}.png`;
}
