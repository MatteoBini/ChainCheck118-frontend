import type { RecentRecord, Role } from '@/types';
import { delay } from './delay';

const day = (offset: number, time: string) => {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  const [h = 8, m = 0] = time.split(':').map(Number);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

/** Dati di prova nello stesso formato di GET /recents. */
export const MOCK_RECENTS: Readonly<Record<Role, readonly RecentRecord[]>> = {
  SOCCORRITORE: [
    { id: 'checklist-3', kind: 'CHECKLIST', plate: 'BS-MSB-11', at: day(0, '08:04'), inspection: null },
    { id: 'checklist-2', kind: 'CHECKLIST', plate: 'BS-MSB-11', at: day(1, '08:11'), inspection: { verdict: 'CONFORME' } },
    { id: 'checklist-1', kind: 'CHECKLIST', plate: 'BG-MSA-02', at: day(2, '08:02'), inspection: null },
  ],
  ISPETTORE: [
    { id: 'inspection-3', kind: 'INSPECTION', plate: 'BS-MSB-11', at: day(1, '10:30'), verdict: 'CONFORME' },
    { id: 'inspection-2', kind: 'INSPECTION', plate: 'BG-MSA-02', at: day(2, '11:15'), verdict: 'NON_CONFORME' },
    { id: 'inspection-1', kind: 'INSPECTION', plate: 'CR-AUT-01', at: day(5, '09:40'), verdict: 'CONFORME' },
  ],
  OPERATORE: [],
};

export async function mockGetRecents(role: Role, limit: number): Promise<readonly RecentRecord[]> {
  await delay(200);
  return MOCK_RECENTS[role].slice(0, limit);
}
