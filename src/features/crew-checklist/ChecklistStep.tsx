import { useId, useState, type FormEvent } from 'react';
import { ApiError, submitChecklist } from '@/app/api';
import { Page } from '@/components/layout';
import { formatTime } from '@/lib';
import type { CertifiedChecklist, ItemOutcome, ItemResult, VehicleChecklist } from '@/types';
import { ChecklistItemRow } from './ChecklistItemRow';

interface ChecklistStepProps {
  checklist: VehicleChecklist;
  onCertified: (result: CertifiedChecklist) => void;
  onChangeVehicle: () => void;
}

/** Voci indicate in error.details.items dal backend (CHECKLIST_NOT_COMPLIANT). */
function rejectedItemIds(details: unknown): ReadonlySet<number> {
  if (typeof details !== 'object' || details === null || !('items' in details) || !Array.isArray(details.items)) {
    return new Set();
  }
  return new Set(
    details.items.flatMap((entry: unknown) =>
      typeof entry === 'object' && entry !== null && 'itemId' in entry && typeof entry.itemId === 'number'
        ? [entry.itemId]
        : [],
    ),
  );
}

/** Secondo passo: un esito per ogni voce, poi l'invio al backend per la certificazione. */
export function ChecklistStep({ checklist, onCertified, onChangeVehicle }: ChecklistStepProps) {
  const formId = useId();
  const { vehicle, items, today } = checklist;
  const [outcomes, setOutcomes] = useState<Readonly<Record<number, ItemOutcome>>>({});
  const [rejected, setRejected] = useState<ReadonlySet<number>>(() => new Set());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results: ItemResult[] = items.flatMap((item) => {
    const outcome = outcomes[item.id];
    return outcome ? [{ itemId: item.id, outcome }] : [];
  });
  const complete = results.length === items.length;
  const rowId = (itemId: number) => `${formId}-item-${itemId}`;

  function choose(itemId: number, outcome: ItemOutcome) {
    setOutcomes((prev) => ({ ...prev, [itemId]: outcome }));
    setRejected((prev) => {
      if (!prev.has(itemId)) return prev;
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }

  async function submit() {
    setPending(true);
    setError(null);
    try {
      onCertified(await submitChecklist(vehicle.plate, results));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CHECKLIST_NOT_COMPLIANT') {
        const ids = rejectedItemIds(err.details);
        setRejected(ids);
        setError(`${err.message}. Ripristina le voci evidenziate prima di certificare.`);
        const [first] = ids;
        if (first !== undefined) {
          document.getElementById(rowId(first))?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      } else {
        setError(
          err instanceof ApiError && err.status < 500
            ? err.message
            : 'Invio non riuscito. Controlla la connessione e riprova.',
        );
      }
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete || pending) return;
    void submit();
  }

  return (
    <Page
      title={`Checklist ${vehicle.plate}`}
      actions={
        <button type="button" className="btn" disabled={pending} onClick={onChangeVehicle}>
          Cambia mezzo
        </button>
      }
      footer={
        <>
          <div className="ck-foot-status">
            <span className="num">
              {results.length}/{items.length} voci compilate
            </span>
            <p role="alert" className="msg msg-bad">
              {error}
            </p>
          </div>
          <button type="submit" form={formId} className="btn btn-p" disabled={!complete || pending}>
            {pending ? 'Certificazione in corso…' : 'Certifica checklist'}
          </button>
        </>
      }
    >
      {today.status === 'CERTIFIED' && (
        <p className="card ck-note">
          Questo mezzo ha già una checklist certificata oggi alle {formatTime(today.certifiedAt)}
          {today.inspected ? ', già ispezionata' : ''}. Se ne certifichi un'altra, l'ispezione farà
          riferimento a quella nuova.
        </p>
      )}
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <ul className="card ck-list">
          {items.map((item, index) => (
            <ChecklistItemRow
              key={item.id}
              id={rowId(item.id)}
              index={index}
              item={item}
              value={outcomes[item.id]}
              rejected={rejected.has(item.id)}
              disabled={pending}
              onChange={(outcome) => choose(item.id, outcome)}
            />
          ))}
        </ul>
      </form>
    </Page>
  );
}
