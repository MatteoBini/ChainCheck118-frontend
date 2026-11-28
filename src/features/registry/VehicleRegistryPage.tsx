import { createVehicle, listVehicles, updateVehicle } from '@/app/api';
import { DataGrid, type GridColumn, type GridDraft } from '@/components/data-grid';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import type { VehicleRecord } from '@/types';
import { optimisticUpdate, useRemoteRows } from './useRemoteRows';

const COLUMNS: readonly GridColumn<VehicleRecord>[] = [
  {
    key: 'plate',
    label: 'Targa',
    width: 280,
    mono: true,
    required: true,
    draftPlaceholder: 'Targa, es. AB123CD',
    display: (vehicle) => vehicle.plate,
  },
];

const INITIAL_DRAFT: GridDraft = { plate: '' };

export function VehicleRegistryPage() {
  const { status, rows, setRows, reload } = useRemoteRows(listVehicles);

  async function handleCreate(draft: GridDraft) {
    const vehicle = await createVehicle((draft.plate ?? '').trim());
    setRows((prev) => [...prev, vehicle]);
  }

  function handleUpdate(vehicle: VehicleRecord, _key: string, value: string) {
    const plate = value.replace(/\s+/g, '').toUpperCase();
    return optimisticUpdate(setRows, vehicle, { ...vehicle, plate }, updateVehicle(vehicle.id, plate));
  }

  let content;
  if (status === 'loading') {
    content = <LoadingScreen label="Caricamento dei mezzi…" />;
  } else if (status === 'error') {
    content = (
      <EmptyState title="Anagrafica non raggiungibile">
        Impossibile caricare i mezzi. Controlla la connessione e{' '}
        <button type="button" className="link" onClick={reload}>
          riprova
        </button>
        .
      </EmptyState>
    );
  } else {
    content = (
      <DataGrid
        label="Anagrafica mezzi"
        rows={rows}
        columns={COLUMNS}
        storageKey="cc118.grid.vehicles.order"
        initialDraft={INITIAL_DRAFT}
        noun={['mezzo', 'mezzi']}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <Page title="Anagrafica mezzi" width="fill">
      {content}
    </Page>
  );
}
