import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/feedback';
import { PATHS } from '@/components/layout';
import { useAuth } from '@/features/auth';

/** Lascia passare solo utenti autenticati; altrimenti rimanda all'accesso. */
export function RequireAuth() {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingScreen label="Verifica della sessione…" />;
  if (!user) {
    return <Navigate to={PATHS.login} replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}
