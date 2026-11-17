import { useCallback, useEffect, useRef, useState } from 'react';
import { getMyReports, onRecentsChanged } from '@/app/api';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import { formatDateTime } from '@/lib';
import type { InspectionReportEntry } from '@/types';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; reports: readonly InspectionReportEntry[] };

export function MyReportsPage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    getMyReports(current.signal)
      .then((reports) => {
        if (!current.signal.aborted) setState({ status: 'ready', reports });
      })
      .catch(() => {
        if (!current.signal.aborted) setState({ status: 'error' });
      });
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = onRecentsChanged(load);
    return () => {
      unsubscribe();
      controllerRef.current?.abort();
    };
  }, [load]);

  let content;
  if (state.status === 'loading') {
    content = <LoadingScreen label="Caricamento delle segnalazioni…" />;
  } else if (state.status === 'error') {
    content = (
      <EmptyState title="Segnalazioni non raggiungibili">
        Impossibile caricare le segnalazioni. Controlla la connessione e riprova.
      </EmptyState>
    );
  } else if (state.reports.length === 0) {
    content = <EmptyState title="Nessuna segnalazione">Qui compariranno le checklist respinte dagli ispettori.</EmptyState>;
  } else {
    content = (
      <ul className="card ck-list" aria-label="Segnalazioni ricevute">
        {state.reports.map((report) => (
          <li key={report.id} className="ck-row">
            <div className="ck-text">
              <strong className="mono">{report.plate}</strong>
              <span className="hist-desc">
                Ispezionata il {formatDateTime(report.inspectedAt)} da {report.inspector.fullName}
              </span>
              {report.note && <span className="hist-desc">Nota: {report.note}</span>}
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return <Page title="Segnalazioni">{content}</Page>;
}
