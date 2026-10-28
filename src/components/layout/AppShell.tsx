import type { ReactNode } from 'react';
import type { User } from '@/types';
import { Sidebar } from './Sidebar';
import { useSidebarCollapsed } from './useSidebarCollapsed';

interface AppShellProps {
  user: User;
  children: ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [collapsed, toggle] = useSidebarCollapsed();
  return (
    <div className="app">
      <Sidebar user={user} collapsed={collapsed} onToggle={toggle} />
      <main className="main">{children}</main>
    </div>
  );
}
