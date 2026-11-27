import type { NewUser, UserPatch, UserRecord, VehicleRecord } from '@/types';
import { apiRequest, USE_MOCKS } from '../client';

const mocks = () => import('../mock');

export async function listVehicles(signal?: AbortSignal): Promise<readonly VehicleRecord[]> {
  if (USE_MOCKS) return (await mocks()).mockListVehicles();
  const { items } = await apiRequest<{ items: VehicleRecord[] }>('/vehicles', signal ? { signal } : {});
  return items.map(({ id, plate }) => ({ id, plate }));
}

export async function createVehicle(plate: string): Promise<VehicleRecord> {
  if (USE_MOCKS) return (await mocks()).mockCreateVehicle(plate);
  return (await apiRequest<{ vehicle: VehicleRecord }>('/vehicles', { method: 'POST', body: { plate } })).vehicle;
}

export async function updateVehicle(id: number, plate: string): Promise<VehicleRecord> {
  if (USE_MOCKS) return (await mocks()).mockUpdateVehicle(id, plate);
  return (await apiRequest<{ vehicle: VehicleRecord }>(`/vehicles/${id}`, { method: 'PATCH', body: { plate } })).vehicle;
}

export async function listUsers(signal?: AbortSignal): Promise<readonly UserRecord[]> {
  if (USE_MOCKS) return (await mocks()).mockListUsers();
  return (await apiRequest<{ items: UserRecord[] }>('/users', signal ? { signal } : {})).items;
}

export async function createUser(user: NewUser): Promise<UserRecord> {
  if (USE_MOCKS) return (await mocks()).mockCreateUser(user);
  return (await apiRequest<{ user: UserRecord }>('/users', { method: 'POST', body: { ...user } })).user;
}

export async function updateUser(id: number, patch: UserPatch): Promise<UserRecord> {
  if (USE_MOCKS) return (await mocks()).mockUpdateUser(id, patch);
  return (await apiRequest<{ user: UserRecord }>(`/users/${id}`, { method: 'PATCH', body: { ...patch } })).user;
}
