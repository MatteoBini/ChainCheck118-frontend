import { EmptyState } from '@/components/feedback';
import { Page } from '@/components/layout';

export function InspectorPage() {
  return (
    <Page title="Nuova ispezione">
      <EmptyState title="Ispezione in preparazione">
        Qui l'ispettore identificherà il mezzo e ricompilerà la checklist.
      </EmptyState>
    </Page>
  );
}
