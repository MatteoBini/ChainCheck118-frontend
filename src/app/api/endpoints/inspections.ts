import type { InspectionReportEntry, InspectionResult, ItemResult, PendingInspection } from '@/types';
import { apiRequest } from '../client';
import { notifyRecentsChanged } from './recents';

export async function getPendingInspections(signal?: AbortSignal): Promise<readonly PendingInspection[]> {
  const { items } = await apiRequest<{ items: PendingInspection[] }>(
    '/inspections/pending',
    signal ? { signal } : {},
  );
  return items;
}

export async function submitInspection(
  plate: string,
  declared: readonly ItemResult[],
  observed: readonly ItemResult[],
  note?: string,
): Promise<InspectionResult> {
  const result = await apiRequest<InspectionResult>('/inspections', {
    method: 'POST',
    body: { plate, declared, observed, note },
  });
  notifyRecentsChanged();
  return result;
}

export async function getMyReports(signal?: AbortSignal): Promise<readonly InspectionReportEntry[]> {
  const { items } = await apiRequest<{ items: InspectionReportEntry[] }>('/reports', signal ? { signal } : {});
  return items;
}
