import L from 'leaflet';
import type { TrackedRole } from '@/realtime';

// Marker HTML (divIcon) invece delle PNG di Leaflet, che con Vite richiedono workaround.
// Forma e lettera distinguono il ruolo, non solo il colore.
const SHAPE: Record<TrackedRole, { className: string; letter: string }> = {
  SOCCORRITORE: { className: 'is-crew', letter: 'S' },
  ISPETTORE: { className: 'is-inspector', letter: 'I' },
};

function createIcon(role: TrackedRole, own: boolean): L.DivIcon {
  const { className, letter } = SHAPE[role];
  return L.divIcon({
    className: 'map-icon',
    html: `<span class="map-marker ${className}${own ? ' is-own' : ''}"><span>${letter}</span></span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    tooltipAnchor: [0, -15],
  });
}

const ICONS = {
  SOCCORRITORE: { other: createIcon('SOCCORRITORE', false), own: createIcon('SOCCORRITORE', true) },
  ISPETTORE: { other: createIcon('ISPETTORE', false), own: createIcon('ISPETTORE', true) },
} satisfies Record<TrackedRole, { other: L.DivIcon; own: L.DivIcon }>;

export function markerIcon(role: TrackedRole, own = false): L.DivIcon {
  return own ? ICONS[role].own : ICONS[role].other;
}
