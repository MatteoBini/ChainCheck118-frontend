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
