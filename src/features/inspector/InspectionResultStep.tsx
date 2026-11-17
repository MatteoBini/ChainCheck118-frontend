import { CircleCheck, CircleX } from 'lucide-react';
import { VERDICT_LABEL } from '@/app/api';
import { Page } from '@/components/layout';
import { formatDateTime } from '@/lib';
import type { InspectionResult } from '@/types';

interface InspectionResultStepProps {
  result: InspectionResult;
  onNew: () => void;
}

export function InspectionResultStep({ result, onNew }: InspectionResultStepProps) {
  const ok = result.verdict === 'CONFORME';
  const Icon = ok ? CircleCheck : CircleX;

  return (
    <Page
      title="Ispezione registrata"
      width="narrow"
      actions={
        <button type="button" className="btn btn-p" onClick={onNew}>
          Nuova ispezione
        </button>
      }
    >
      <section className="card card-pad cert">
        <span className={ok ? 'chip chip-ok' : 'chip chip-bad'}>
          <Icon size={14} aria-hidden="true" />
          {VERDICT_LABEL[result.verdict]}
        </span>
        <p className="cert-lead">
          Checklist del mezzo <strong className="mono">{result.plate}</strong> ispezionata il{' '}
          {formatDateTime(result.inspectedAt)}.
        </p>
        {result.discrepancies.length > 0 && (
          <ul className="card ck-list">
            {result.discrepancies.map((discrepancy) => (
              <li key={discrepancy.itemId} className="ck-row">
                <span className="ck-desc">{discrepancy.description}</span>
                <span className="hist-desc">
                  dichiarato {discrepancy.declared} · osservato {discrepancy.observed}
                </span>
              </li>
            ))}
          </ul>
        )}
        {result.note && <p className="hist-desc">Nota: {result.note}</p>}
        <dl className="cert-data">
          <div>
            <dt>Record</dt>
            <dd className="mono">{result.recordId}</dd>
          </div>
          <div>
            <dt>Hash</dt>
            <dd className="mono">{result.hash}</dd>
          </div>
          <div>
            <dt>Transazione</dt>
            <dd className="mono">{result.txHash}</dd>
          </div>
        </dl>
      </section>
    </Page>
  );
}
