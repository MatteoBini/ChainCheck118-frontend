const DATE_TIME = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' });
const TIME = new Intl.DateTimeFormat('it-IT', { timeStyle: 'short' });

/** Data e ora (ISO dal backend) nel formato italiano, es. "4 nov 2026, 08:04". */
export function formatDateTime(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}

/** Solo l'ora, es. "08:04". */
export function formatTime(iso: string): string {
  return TIME.format(new Date(iso));
}

const SHORT_DATE = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' });

/** Giorno e mese abbreviato, es. "4 nov". */
export function formatShortDate(iso: string): string {
  return SHORT_DATE.format(new Date(iso));
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Giorni di calendario trascorsi dalla data indicata (0 = oggi). */
export function daysAgo(iso: string, now: Date = new Date()): number {
  return Math.round((startOfDay(now) - startOfDay(new Date(iso))) / 86_400_000);
}

/** Data relativa leggibile, es. "oggi alle 08:04", "ieri alle 07:52", "4 nov 2026, 08:04". */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const days = daysAgo(iso, now);
  if (days === 0) return `oggi alle ${formatTime(iso)}`;
  if (days === 1) return `ieri alle ${formatTime(iso)}`;
  return formatDateTime(iso);
}
