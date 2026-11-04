/** Esito di una voce della checklist (enum ItemOutcome del backend). */
export type ItemOutcome = 'PRESENTE' | 'MANCANTE' | 'SCADUTO' | 'NON_FUNZIONANTE';

export interface ChecklistItem {
  readonly id: number;
  readonly description: string;
}

export interface ItemResult {
  itemId: number;
  outcome: ItemOutcome;
}

/** Stato della checklist di oggi per il mezzo. */
export type TodayStatus =
  | { readonly status: 'NONE' }
  | {
      readonly status: 'CERTIFIED';
      readonly submissionId: number;
      readonly certifiedAt: string;
      readonly inspected: boolean;
    };

/** Risposta di GET /vehicles/:plate. */
export interface VehicleChecklist {
  readonly vehicle: { readonly id: number; readonly plate: string };
  readonly items: readonly ChecklistItem[];
  readonly today: TodayStatus;
}

/** Risposta di POST /checklists. */
export interface CertifiedChecklist {
  readonly submissionId: number;
  readonly plate: string;
  readonly recordId: string;
  readonly hash: string;
  readonly txHash: string;
  readonly certifiedAt: string;
}
