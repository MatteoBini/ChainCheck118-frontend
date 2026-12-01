import { useContext } from 'react';
import { RealtimeContext, type RealtimeContextValue } from './RealtimeContext';

export function useRealtime(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime deve essere usato dentro <RealtimeProvider>');
  return ctx;
}
