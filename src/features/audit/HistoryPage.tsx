import { EmptyState } from '@/components/feedback';
import { Page } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';

/** Segnaposto della sezione Storico, comune a tutti i ruoli. */
export function HistoryPage() {
  const user = useCurrentUser();
  return (
    <Page title={user.role === 'OPERATORE' ? 'Storico e audit' : 'Storico'}>
      <EmptyState title="Sezione non ancora disponibile">
        Lo storico delle certificazioni registrate su blockchain sarà consultabile qui.
      </EmptyState>
    </Page>
  );
}
