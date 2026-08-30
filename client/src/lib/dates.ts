/** Datas em ISO (YYYY-MM-DD) e formatação em português, tolerante a valores vazios ou inválidos. */

const MONTHS_SHORT = [
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
];
const MONTHS_LONG = [
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
];

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

export function isValidIso(value: string) {
  return parseIso(value) !== null;
}

/** "23 ago 2026" */
export function formatShortDate(value: string) {
  const date = parseIso(value);
  if (!date) return "—";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** "23 de agosto de 2026" */
export function formatLongDate(value: string) {
  const date = parseIso(value);
  if (!date) return "data não informada";
  return `${date.getDate()} de ${MONTHS_LONG[date.getMonth()]} de ${date.getFullYear()}`;
}

/** "23 ago" — usado na régua lateral das atualizações. */
export function formatDayMonth(value: string) {
  const date = parseIso(value);
  if (!date) return "—";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTHS_SHORT[date.getMonth()]}`;
}

function daysSince(value: string): number | null {
  const start = parseIso(value);
  if (!start) return null;
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((today.getTime() - start.getTime()) / DAY_MS);
}

/** "7 dias de obra", "2 meses e 9 dias", "começa em 3 dias". */
export function formatDuration(startDate: string) {
  const days = daysSince(startDate);
  if (days === null) return "duração indisponível";
  if (days < 0) {
    const ahead = Math.abs(days);
    return ahead === 1 ? "começa amanhã" : `começa em ${ahead} dias`;
  }
  if (days === 0) return "começou hoje";
  if (days === 1) return "1 dia de obra";
  if (days < 30) return `${days} dias de obra`;

  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  const monthLabel = months === 1 ? "mês" : "meses";
  if (remainingDays < 7) return `${months} ${monthLabel} de obra`;
  return `${months} ${monthLabel} e ${remainingDays} dias`;
}

/** "Hoje", "Ontem", "23 ago" — para a linha do tempo de atualizações. */
export function formatRelativeDay(value: string) {
  const days = daysSince(value);
  if (days === null) return "—";
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return formatDayMonth(value);
}
