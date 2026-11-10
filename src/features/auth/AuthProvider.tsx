import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '@/app/api';
import type { Credentials, User } from '@/types';
import { AuthContext, type AuthContextValue } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthContextValue['status']>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getMe()
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setStatus('ready');
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (credentials: Credentials) => {
    const me = await api.signIn(credentials);
    setUser(me);
    return me;
  }, []);

  const signOut = useCallback(async () => {
    await api.signOut();
    setUser(null);
  }, []);

  // Token rifiutato dal backend: chiude la sessione.
  useEffect(() => {
    api.setUnauthorizedHandler(() => void signOut());
    return () => api.setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signOut }),
    [status, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
