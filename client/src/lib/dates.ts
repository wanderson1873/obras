/** Datas em ISO (YYYY-MM-DD), formatadas no idioma de quem está lendo. */

import type { Language } from "@/i18n/I18nContext";

const MONTHS_SHORT: Record<Language, string[]> = {
  pt: [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  es: [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ],
};

const MONTHS_LONG: Record<Language, string[]> = {
  pt: [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  es: [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ],
};

const DAY_MS = 86_400_000;

export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Converte ISO em Date local ao meio-dia, evitando o deslocamento de fuso que muda o dia. */
function parseIso(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.trim() ?? "");
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "23 ago 2026" / "Aug 23, 2026" / "23 ago 2026" */
export function formatShortDate(value: string, language: Language) {
  const date = parseIso(value);
  if (!date) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS_SHORT[language][date.getMonth()];
  if (language === "en") return `${month} ${day}, ${date.getFullYear()}`;
  return `${day} ${month} ${date.getFullYear()}`;
}

/** "23 de agosto de 2026" / "August 23, 2026" / "23 de agosto de 2026" */
export function formatLongDate(value: string, language: Language) {
  const date = parseIso(value);
  if (!date) return "";
  const month = MONTHS_LONG[language][date.getMonth()];
  if (language === "en")
    return `${month} ${date.getDate()}, ${date.getFullYear()}`;
  return `${date.getDate()} de ${month} de ${date.getFullYear()}`;
}

/** "23 ago" — usado na régua lateral das atualizações. */
export function formatDayMonth(value: string, language: Language) {
  const date = parseIso(value);
  if (!date) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS_SHORT[language][date.getMonth()];
  return language === "en" ? `${month} ${day}` : `${day} ${month}`;
}

export function daysSince(value: string): number | null {
  const start = parseIso(value);
  if (!start) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / DAY_MS);
}

export function isValidIso(value: string) {
  return parseIso(value) !== null;
}
