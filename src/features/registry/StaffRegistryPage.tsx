import { useMemo } from 'react';
import { createUser, listUsers, updateUser } from '@/app/api';
import { DataGrid, type GridColumn, type GridDraft } from '@/components/data-grid';
import { EmptyState, LoadingScreen } from '@/components/feedback';
import { Page } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';
import type { Role, UserPatch, UserRecord } from '@/types';
import { optimisticUpdate, useRemoteRows } from './useRemoteRows';

const ROLE_OPTIONS: readonly { value: Role; label: string }[] = [
  { value: 'SOCCORRITORE', label: 'Soccorritore' },
  { value: 'ISPETTORE', label: 'Ispettore' },
  { value: 'OPERATORE', label: 'Operatore' },
];

const roleLabel = (role: Role) => ROLE_OPTIONS.find((option) => option.value === role)?.label ?? role;
const isRole = (value: string): value is Role => ROLE_OPTIONS.some((option) => option.value === value);

const INITIAL_DRAFT: GridDraft = { fullName: '', username: '', password: '', role: 'SOCCORRITORE' };

export function StaffRegistryPage() {
  const me = useCurrentUser();
  const { status, rows, setRows, reload } = useRemoteRows(listUsers);

  const columns = useMemo<readonly GridColumn<UserRecord>[]>(
    () => [
      {
        key: 'fullName',
        label: 'Nome e cognome',
        width: 260,
        required: true,
        draftPlaceholder: 'Nome e cognome',
        display: (user) => user.fullName,
      },
      {
        key: 'username',
        label: 'Username',
        width: 190,
        mono: true,
        required: true,
        draftPlaceholder: 'Username',
        display: (user) => user.username,
      },
      {
        key: 'password',
        label: 'Password',
        width: 170,
        editor: 'password',
        muted: true,
        required: true,
        placeholder: 'Nuova password',
        draftPlaceholder: 'Min. 8 caratteri',
        display: () => '••••••••',
        editValue: () => '',
        sortValue: () => '',
      },
      {
        key: 'role',
        label: 'Ruolo',
        width: 180,
        editor: 'select',
        options: ROLE_OPTIONS,
        display: (user) => roleLabel(user.role),
        editValue: (user) => user.role,
        editable: (user) => user.id !== me.id,
        lockedReason: 'Non puoi modificare il tuo stesso ruolo',
      },
    ],
    [me.id],
  );

  async function handleCreate(draft: GridDraft) {
    const role = draft.role ?? '';
    const user = await createUser({
      fullName: (draft.fullName ?? '').trim(),
      username: (draft.username ?? '').trim(),
      password: draft.password ?? '',
      role: isRole(role) ? role : 'SOCCORRITORE',
    });
    setRows((prev) => [...prev, user]);
  }

  function handleUpdate(user: UserRecord, key: string, value: string) {
    let patch: UserPatch;
    if (key === 'password') patch = { password: value };
    else if (key === 'role' && isRole(value)) patch = { role: value };
    else if (key === 'fullName') patch = { fullName: value.trim() };
    else if (key === 'username') patch = { username: value.trim() };
    else return Promise.resolve();

    const { password: _password, ...visible } = patch;
    return optimisticUpdate(setRows, user, { ...user, ...visible }, updateUser(user.id, patch));
  }

  let content;
  if (status === 'loading') {
    content = <LoadingScreen label="Caricamento del personale…" />;
  } else if (status === 'error') {
    content = (
      <EmptyState title="Anagrafica non raggiungibile">
        Impossibile caricare il personale. Controlla la connessione e{' '}
        <button type="button" className="link" onClick={reload}>
          riprova
        </button>
        .
      </EmptyState>
    );
  } else {
    content = (
      <DataGrid
        label="Anagrafica personale"
        rows={rows}
        columns={columns}
        storageKey="cc118.grid.staff.order"
        initialDraft={INITIAL_DRAFT}
        noun={['persona', 'persone']}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    );
  }

  return (
    <Page title="Anagrafica personale" width="fill">
      {content}
    </Page>
  );
}
