import type { AuditPage, VehicleOverview } from '@/types';
import { apiRequest, USE_MOCKS } from '../client';

/** Panoramica della centrale: tutti i mezzi con l'ultima checklist certificata. */
export async function getVehiclesOverview(signal?: AbortSignal): Promise<readonly VehicleOverview[]> {
  if (USE_MOCKS) return (await import('../mock')).mockGetVehiclesOverview();
  const { items } = await apiRequest<{ items: VehicleOverview[] }>('/vehicles', signal ? { signal } : {});
  return items;
}

export const AUDIT_PAGE_SIZE = 30;

/** Storico e audit: checklist di tutti i mezzi dalla più recente, una pagina alla volta. */
export async function getAuditPage(cursor: number | null, signal?: AbortSignal): Promise<AuditPage> {
  if (USE_MOCKS) return (await import('../mock')).mockGetAuditPage(cursor, AUDIT_PAGE_SIZE);
  const query = new URLSearchParams({ limit: String(AUDIT_PAGE_SIZE) });
  if (cursor !== null) query.set('cursor', String(cursor));
  return apiRequest<AuditPage>(`/checklists?${query.toString()}`, signal ? { signal } : {});
}
