import { Navigate, Outlet } from 'react-router-dom';
import { homePathFor } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';
import type { Role } from '@/types';

interface RequireRoleProps {
  roles: readonly Role[];
}

/** Solo filtro di navigazione: i permessi li verifica il backend. */
export function RequireRole({ roles }: RequireRoleProps) {
  const user = useCurrentUser();
  if (!roles.includes(user.role)) return <Navigate to={homePathFor(user.role)} replace />;
  return <Outlet />;
}
