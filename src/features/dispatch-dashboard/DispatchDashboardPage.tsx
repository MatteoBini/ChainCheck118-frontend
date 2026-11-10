import { CircleAlert, CircleCheck, CircleX, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getVehiclesOverview, onRecentsChanged, VERDICT_LABEL } from '@/app/api';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import { daysAgo, formatDateTime, formatRelative, formatTime } from '@/lib';
import type { VehicleOverview } from '@/types';

/** Ogni quanto la panoramica si aggiorna da sola. */
const REFRESH_MS = 60_000;

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; vehicles: readonly VehicleOverview[]; updatedAt: Date; stale: boolean };

type Freshness = 'TODAY' | 'OLD' | 'NEVER';

function freshnessOf(vehicle: VehicleOverview): Freshness {
  if (!vehicle.lastChecklist) return 'NEVER';
  return daysAgo(vehicle.lastChecklist.certifiedAt) === 0 ? 'TODAY' : 'OLD';
}

function FreshnessChip({ vehicle }: { vehicle: VehicleOverview }) {
  const freshness = freshnessOf(vehicle);
  if (freshness === 'TODAY') {
    return (
      <span className="chip chip-ok">
        <CircleCheck size={14} aria-hidden="true" />
        Controllato oggi
      </span>
    );
  }
  if (freshness === 'OLD') {
    const days = daysAgo(vehicle.lastChecklist!.certifiedAt);
    return (
      <span className="chip chip-warn">
        <CircleAlert size={14} aria-hidden="true" />
        {days === 1 ? 'Da 1 giorno' : `Da ${days} giorni`}
      </span>
    );
  }
  return (
    <span className="chip chip-bad">
      <CircleX size={14} aria-hidden="true" />
      Mai controllato
    </span>
  );
}

function VehicleRow({ vehicle }: { vehicle: VehicleOverview }) {
  const last = vehicle.lastChecklist;
  return (
    <li className="ck-row">
      <div className="ck-text dash-text">
        <strong className="mono dash-plate">{vehicle.plate}</strong>
        {last ? (
          <span className="hist-desc">
            Ultima checklist{' '}
            <time dateTime={last.certifiedAt} title={formatDateTime(last.certifiedAt)}>
              {formatRelative(last.certifiedAt)}
            </time>{' '}
            · {last.by.fullName}
            {last.inspection && ` · ispezione ${VERDICT_LABEL[last.inspection.verdict].toLowerCase()}`}
          </span>
        ) : (
          <span className="hist-desc">Nessuna checklist registrata</span>
        )}
      </div>
      <FreshnessChip vehicle={vehicle} />
    </li>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' }) {
  return (
    <div className={tone ? `card stat stat-${tone}` : 'card stat'}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

/** Panoramica della centrale: per ogni mezzo, quando è stata fatta l'ultima checklist. */
export function DispatchDashboardPage() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    getVehiclesOverview(current.signal)
      .then((vehicles) => {
        if (!current.signal.aborted) setState({ status: 'ready', vehicles, updatedAt: new Date(), stale: false });
      })
      .catch(() => {
        if (current.signal.aborted) return;
        // se avevamo già dei dati li teniamo, segnalando che non sono aggiornati
        setState((prev) => (prev.status === 'ready' ? { ...prev, stale: true } : { status: 'error' }));
      });
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    const unsubscribe = onRecentsChanged(load);
    return () => {
      window.clearInterval(timer);
      unsubscribe();
      controllerRef.current?.abort();
    };
  }, [load]);

  const actions =
    state.status === 'ready' ? (
      <>
        <span className={state.stale ? 'dash-updated is-stale' : 'dash-updated'}>
          {state.stale ? 'Aggiornamento non riuscito · dati delle' : 'Aggiornato alle'} {formatTime(state.updatedAt.toISOString())}
        </span>
        <button type="button" className="btn" onClick={load}>
          <RefreshCw size={16} aria-hidden="true" />
          Aggiorna
        </button>
      </>
    ) : undefined;

  let content;
  if (state.status === 'loading') {
    content = <LoadingScreen label="Caricamento dei mezzi…" />;
  } else if (state.status === 'error') {
    content = (
      <EmptyState title="Panoramica non raggiungibile">
        Impossibile caricare lo stato dei mezzi. Controlla la connessione e riprova.
      </EmptyState>
    );
  } else if (state.vehicles.length === 0) {
    content = <EmptyState title="Nessun mezzo registrato">I mezzi registrati compariranno qui.</EmptyState>;
  } else {
    const checkedToday = state.vehicles.filter((vehicle) => freshnessOf(vehicle) === 'TODAY').length;
    content = (
      <>
        <div className="stats">
          <Stat label="Mezzi" value={state.vehicles.length} />
          <Stat label="Controllati oggi" value={checkedToday} tone="ok" />
          <Stat label="Da controllare oggi" value={state.vehicles.length - checkedToday} tone="warn" />
        </div>
        <ul className="card ck-list" aria-label="Ultima checklist per mezzo">
          {state.vehicles.map((vehicle) => (
            <VehicleRow key={vehicle.id} vehicle={vehicle} />
          ))}
        </ul>
      </>
    );
  }

  return (
    <Page title="Panoramica mezzi" width="wide" actions={actions}>
      {content}
    </Page>
  );
}
