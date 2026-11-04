import { useId, useState, type FormEvent } from 'react';
import { ApiError, getVehicleChecklist } from '@/app/api';
import { Page } from '@/components/layout';
import type { VehicleChecklist } from '@/types';

interface VehicleStepProps {
  onLoaded: (checklist: VehicleChecklist) => void;
}

/** Primo passo: il soccorritore indica il mezzo e carica le voci della checklist. */
export function VehicleStep({ onLoaded }: VehicleStepProps) {
  const ids = useId();
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plate = code.trim().toUpperCase();

  async function load() {
    setPending(true);
    setError(null);
    try {
      onLoaded(await getVehicleChecklist(plate));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setError(`Nessun mezzo con targa ${plate}.`);
      // Gli altri errori del backend (es. 401) hanno già un messaggio leggibile: mostrarlo aiuta a capire il problema.
      else if (err instanceof ApiError && err.status < 500) setError(err.message);
      else setError('Caricamento non riuscito. Controlla la connessione e riprova.');
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plate || pending) return;
    void load();
  }

  return (
    <Page title="Checklist del mezzo" width="narrow">
      <form className="card card-pad form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor={`${ids}-plate`} className="field-label">
            Targa del mezzo
          </label>
          <input
            id={`${ids}-plate`}
            className="input mono"
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={code}
            required
            aria-invalid={error !== null}
            aria-describedby={`${ids}-hint`}
            onChange={(e) => setCode(e.target.value)}
          />
          <span id={`${ids}-hint`} className="field-hint">
            Es. AA111BB
          </span>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-p" disabled={!plate || pending}>
            {pending ? 'Caricamento…' : 'Apri checklist'}
          </button>
        </div>
        <p role="alert" className="msg msg-bad">
          {error}
        </p>
      </form>
    </Page>
  );
}
