import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

type Status = 'loading' | 'error' | 'ready';

interface RemoteRows<R> {
  status: Status;
  rows: readonly R[];
  setRows: Dispatch<SetStateAction<readonly R[]>>;
  reload: () => void;
}

export function useRemoteRows<R>(load: (signal: AbortSignal) => Promise<readonly R[]>): RemoteRows<R> {
  const [status, setStatus] = useState<Status>('loading');
  const [rows, setRows] = useState<readonly R[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    controllerRef.current?.abort();
    const current = new AbortController();
    controllerRef.current = current;
    load(current.signal)
      .then((items) => {
        if (current.signal.aborted) return;
        setRows(items);
        setStatus('ready');
      })
      .catch(() => {
        if (!current.signal.aborted) setStatus((prev) => (prev === 'ready' ? prev : 'error'));
      });
  }, [load]);

  useEffect(() => {
    reload();
    return () => controllerRef.current?.abort();
  }, [reload]);

  return { status, rows, setRows, reload };
}

/** Aggiornamento ottimistico: applica subito la modifica e la annulla se il server la rifiuta. */
export async function optimisticUpdate<R extends { readonly id: number }>(
  setRows: Dispatch<SetStateAction<readonly R[]>>,
  original: R,
  optimistic: R,
  request: Promise<R>,
): Promise<void> {
  const replace = (next: R) => setRows((rows) => rows.map((row) => (row.id === next.id ? next : row)));
  replace(optimistic);
  try {
    replace(await request);
  } catch (error) {
    replace(original);
    throw error;
  }
}
