import type { Role } from './user';

export interface VehicleRecord {
  readonly id: number;
  readonly plate: string;
}

export interface UserRecord {
  readonly id: number;
  readonly username: string;
  readonly fullName: string;
  readonly role: Role;
}

export interface NewUser {
  username: string;
  fullName: string;
  password: string;
  role: Role;
}

/** Password vuota o assente = invariata. */
export type UserPatch = Partial<NewUser>;
