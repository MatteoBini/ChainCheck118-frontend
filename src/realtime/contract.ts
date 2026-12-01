// Contratto Socket.IO della mappa in tempo reale.
// Copia dei tipi del backend: riferimento in ChainCheck118-backend/docs/architecture.md
// (sezione "Contratto Socket.IO"). Va tenuto allineato a mano.

import type { Role } from '@/types';

export type TrackedRole = Exclude<Role, 'OPERATORE'>;

export interface Zone {
  readonly id: string;
  readonly name: string;
  readonly lat: number;
  readonly lng: number;
  readonly radiusM: number;
}

export interface Presence {
  readonly userId: number;
  readonly fullName: string;
  readonly role: TrackedRole;
  readonly lat: number;
  readonly lng: number;
  /** ISO, orologio del server. */
  readonly updatedAt: string;
}

export interface HandshakeAuth {
  token: string;
  tabId: string;
  takeover: boolean;
}

/** Valori di `connect_error.message` restituiti dal server. */
export type ConnectErrorCode = 'UNAUTHORIZED' | 'ALREADY_OPEN' | 'UNAVAILABLE';

export type UpdateAck =
  | { ok: true }
  | { ok: false; code: 'FORBIDDEN_ROLE' | 'INVALID_PAYLOAD' | 'OUT_OF_ZONE' | 'RATE_LIMITED' };

type Empty = Record<string, never>;

export interface ServerToClientEvents {
  'session:replaced': (payload: Empty) => void;
  'session:expired': (payload: Empty) => void;
  'location:config': (payload: { zones: Zone[]; intervalMs: number }) => void;
  'presence:snapshot': (payload: { users: Presence[] }) => void;
  'presence:update': (payload: Presence) => void;
  'presence:remove': (payload: { userId: number; reason: 'DISCONNECTED' | 'STALE' }) => void;
}

export interface ClientToServerEvents {
  'location:update': (payload: { lat: number; lng: number }, ack?: (result: UpdateAck) => void) => void;
}
