// Simulazione del movimento di un mezzo dentro una zona consentita.
// Funzioni pure: niente React, niente socket. Le zone arrivano dal server (`location:config`).
//
// Lo stato è in METRI rispetto al centro della zona (x verso est, y verso nord) e viene
// convertito in gradi solo in uscita. Un grado di latitudine vale ~111 km ovunque, uno di
// longitudine vale 111 km · cos(lat) (~79 km in Emilia-Romagna): senza la correzione i
// cerchi diventerebbero ellissi.

export interface SimZone {
  readonly lat: number;
  readonly lng: number;
  readonly radiusM: number;
}

export interface SimState<Z extends SimZone = SimZone> {
  readonly zone: Z;
  /** Metri verso est dal centro della zona. */
  readonly x: number;
  /** Metri verso nord dal centro della zona. */
  readonly y: number;
  /** Direzione in radianti: 0 = est, π/2 = nord. */
  readonly heading: number;
  /** Velocità in m/s. */
  readonly speed: number;
}

export interface LatLng {
  readonly lat: number;
  readonly lng: number;
}

export type Random = () => number;

const M_PER_DEG_LAT = 111_320;
const MIN_SPEED = 5;
const MAX_SPEED = 15;
/** Variazione massima della velocità, in m/s al secondo. */
const SPEED_JITTER = 1.5;
/** Variazione massima della direzione: ~15° al secondo. */
const MAX_TURN = (15 * Math.PI) / 180;
/** Oltre R − EDGE_M la direzione ruota gradualmente verso il centro. */
const EDGE_M = 300;
/** Dopo una pausa (scheda in background) niente salti: al massimo 2 s per passo. */
const MAX_DT_S = 2;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Angolo riportato in (−π, π]. */
function normalizeAngle(angle: number): number {
  const a = angle % (2 * Math.PI);
  if (a > Math.PI) return a - 2 * Math.PI;
  if (a <= -Math.PI) return a + 2 * Math.PI;
  return a;
}

/** Zona a caso, punto uniforme nell'80% interno del cerchio, direzione e velocità casuali. */
export function startSimulation<Z extends SimZone>(
  zones: readonly Z[],
  random: Random = Math.random,
): SimState<Z> {
  if (zones.length === 0) {
    throw new Error('Nessuna zona disponibile per la simulazione');
  }
  const zone = zones[Math.min(Math.floor(random() * zones.length), zones.length - 1)]!;
  // √u rende la distribuzione uniforme sull'area (senza, i punti si addensano al centro).
  const r = 0.8 * zone.radiusM * Math.sqrt(random());
  const theta = random() * 2 * Math.PI;
  return {
    zone,
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
    heading: random() * 2 * Math.PI - Math.PI,
    speed: MIN_SPEED + random() * (MAX_SPEED - MIN_SPEED),
  };
}

/** Avanza la simulazione di `dtS` secondi (limitati a 0–2 s). */
export function step<Z extends SimZone>(
  state: SimState<Z>,
  dtS: number,
  random: Random = Math.random,
): SimState<Z> {
  const dt = Number.isFinite(dtS) ? clamp(dtS, 0, MAX_DT_S) : 0;
  if (dt === 0) return state;

  const { zone } = state;
  const maxTurn = MAX_TURN * dt;

  const speed = clamp(state.speed + (random() * 2 - 1) * SPEED_JITTER * dt, MIN_SPEED, MAX_SPEED);

  let heading: number;
  if (Math.hypot(state.x, state.y) > zone.radiusM - EDGE_M) {
    // Vicino al bordo: ruota verso il centro, senza superare la variazione massima.
    const towardCenter = Math.atan2(-state.y, -state.x);
    heading = state.heading + clamp(normalizeAngle(towardCenter - state.heading), -maxTurn, maxTurn);
  } else {
    heading = state.heading + (random() * 2 - 1) * maxTurn;
  }
  heading = normalizeAngle(heading);

  let x = state.x + Math.cos(heading) * speed * dt;
  let y = state.y + Math.sin(heading) * speed * dt;

  // Garanzia finale: il punto resta sempre dentro il cerchio.
  const distance = Math.hypot(x, y);
  if (distance > zone.radiusM) {
    const k = zone.radiusM / distance;
    x *= k;
    y *= k;
  }

  return { zone, x, y, heading, speed };
}

/** Conversione metri → gradi rispetto al centro della zona. */
export function toLatLng(state: SimState): LatLng {
  const { zone } = state;
  const mPerDegLng = M_PER_DEG_LAT * Math.cos((zone.lat * Math.PI) / 180);
  return {
    lat: zone.lat + state.y / M_PER_DEG_LAT,
    lng: zone.lng + state.x / mPerDegLng,
  };
}
