import type { InspectionVerdict } from './recent';

/** Utente come restituito negli endpoint della centrale. */
export interface UserRef {
  readonly id: number;
  readonly username: string;
  readonly fullName: string;
}

/** Voce di GET /vehicles: un mezzo con la sua ultima checklist certificata. */
export interface VehicleOverview {
  readonly id: number;
  readonly plate: string;
  readonly lastChecklist: null | {
    readonly submissionId: number;
    readonly certifiedAt: string;
    readonly by: UserRef;
    readonly inspection: null | { readonly verdict: InspectionVerdict };
  };
}

/** Voce di GET /checklists: una checklist certificata, con autore ed eventuale ispezione. */
export interface AuditRecord {
  readonly id: number;
  readonly plate: string;
  readonly certifiedAt: string;
  readonly by: UserRef;
  readonly inspection: null | {
    readonly verdict: InspectionVerdict;
    readonly inspectedAt: string;
    readonly by: UserRef;
  };
}

/** Pagina di GET /checklists. */
export interface AuditPage {
  readonly items: readonly AuditRecord[];
  /** Da passare come cursor per la pagina successiva; null = fine dello storico. */
  readonly nextCursor: number | null;
}
