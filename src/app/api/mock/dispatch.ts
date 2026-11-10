import type { AuditPage, AuditRecord, UserRef, VehicleOverview } from '@/types';
import { delay } from './delay';

const ago = (days: number, time: string) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const [h = 8, m = 0] = time.split(':').map(Number);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

const CREW: UserRef = { id: 2, username: 'soccorritore', fullName: 'Giulia Bianchi' };
const INSPECTOR: UserRef = { id: 3, username: 'ispettore', fullName: 'Luca Verdi' };

const MOCK_AUDIT: readonly AuditRecord[] = [
  { id: 6, plate: 'AA111BB', certifiedAt: ago(0, '08:04'), by: CREW, inspection: null },
  { id: 5, plate: 'CC222DD', certifiedAt: ago(1, '07:52'), by: CREW, inspection: { verdict: 'CONFORME', inspectedAt: ago(1, '10:30'), by: INSPECTOR } },
  { id: 4, plate: 'AA111BB', certifiedAt: ago(1, '08:11'), by: CREW, inspection: null },
  { id: 3, plate: 'CC222DD', certifiedAt: ago(3, '08:02'), by: CREW, inspection: { verdict: 'NON_CONFORME', inspectedAt: ago(3, '11:15'), by: INSPECTOR } },
  { id: 2, plate: 'AA111BB', certifiedAt: ago(4, '07:45'), by: CREW, inspection: null },
  { id: 1, plate: 'AA111BB', certifiedAt: ago(6, '08:20'), by: CREW, inspection: null },
];

const MOCK_PLATES = ['AA111BB', 'CC222DD', 'EE333FF'];

export async function mockGetVehiclesOverview(): Promise<readonly VehicleOverview[]> {
  await delay(200);
  return MOCK_PLATES.map((plate, index) => {
    const last = MOCK_AUDIT.find((record) => record.plate === plate);
    return {
      id: index + 1,
      plate,
      lastChecklist: last
        ? {
            submissionId: last.id,
            certifiedAt: last.certifiedAt,
            by: last.by,
            inspection: last.inspection ? { verdict: last.inspection.verdict } : null,
          }
        : null,
    };
  });
}

export async function mockGetAuditPage(cursor: number | null, limit: number): Promise<AuditPage> {
  await delay(200);
  const start = cursor === null ? 0 : MOCK_AUDIT.findIndex((record) => record.id === cursor) + 1;
  const items = MOCK_AUDIT.slice(start, start + limit);
  const hasMore = start + limit < MOCK_AUDIT.length;
  return { items, nextCursor: hasMore ? (items[items.length - 1]?.id ?? null) : null };
}
