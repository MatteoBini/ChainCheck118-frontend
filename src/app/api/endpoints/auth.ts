import type { Credentials, User } from '@/types';
import { ApiError, apiRequest, getToken, setToken, USE_MOCKS } from '../client';

/** Import dinamico: i mock restano fuori dal bundle principale. */
const loadMocks = () => import('../mock');

interface LoginResponse {
  token: string;
  user: User;
}

interface MeResponse {
  user: User;
}

export async function getMe(): Promise<User | null> {
  if (USE_MOCKS) return (await loadMocks()).mockGetMe();
  if (!getToken()) return null;
  try {
    const { user } = await apiRequest<MeResponse>('/auth/me');
    return user;
  } catch (error) {
    // apiRequest ha già scartato il token.
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function signIn(credentials: Credentials): Promise<User> {
  if (USE_MOCKS) return (await loadMocks()).mockSignIn(credentials);
  const { token, user } = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { username: credentials.username, password: credentials.password },
  });
  setToken(token);
  return user;
}

/** JWT stateless: basta scartare il token. */
export async function signOut(): Promise<void> {
  if (USE_MOCKS) return (await loadMocks()).mockSignOut();
  setToken(null);
}
