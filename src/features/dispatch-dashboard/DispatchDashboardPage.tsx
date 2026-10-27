import { EmptyState } from '@/components/feedback';
import { Page } from '@/components/layout';

/** Segnaposto: la dashboard arriva nella fase 4. */
export function DispatchDashboardPage() {
  return (
    <Page title="Panoramica mezzi" width="wide">
      <EmptyState title="Dashboard in preparazione">
        Qui la centrale vedrà lo stato delle checklist di tutti i mezzi in tempo reale.
      </EmptyState>
    </Page>
  );
}
