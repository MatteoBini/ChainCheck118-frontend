import { Navigate } from 'react-router-dom';
import { homePathFor } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';

export function HomeRedirect() {
  const user = useCurrentUser();
  return <Navigate to={homePathFor(user.role)} replace />;
}
