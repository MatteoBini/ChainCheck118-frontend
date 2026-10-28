import type { Credentials, User } from '@/types';
import { ApiError, apiRequest, getToken, setToken, USE_MOCKS } from '../client';
import { mockGetMe, mockSignIn, mockSignOut } from '../mock';

interface LoginResponse {
  token: string;
  user: User;
}

interface MeResponse {
  user: User;
}

/** Utente della sessione corrente, o null se non autenticato. */
export async function getMe(): Promise<User | null> {
  if (USE_MOCKS) return mockGetMe();
  if (!getToken()) return null;
  try {
    const { user } = await apiRequest<MeResponse>('/auth/me');
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      setToken(null);
      return null;
    }
    throw error;
  }
}

export async function signIn(credentials: Credentials): Promise<User> {
  if (USE_MOCKS) return mockSignIn(credentials);
  const { token, user } = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username: credentials.username, password: credentials.password },
  });
  setToken(token);
  return user;
}

/** Il JWT non ha stato sul server: uscire significa scartare il token. */
export async function signOut(): Promise<void> {
  if (USE_MOCKS) return mockSignOut();
  setToken(null);
}
