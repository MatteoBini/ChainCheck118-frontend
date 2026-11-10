import type { CertifiedChecklist, ItemResult, VehicleChecklist } from '@/types';
import { apiRequest } from '../client';
import { notifyRecentsChanged } from './recents';

export async function getVehicleChecklist(plate: string, signal?: AbortSignal): Promise<VehicleChecklist> {
  return apiRequest<VehicleChecklist>(`/vehicles/${encodeURIComponent(plate)}`, signal ? { signal } : {});
}

export async function submitChecklist(
  plate: string,
  items: readonly ItemResult[],
): Promise<CertifiedChecklist> {
  const certified = await apiRequest<CertifiedChecklist>('/checklists', {
    method: 'POST',
    body: { plate, items },
  });
  notifyRecentsChanged();
  return certified;
}
