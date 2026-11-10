import { formatShortDate, formatTime } from '@/lib';
import type { InspectionVerdict, RecentEntry, RecentRecord, Role } from '@/types';
import { apiRequest, USE_MOCKS } from '../client';

const RECENTS_LIMIT = 5;

export const VERDICT_LABEL: Readonly<Record<InspectionVerdict, string>> = {
  CONFORME: 'Conforme',
  NON_CONFORME: 'Non conforme',
};

/** Trasforma la voce del backend nelle due righe mostrate nella sidebar. */
function toEntry(record: RecentRecord): RecentEntry {
  const day = formatShortDate(record.at);
  if (record.kind === 'INSPECTION') {
    return { id: record.id, title: `${record.plate} · ${day}`, subtitle: VERDICT_LABEL[record.verdict] };
  }
  const status = record.inspection
    ? `Ispezionata · ${VERDICT_LABEL[record.inspection.verdict].toLowerCase()}`
    : 'Certificata';
  return {
    id: record.id,
    title: `${day} · ${formatTime(record.at)}`,
    subtitle: `${record.plate} · ${status}`,
  };
}

const HISTORY_LIMIT = 50;

async function fetchRecords(role: Role, limit: number, signal?: AbortSignal): Promise<readonly RecentRecord[]> {
  if (USE_MOCKS) return (await import('../mock')).mockGetRecents(role, limit);
  const { items } = await apiRequest<{ items: RecentRecord[] }>(`/recents?limit=${limit}`, signal ? { signal } : {});
  return items;
}

/** Ultime attività dell'utente (checklist certificate o ispezioni, in base al ruolo). */
export async function getRecents(role: Role, signal?: AbortSignal): Promise<readonly RecentEntry[]> {
  return (await fetchRecords(role, RECENTS_LIMIT, signal)).map(toEntry);
}

/** Storico completo (fino a HISTORY_LIMIT voci) per la pagina Storico. */
export function getHistory(role: Role, signal?: AbortSignal): Promise<readonly RecentRecord[]> {
  return fetchRecords(role, HISTORY_LIMIT, signal);
}

/* Notifica alla sidebar che la lista è cambiata (nuova checklist, nuova ispezione, …). */
const RECENTS_CHANGED = 'cc118:recents-changed';
const recentsEvents = new EventTarget();

export function notifyRecentsChanged(): void {
  recentsEvents.dispatchEvent(new Event(RECENTS_CHANGED));
}

/** Registra un listener e restituisce la funzione per rimuoverlo. */
export function onRecentsChanged(listener: () => void): () => void {
  recentsEvents.addEventListener(RECENTS_CHANGED, listener);
  return () => recentsEvents.removeEventListener(RECENTS_CHANGED, listener);
}
