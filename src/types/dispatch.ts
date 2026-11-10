import type { InspectionVerdict } from './recent';

export interface UserRef {
  readonly id: number;
  readonly username: string;
  readonly fullName: string;
}

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

export interface AuditPage {
  readonly items: readonly AuditRecord[];
  /** null = nessuna pagina successiva. */
  readonly nextCursor: number | null;
}
