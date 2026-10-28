import type { RecentEntry, Role } from '@/types';
import { MOCK_RECENTS } from '../mock';

/** Segnaposto: per ora restituisce sempre i dati mockati. */
export function getRecents(role: Role): readonly RecentEntry[] {
  return MOCK_RECENTS[role];
}
