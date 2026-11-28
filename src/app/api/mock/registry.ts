import type { NewUser, UserPatch, UserRecord, VehicleRecord } from '@/types';
import { ApiError } from '../client';
import { delay } from './delay';
import { MOCK_USERS } from './users';

let vehicles: VehicleRecord[] = [
  { id: 1, plate: 'AA111BB' },
  { id: 2, plate: 'CC222DD' },
  { id: 3, plate: 'EE333FF' },
];
let users: UserRecord[] = MOCK_USERS.map((user) => ({ ...user }));

const nextId = (rows: readonly { id: number }[]) => Math.max(0, ...rows.map((row) => row.id)) + 1;

function normalizePlate(plate: string): string {
  const value = plate.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z0-9]{2,10}$/.test(value)) throw new ApiError(400, 'VALIDATION_ERROR', 'Targa di 2-10 caratteri alfanumerici');
  return value;
}

function assertFreePlate(plate: string, exceptId?: number): void {
  if (vehicles.some((v) => v.plate === plate && v.id !== exceptId)) {
    throw new ApiError(409, 'PLATE_TAKEN', `Esiste già un mezzo con targa ${plate}`);
  }
}

function assertFreeUsername(username: string, exceptId?: number): void {
  if (users.some((u) => u.username === username && u.id !== exceptId)) {
    throw new ApiError(409, 'USERNAME_TAKEN', 'Username già in uso');
  }
}

export async function mockListVehicles(): Promise<readonly VehicleRecord[]> {
  await delay(150);
  return vehicles;
}

export async function mockCreateVehicle(raw: string): Promise<VehicleRecord> {
  await delay(150);
  const plate = normalizePlate(raw);
  assertFreePlate(plate);
  const vehicle = { id: nextId(vehicles), plate };
  vehicles = [...vehicles, vehicle];
  return vehicle;
}

export async function mockUpdateVehicle(id: number, raw: string): Promise<VehicleRecord> {
  await delay(150);
  const plate = normalizePlate(raw);
  assertFreePlate(plate, id);
  const vehicle = { id, plate };
  vehicles = vehicles.map((v) => (v.id === id ? vehicle : v));
  return vehicle;
}

export async function mockListUsers(): Promise<readonly UserRecord[]> {
  await delay(150);
  return users;
}

export async function mockCreateUser({ password, ...data }: NewUser): Promise<UserRecord> {
  await delay(150);
  if (password.length < 8) throw new ApiError(400, 'VALIDATION_ERROR', 'La password deve avere almeno 8 caratteri');
  assertFreeUsername(data.username);
  const user = { id: nextId(users), ...data };
  users = [...users, user];
  return user;
}

export async function mockUpdateUser(id: number, { password, ...patch }: UserPatch): Promise<UserRecord> {
  await delay(150);
  if (password !== undefined && password.length < 8) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'La password deve avere almeno 8 caratteri');
  }
  if (patch.username !== undefined) assertFreeUsername(patch.username, id);
  const current = users.find((u) => u.id === id);
  if (!current) throw new ApiError(404, 'USER_NOT_FOUND', 'Utente non trovato');
  const user = { ...current, ...patch };
  users = users.map((u) => (u.id === id ? user : u));
  return user;
}
