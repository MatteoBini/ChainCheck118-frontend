import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, getPendingInspections, getVehicleChecklist, onRecentsChanged } from '@/app/api';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import { formatTime } from '@/lib';
import type { PendingInspection, VehicleChecklist } from '@/types';

interface PendingQueueStepProps {
  onSelected: (pending: PendingInspection, checklist: VehicleChecklist) => void;
}

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; items: readonly PendingInspection[] };

export function PendingQueueStep({ onSelected }: PendingQueueStepProps) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    getPendingInspections(current.signal)
      .then((items) => {
        if (!current.signal.aborted) setState({ status: 'ready', items });
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

  async function open(pending: PendingInspection) {
    setOpeningId(pending.submissionId);
    setOpenError(null);
    try {
      const checklist = await getVehicleChecklist(pending.plate);
      onSelected(pending, checklist);
    } catch (err) {
      setOpenError(
        err instanceof ApiError && err.status < 500
          ? err.message
          : 'Apertura della checklist non riuscita. Riprova.',
      );
      setOpeningId(null);
    }
  }

  let content;
  if (state.status === 'loading') {
    content = <LoadingScreen label="Caricamento delle checklist da ispezionare…" />;
  } else if (state.status === 'error') {
    content = (
      <EmptyState title="Coda non raggiungibile">
        Impossibile caricare le checklist in attesa. Controlla la connessione e riprova.
      </EmptyState>
    );
  } else if (state.items.length === 0) {
    content = (
      <EmptyState title="Nessuna checklist in attesa">
        Le checklist certificate oggi dai soccorritori compariranno qui.
      </EmptyState>
    );
  } else {
    content = (
      <ul className="card ck-list" aria-label="Checklist da ispezionare">
        {state.items.map((item) => (
          <li key={item.submissionId} className="ck-row">
            <div className="ck-text">
              <strong className="mono">{item.plate}</strong>
              <span className="hist-desc">
                Certificata alle {formatTime(item.certifiedAt)} da {item.by.fullName}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-p"
              disabled={openingId !== null}
              onClick={() => void open(item)}
            >
              {openingId === item.submissionId ? 'Apertura…' : 'Ispeziona'}
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Page title="Checklist da ispezionare">
      {content}
      {openError && <p role="alert" className="msg msg-bad">{openError}</p>}
    </Page>
  );
}
