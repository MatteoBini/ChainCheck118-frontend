import { formatShortDate, formatTime } from '@/lib';
import type { InspectionVerdict, RecentEntry, RecentRecord, Role } from '@/types';
import { apiRequest, USE_MOCKS } from '../client';

const RECENTS_LIMIT = 5;

export const VERDICT_LABEL: Readonly<Record<InspectionVerdict, string>> = {
  CONFORME: 'Conforme',
  NON_CONFORME: 'Non conforme',
};

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

export async function getRecents(role: Role, signal?: AbortSignal): Promise<readonly RecentEntry[]> {
  return (await fetchRecords(role, RECENTS_LIMIT, signal)).map(toEntry);
}

export function getHistory(role: Role, signal?: AbortSignal): Promise<readonly RecentRecord[]> {
  return fetchRecords(role, HISTORY_LIMIT, signal);
}

/** Emesso dopo l'invio di una checklist, per aggiornare le liste aperte. */
const RECENTS_CHANGED = 'cc118:recents-changed';
const recentsEvents = new EventTarget();

export function notifyRecentsChanged(): void {
  recentsEvents.dispatchEvent(new Event(RECENTS_CHANGED));
}

export function onRecentsChanged(listener: () => void): () => void {
  recentsEvents.addEventListener(RECENTS_CHANGED, listener);
  return () => recentsEvents.removeEventListener(RECENTS_CHANGED, listener);
}
