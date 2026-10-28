import { createContext } from 'react';
import type { Credentials, User } from '@/types';

export interface AuthContextValue {
  status: 'loading' | 'ready';
  user: User | null;
  signIn: (credentials: Credentials) => Promise<User>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
