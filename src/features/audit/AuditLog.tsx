import { CircleCheck, CircleX, ClipboardCheck } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getAuditPage, onRecentsChanged, VERDICT_LABEL } from '@/app/api';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import { formatDateTime, formatTime } from '@/lib';
import type { AuditRecord } from '@/types';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      records: readonly AuditRecord[];
      nextCursor: number | null;
      loadingMore: boolean;
      moreError: boolean;
    };

const DAY = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function dayKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function StatusChip({ record }: { record: AuditRecord }) {
  if (!record.inspection) {
    return (
      <span className="chip chip-acc">
        <ClipboardCheck size={14} aria-hidden="true" />
        Certificata
      </span>
    );
  }
  const ok = record.inspection.verdict === 'CONFORME';
  const Icon = ok ? CircleCheck : CircleX;
  return (
    <span className={ok ? 'chip chip-ok' : 'chip chip-bad'}>
      <Icon size={14} aria-hidden="true" />
      {VERDICT_LABEL[record.inspection.verdict]}
    </span>
  );
}

function AuditRow({ record }: { record: AuditRecord }) {
  return (
    <li className="ck-row hist-row">
      <div className="ck-text">
        <time className="mono audit-time" dateTime={record.certifiedAt} title={formatDateTime(record.certifiedAt)}>
          {formatTime(record.certifiedAt)}
        </time>
        <strong className="mono">{record.plate}</strong>
        <span className="hist-desc">
          Checklist di <strong>{record.by.fullName}</strong> <span className="mono">@{record.by.username}</span>
          {record.inspection &&
            ` · ispezionata da ${record.inspection.by.fullName} il ${formatDateTime(record.inspection.inspectedAt)}`}
        </span>
      </div>
      <StatusChip record={record} />
    </li>
  );
}

export function AuditLog() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const controllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    getAuditPage(null, current.signal)
      .then((page) => {
        if (current.signal.aborted) return;
        setState({ status: 'ready', records: page.items, nextCursor: page.nextCursor, loadingMore: false, moreError: false });
      })
      .catch(() => {
        if (!current.signal.aborted) setState({ status: 'error' });
      });
  }, []);

  useEffect(() => {
    reload();
    const unsubscribe = onRecentsChanged(reload);
    return () => {
      unsubscribe();
      controllerRef.current?.abort();
    };
  }, [reload]);

  function loadMore() {
    if (state.status !== 'ready' || state.nextCursor === null || state.loadingMore) return;
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    setState({ ...state, loadingMore: true, moreError: false });
    getAuditPage(state.nextCursor, current.signal)
      .then((page) => {
        if (current.signal.aborted) return;
        setState((prev) =>
          prev.status === 'ready'
            ? { ...prev, records: [...prev.records, ...page.items], nextCursor: page.nextCursor, loadingMore: false }
            : prev,
        );
      })
      .catch(() => {
        if (current.signal.aborted) return;
        setState((prev) => (prev.status === 'ready' ? { ...prev, loadingMore: false, moreError: true } : prev));
      });
  }

  let content;
  if (state.status === 'loading') {
    content = <LoadingScreen label="Caricamento dello storico…" />;
  } else if (state.status === 'error') {
    content = (
      <EmptyState title="Storico non raggiungibile">
        Impossibile caricare lo storico. Controlla la connessione e riprova.
      </EmptyState>
    );
  } else if (state.records.length === 0) {
    content = (
      <EmptyState title="Nessuna checklist registrata">
        Le checklist certificate dagli equipaggi compariranno qui.
      </EmptyState>
    );
  } else {
    const groups: { key: string; label: string; records: AuditRecord[] }[] = [];
    for (const record of state.records) {
      const key = dayKey(record.certifiedAt);
      const last = groups[groups.length - 1];
      if (last?.key === key) last.records.push(record);
      else groups.push({ key, label: DAY.format(new Date(record.certifiedAt)), records: [record] });
    }

    content = (
      <>
        {groups.map((group) => (
          <section key={group.key} className="audit-day" aria-label={group.label}>
            <h2 className="audit-day-title">{group.label}</h2>
            <ul className="card ck-list">
              {group.records.map((record) => (
                <AuditRow key={record.id} record={record} />
              ))}
            </ul>
          </section>
        ))}
        {state.nextCursor !== null && (
          <div className="audit-more">
            {state.moreError && <span className="hist-desc">Caricamento non riuscito.</span>}
            <button type="button" className="btn" onClick={loadMore} disabled={state.loadingMore}>
              {state.loadingMore ? 'Caricamento…' : 'Carica checklist precedenti'}
            </button>
          </div>
        )}
      </>
    );
  }

  return <Page title="Storico e audit">{content}</Page>;
}
