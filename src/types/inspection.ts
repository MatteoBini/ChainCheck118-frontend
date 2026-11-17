import type { ItemOutcome } from './checklist';
import type { UserRef } from './dispatch';
import type { InspectionVerdict } from './recent';

export interface PendingInspection {
  readonly submissionId: number;
  readonly plate: string;
  readonly certifiedAt: string;
  readonly by: UserRef;
}

export interface InspectionDiscrepancy {
  readonly itemId: number;
  readonly declared: ItemOutcome;
  readonly observed: ItemOutcome;
  readonly description: string;
}

export interface InspectionResult {
  readonly inspectionId: number;
  readonly submissionId: number;
  readonly plate: string;
  readonly verdict: InspectionVerdict;
  readonly discrepancies: readonly InspectionDiscrepancy[];
  readonly note: string | null;
  readonly recordId: string;
  readonly hash: string;
  readonly txHash: string;
  readonly inspectedAt: string;
}

export interface InspectionReportEntry {
  readonly id: number;
  readonly plate: string;
  readonly inspectedAt: string;
  readonly note: string | null;
  readonly inspector: UserRef;
}
