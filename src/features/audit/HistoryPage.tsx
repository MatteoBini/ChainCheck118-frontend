import { CircleCheck, CircleX, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getHistory, onRecentsChanged, VERDICT_LABEL } from '@/app/api';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';
import { formatDateTime } from '@/lib';
import type { InspectionVerdict, RecentRecord, Role } from '@/types';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; role: Role; records: readonly RecentRecord[] };

function VerdictChip({ verdict }: { verdict: InspectionVerdict }) {
  const ok = verdict === 'CONFORME';
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <span className={ok ? 'chip chip-ok' : 'chip chip-bad'}>
      <Icon size={14} aria-hidden="true" />
      {VERDICT_LABEL[verdict]}
    </span>
  );
}

function RecordStatus({ record }: { record: RecentRecord }) {
  if (record.kind === 'INSPECTION') return <VerdictChip verdict={record.verdict} />;
  if (record.inspection) return <VerdictChip verdict={record.inspection.verdict} />;
  return (
    <span className="chip chip-acc">
      <ClipboardCheck size={14} aria-hidden="true" />
      Certificata
    </span>
  );
}

function describe(record: RecentRecord): string {
  if (record.kind === 'INSPECTION') return `Ispezione del ${formatDateTime(record.at)}`;
  const base = `Checklist certificata il ${formatDateTime(record.at)}`;
  return record.inspection ? `${base} · ispezionata` : base;
}

/** Storico delle checklist certificate / ispezioni dell'utente. */
export function HistoryPage() {
  const user = useCurrentUser();
  const [params] = useSearchParams();
  const selectedId = params.get('voce');
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let controller: AbortController | null = null;

    function load() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      getHistory(user.role, current.signal)
        .then((records) => {
          if (!current.signal.aborted) setState({ status: 'ready', role: user.role, records });
        })
        .catch(() => {
          if (!current.signal.aborted) setState({ status: 'error' });
        });
    }

    load();
    const unsubscribe = onRecentsChanged(load);
    return () => {
      unsubscribe();
      controller?.abort();
    };
  }, [user.role]);

  // porta in vista la voce scelta dai "Recenti"
  useEffect(() => {
    if (state.status !== 'ready' || !selectedId) return;
    document.getElementById(`hist-${selectedId}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [state, selectedId]);

  const title = user.role === 'OPERATORE' ? 'Storico e audit' : 'Storico';

  let content;
  if (state.status === 'loading' || (state.status === 'ready' && state.role !== user.role)) {
    content = <LoadingScreen label="Caricamento dello storico…" />;
  } else if (state.status === 'error') {
    content = (
      <EmptyState title="Storico non raggiungibile">
        Impossibile caricare lo storico. Controlla la connessione e riprova.
      </EmptyState>
    );
  } else if (state.records.length === 0) {
    content = (
      <EmptyState title="Nessuna attività registrata">
        {user.role === 'ISPETTORE'
          ? 'Le ispezioni che registrerai compariranno qui.'
          : 'Le checklist certificate compariranno qui.'}
      </EmptyState>
    );
  } else {
    content = (
      <ul className="card ck-list" aria-label={title}>
        {state.records.map((record) => {
          const selected = record.id === selectedId;
          return (
            <li
              key={record.id}
              id={`hist-${record.id}`}
              className={selected ? 'ck-row hist-row is-selected' : 'ck-row hist-row'}
              aria-current={selected ? 'true' : undefined}
            >
              <div className="ck-text">
                <strong className="mono">{record.plate}</strong>
                <span className="hist-desc">{describe(record)}</span>
              </div>
              <RecordStatus record={record} />
            </li>
          );
        })}
      </ul>
    );
  }

  return <Page title={title}>{content}</Page>;
}
