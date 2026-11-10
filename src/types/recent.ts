export type InspectionVerdict = 'CONFORME' | 'NON_CONFORME';

export type RecentRecord =
  | {
      readonly id: string;
      readonly kind: 'CHECKLIST';
      readonly plate: string;
      readonly at: string;
      readonly inspection: null | { readonly verdict: InspectionVerdict };
    }
  | {
      readonly id: string;
      readonly kind: 'INSPECTION';
      readonly plate: string;
      readonly at: string;
      readonly verdict: InspectionVerdict;
    };

export interface RecentEntry {
  id: string;
  title: string;
  subtitle: string;
}
