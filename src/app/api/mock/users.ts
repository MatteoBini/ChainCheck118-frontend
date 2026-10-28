import type { Credentials, User } from '@/types';
import { ApiError } from '../client';
import { delay } from './delay';

const SESSION_KEY = 'cc118.mock.session';

/** Stessi utenti e password creati da prisma/seed.ts nel backend. */
export const MOCK_PASSWORD = 'password123';

export const MOCK_USERS: readonly User[] = [
  { id: 1, username: 'operatore', fullName: 'Marco Rossi', role: 'OPERATORE' },
  { id: 2, username: 'soccorritore', fullName: 'Giulia Bianchi', role: 'SOCCORRITORE' },
  { id: 3, username: 'ispettore', fullName: 'Luca Verdi', role: 'ISPETTORE' },
];

function readSession(): User | null {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeSession(user: User | null): void {
  try {
    if (user) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessione solo in memoria */
  }
}

let current: User | null = readSession();

export async function mockGetMe(): Promise<User | null> {
  await delay(150);
  return current ? { ...current } : null;
}

export async function mockSignIn({ username, password }: Credentials): Promise<User> {
  await delay();
  const user = MOCK_USERS.find((u) => u.username === username.trim());
  if (!user || password !== MOCK_PASSWORD) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Username o password non corretti');
  }
  current = { ...user };
  writeSession(current);
  return { ...current };
}

export async function mockSignOut(): Promise<void> {
  await delay(100);
  current = null;
  writeSession(null);
}
