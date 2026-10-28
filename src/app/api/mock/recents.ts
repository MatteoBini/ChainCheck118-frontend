import type { RecentEntry, Role } from '@/types';
import { delay } from './delay';

/** Segnaposto della lista "Recenti": verrà sostituita dallo storico reale. */
export const MOCK_RECENTS: Readonly<Record<Role, readonly RecentEntry[]>> = {
  SOCCORRITORE: [
    { id: 'r-c-1', title: '21 ott · 08:04', subtitle: 'Certificata' },
    { id: 'r-c-2', title: '20 ott · 08:11', subtitle: 'Certificata' },
    { id: 'r-c-3', title: '19 ott · 08:02', subtitle: 'Certificata' },
  ],
  ISPETTORE: [
    { id: 'r-i-1', title: 'BS-MSB-11 · 13 ott', subtitle: 'Conforme' },
    { id: 'r-i-2', title: 'BG-MSA-02 · 12 ott', subtitle: '2 discrepanze' },
    { id: 'r-i-3', title: 'CR-AUT-01 · 9 ott', subtitle: 'Conforme' },
    { id: 'r-i-4', title: 'MN-MSB-07 · 7 ott', subtitle: '1 discrepanza' },
  ],
  OPERATORE: [],
};

export async function mockGetRecents(role: Role): Promise<readonly RecentEntry[]> {
  await delay(200);
  return MOCK_RECENTS[role];
}
