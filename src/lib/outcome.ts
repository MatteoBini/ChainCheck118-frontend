import type { ItemOutcome } from '@/types';

/** Ordine in cui gli esiti compaiono nei moduli. */
export const ITEM_OUTCOMES: readonly ItemOutcome[] = ['PRESENTE', 'MANCANTE', 'SCADUTO', 'NON_FUNZIONANTE'];

const OUTCOME_LABELS: Record<ItemOutcome, string> = {
  PRESENTE: 'Presente',
  MANCANTE: 'Mancante',
  SCADUTO: 'Scaduto',
  NON_FUNZIONANTE: 'Non funzionante',
};

export function outcomeLabel(outcome: ItemOutcome): string {
  return OUTCOME_LABELS[outcome];
}
