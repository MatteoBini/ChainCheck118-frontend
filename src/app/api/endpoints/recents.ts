import type { RecentEntry, Role } from '@/types';
import { USE_MOCKS } from '../client';

/** Il backend non espone ancora lo storico: meglio una lista vuota che dati inventati. */
export async function getRecents(role: Role): Promise<readonly RecentEntry[]> {
  if (USE_MOCKS) return (await import('../mock')).mockGetRecents(role);
  return [];
}
