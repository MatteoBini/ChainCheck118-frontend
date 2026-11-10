/** Esito di un'ispezione. */
export type InspectionVerdict = 'CONFORME' | 'NON_CONFORME';

/** Voce restituita da GET /recents (dipende dal ruolo dell'utente). */
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

/** Voce della lista "Recenti" nella barra laterale. */
export interface RecentEntry {
  id: string;
  title: string;
  subtitle: string;
}
