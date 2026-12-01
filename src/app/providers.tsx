import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { RealtimeProvider } from '@/realtime';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <RealtimeProvider>{children}</RealtimeProvider>
    </AuthProvider>
  );
}
