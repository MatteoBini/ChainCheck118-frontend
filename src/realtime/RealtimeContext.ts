import { createContext } from 'react';
import type { Presence } from './contract';

/**
 * - `disabled`: nessun utente oppure modalità mock (niente JWT vero).
 * - `connecting`: primo collegamento o "Usa qui" in corso.
 * - `connected`: socket attivo.
 * - `offline`: collegamento perso, riconnessione in corso (la simulazione continua in locale).
 * - `blocked`: l'app è aperta in un'altra scheda.
 */
export type RealtimeStatus = 'disabled' | 'connecting' | 'connected' | 'offline' | 'blocked';

export interface OwnPosition {
  readonly lat: number;
  readonly lng: number;
  readonly zoneName: string;
}

export interface RealtimeContextValue {
  status: RealtimeStatus;
  /** Solo SOCCORRITORE e ISPETTORE: la propria posizione simulata. */
  ownPosition: OwnPosition | null;
  /** Solo OPERATORE: le posizioni di tutti, per userId. */
  presences: ReadonlyMap<number, Presence>;
  /** "Usa qui": riprende la sessione da un'altra scheda. */
  takeOver: () => void;
}

export const RealtimeContext = createContext<RealtimeContextValue | null>(null);
