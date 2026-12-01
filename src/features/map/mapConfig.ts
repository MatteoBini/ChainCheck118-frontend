import type { LatLngBoundsExpression } from 'leaflet';

// Tile di OpenStreetMap: gratuite, con usage policy (attribuzione visibile, niente
// download massivo né cache nel service worker). Senza sottodomini a/b/c.
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors';

/** Vista iniziale: le sei zone consentite, da Parma a Forlì. */
export const REGION_BOUNDS: LatLngBoundsExpression = [
  [44.13, 10.2],
  [44.9, 12.15],
];

/** Oltre questi limiti la mappa non si sposta. */
export const MAX_BOUNDS: LatLngBoundsExpression = [
  [43.7, 9.1],
  [45.2, 12.8],
];

// A zoom 6 la regione sta intera anche alla larghezza di un telefono, a 7 no.
export const MIN_ZOOM = 6;
export const MAX_ZOOM = 19;
