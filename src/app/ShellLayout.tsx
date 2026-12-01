import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';
import { OtherTabScreen, useRealtime } from '@/realtime';

export function ShellLayout() {
  const user = useCurrentUser();
  const { status } = useRealtime();
  // Scheda unica: se l'app è aperta altrove, qui si mostra solo il blocco.
  if (status === 'blocked') return <OtherTabScreen />;
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}
