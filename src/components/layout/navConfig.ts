import {
  Clock,
  FileText,
  LayoutDashboard,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export const PATHS = {
  login: '/accesso',
  profile: '/profilo',
  history: '/storico',
  crewChecklist: '/checklist',
  inspection: '/ispezione',
  dispatch: '/centrale',
} as const;

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface RoleNav {
  primary?: NavItem;
  items: readonly NavItem[];
  /** Assente = nessuna lista recenti. */
  recentsTitle?: string;
}

export const NAV_CONFIG: Readonly<Record<Role, RoleNav>> = {
  SOCCORRITORE: {
    primary: { to: PATHS.crewChecklist, label: 'Nuova checklist', icon: Plus },
    items: [
      { to: PATHS.history, label: 'Storico', icon: Clock },
    ],
    recentsTitle: 'Recenti',
  },
  ISPETTORE: {
    primary: { to: PATHS.inspection, label: 'Nuova ispezione', icon: Plus },
    items: [
      { to: PATHS.history, label: 'Storico', icon: Clock },
    ],
    recentsTitle: 'Recenti',
  },
  OPERATORE: {
    items: [
      { to: PATHS.dispatch, label: 'Panoramica', icon: LayoutDashboard },
      { to: PATHS.history, label: 'Storico e audit', icon: FileText },
    ],
  },
};

const HOME_PATHS: Readonly<Record<Role, string>> = {
  SOCCORRITORE: PATHS.crewChecklist,
  ISPETTORE: PATHS.inspection,
  OPERATORE: PATHS.dispatch,
};

export function homePathFor(role: Role): string {
  return HOME_PATHS[role];
}
