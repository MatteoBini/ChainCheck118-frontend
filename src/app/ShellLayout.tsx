import { Outlet } from 'react-router-dom';
import { AppShell } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';

export function ShellLayout() {
  const user = useCurrentUser();
  return (
    <AppShell user={user}>
      <Outlet />
    </AppShell>
  );
}
