import {
  AlertTriangle,
  Ambulance,
  Clock,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Plus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export const PATHS = {
  login: '/accesso',
  about: '/progetto',
  profile: '/profilo',
  history: '/storico',
  crewChecklist: '/checklist',
  inspection: '/ispezione',
  dispatch: '/centrale',
  reports: '/segnalazioni',
  vehicleRegistry: '/anagrafica/mezzi',
  staffRegistry: '/anagrafica/personale',
  map: '/mappa',
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
      { to: PATHS.reports, label: 'Segnalazioni', icon: AlertTriangle },
      { to: PATHS.map, label: 'Mappa', icon: MapIcon },
    ],
    recentsTitle: 'Recenti',
  },
  ISPETTORE: {
    primary: { to: PATHS.inspection, label: 'Ispezioni', icon: Plus },
    items: [
      { to: PATHS.history, label: 'Storico', icon: Clock },
      { to: PATHS.map, label: 'Mappa', icon: MapIcon },
    ],
    recentsTitle: 'Recenti',
  },
  OPERATORE: {
    items: [
      { to: PATHS.dispatch, label: 'Panoramica', icon: LayoutDashboard },
      { to: PATHS.map, label: 'Mappa', icon: MapIcon },
      { to: PATHS.history, label: 'Storico e audit', icon: FileText },
      { to: PATHS.vehicleRegistry, label: 'Anagrafica mezzi', icon: Ambulance },
      { to: PATHS.staffRegistry, label: 'Anagrafica personale', icon: Users },
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
