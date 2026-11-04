import type { CertifiedChecklist, ItemResult, VehicleChecklist } from '@/types';
import { apiRequest } from '../client';

/** Voci della checklist (dal DB del backend) e stato di oggi per il mezzo indicato (targa). */
export async function getVehicleChecklist(plate: string, signal?: AbortSignal): Promise<VehicleChecklist> {
  return apiRequest<VehicleChecklist>(`/vehicles/${encodeURIComponent(plate)}`, signal ? { signal } : {});
}

/** Invia la checklist completa: il backend la certifica e restituisce gli estremi della registrazione. */
export async function submitChecklist(
  plate: string,
  items: readonly ItemResult[],
): Promise<CertifiedChecklist> {
  return apiRequest<CertifiedChecklist>('/checklists', {
    method: 'POST',
    body: { plate, items },
  });
}
