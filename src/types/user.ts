/** Ruolo applicativo (enum Role del backend): assegnato dal server, mai modificabile dal client. */
export type Role = 'OPERATORE' | 'SOCCORRITORE' | 'ISPETTORE';

/** Utente come restituito da POST /auth/login e GET /auth/me. */
export interface User {
  readonly id: number;
  readonly username: string;
  readonly fullName: string;
  readonly role: Role;
}

export interface Credentials {
  username: string;
  password: string;
}
