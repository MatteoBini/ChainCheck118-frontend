import { CircleCheck } from 'lucide-react';
import { Page } from '@/components/layout';
import { formatDateTime } from '@/lib';
import type { CertifiedChecklist } from '@/types';

interface CertifiedStepProps {
  result: CertifiedChecklist;
  onNew: () => void;
}

/** Ultimo passo: estremi della certificazione restituiti dal backend. */
export function CertifiedStep({ result, onNew }: CertifiedStepProps) {
  return (
    <Page
      title="Checklist certificata"
      width="narrow"
      actions={
        <button type="button" className="btn btn-p" onClick={onNew}>
          Nuova checklist
        </button>
      }
    >
      <section className="card card-pad cert">
        <span className="chip chip-ok">
          <CircleCheck size={14} aria-hidden="true" />
          Certificata
        </span>
        <p className="cert-lead">
          Checklist del mezzo <strong className="mono">{result.plate}</strong> certificata il{' '}
          {formatDateTime(result.certifiedAt)}.
        </p>
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
