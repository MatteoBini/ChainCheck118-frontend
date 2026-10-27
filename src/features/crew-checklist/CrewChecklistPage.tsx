import { EmptyState } from '@/components/feedback';
import { Page } from '@/components/layout';

/** Segnaposto: la compilazione della checklist arriva nella fase 2. */
export function CrewChecklistPage() {
  return (
    <Page title="Checklist del mezzo">
      <EmptyState title="Checklist in preparazione">
        Qui l'equipaggio compilerà e firmerà la checklist del mezzo.
      </EmptyState>
    </Page>
  );
}
