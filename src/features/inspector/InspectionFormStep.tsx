import { useId, useState, type FormEvent } from 'react';
import { ApiError, submitInspection } from '@/app/api';
import { Page } from '@/components/layout';
import { ChecklistItemRow } from '@/features/crew-checklist';
import type { InspectionResult, ItemOutcome, ItemResult, PendingInspection, VehicleChecklist } from '@/types';

interface InspectionFormStepProps {
  pending: PendingInspection;
  checklist: VehicleChecklist;
  onDone: (result: InspectionResult) => void;
  onChangeVehicle: () => void;
}

export function InspectionFormStep({ pending, checklist, onDone, onChangeVehicle }: InspectionFormStepProps) {
  const formId = useId();
  const { items } = checklist;
  // Una checklist certificata ha sempre tutte le voci PRESENTE: lo impone assertAllPresent lato backend.
  const declared: ItemResult[] = items.map((item) => ({ itemId: item.id, outcome: 'PRESENTE' as ItemOutcome }));
  const [observed, setObserved] = useState<Readonly<Record<number, ItemOutcome>>>({});
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const results: ItemResult[] = items.flatMap((item) => {
    const outcome = observed[item.id];
    return outcome ? [{ itemId: item.id, outcome }] : [];
  });
  const complete = results.length === items.length;
  const hasDiscrepancy = results.some((result) => result.outcome !== 'PRESENTE');

  function choose(itemId: number, outcome: ItemOutcome) {
    setObserved((prev) => ({ ...prev, [itemId]: outcome }));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      onDone(await submitInspection(pending.plate, declared, results, note.trim() || undefined));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status < 500
          ? err.message
          : 'Invio non riuscito. Controlla la connessione e riprova.',
      );
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!complete || submitting) return;
    void submit();
  }

  return (
    <Page
      title={`Ispezione ${pending.plate}`}
      actions={
        <button type="button" className="btn" disabled={submitting} onClick={onChangeVehicle}>
          Torna alla coda
        </button>
      }
      footer={
        <>
          <div className="ck-foot-status">
            <span className="num">
              {results.length}/{items.length} voci compilate
            </span>
            <p role="alert" className="msg msg-bad">{error}</p>
          </div>
          <button type="submit" form={formId} className="btn btn-p" disabled={!complete || submitting}>
            {submitting ? 'Invio in corso…' : 'Conferma ispezione'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate>
        <ul className="card ck-list">
          {items.map((item, index) => (
            <ChecklistItemRow
              key={item.id}
              id={`${formId}-item-${item.id}`}
              index={index}
              item={item}
              value={observed[item.id]}
              rejected={false}
              disabled={submitting}
              onChange={(outcome) => choose(item.id, outcome)}
            />
          ))}
        </ul>
        {hasDiscrepancy && (
          <div className="field">
            <label htmlFor={`${formId}-note`} className="field-label">
              Nota per il soccorritore (opzionale)
            </label>
            <textarea
              id={`${formId}-note`}
              className="input"
              rows={3}
              maxLength={500}
              value={note}
              disabled={submitting}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
      </form>
    </Page>
  );
}
