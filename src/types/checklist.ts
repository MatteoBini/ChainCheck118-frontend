export type ItemOutcome = 'PRESENTE' | 'MANCANTE' | 'SCADUTO' | 'NON_FUNZIONANTE';

export interface ChecklistItem {
  readonly id: number;
  readonly description: string;
}

export interface ItemResult {
  itemId: number;
  outcome: ItemOutcome;
}

export type TodayStatus =
  | { readonly status: 'NONE' }
  | {
      readonly status: 'CERTIFIED';
      readonly submissionId: number;
      readonly certifiedAt: string;
      readonly inspected: boolean;
    };

export interface VehicleChecklist {
  readonly vehicle: { readonly id: number; readonly plate: string };
  readonly items: readonly ChecklistItem[];
  readonly today: TodayStatus;
}

export interface CertifiedChecklist {
  readonly submissionId: number;
  readonly plate: string;
  readonly recordId: string;
  readonly hash: string;
  readonly txHash: string;
  readonly certifiedAt: string;
}
