import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';

/** Collega l'utente autenticato alla shell, che resta indipendente dalle feature. */
export function ShellLayout() {
  const user = useCurrentUser();
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}
