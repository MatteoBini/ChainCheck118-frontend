import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet';
import { EmptyState } from '@/components/feedback';
import { Page } from '@/components/layout';
import { useCurrentUser } from '@/features/auth';
import { roleLabel } from '@/lib';
import { useRealtime, type RealtimeStatus, type TrackedRole } from '@/realtime';
import { MAX_BOUNDS, MAX_ZOOM, MIN_ZOOM, REGION_BOUNDS, TILE_ATTRIBUTION, TILE_URL } from './mapConfig';
import { markerIcon } from './markers';

/** Leaflet si accorge solo dei resize della finestra: qui anche di quelli del riquadro (es. sidebar). */
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

function Legend() {
  const roles: TrackedRole[] = ['SOCCORRITORE', 'ISPETTORE'];
  return (
    <ul className="map-legend" aria-label="Legenda">
      {roles.map((role) => (
        <li key={role}>
          <span
            className={`map-marker ${role === 'SOCCORRITORE' ? 'is-crew' : 'is-inspector'}`}
            aria-hidden="true"
          >
            <span>{role === 'SOCCORRITORE' ? 'S' : 'I'}</span>
          </span>
          {roleLabel({ role })}
        </li>
      ))}
    </ul>
  );
}

function statusNotice(status: RealtimeStatus, operator: boolean): string | null {
  if (status === 'connecting') return 'Collegamento in corso…';
  if (status === 'offline') {
    return operator
      ? 'Collegamento perso: le posizioni potrebbero non essere aggiornate. Riconnessione in corso…'
      : 'Collegamento perso: la tua posizione non viene trasmessa. Riconnessione in corso…';
  }
  return null;
}

export function MapPage() {
  const user = useCurrentUser();
  const { status, ownPosition, presences } = useRealtime();
  const operator = user.role === 'OPERATORE';

  if (status === 'disabled') {
    return (
      <Page title="Mappa">
        <EmptyState title="Mappa non disponibile con i mock">
          La mappa in tempo reale richiede il backend: avvia l'app senza <code>VITE_USE_MOCKS</code>.
        </EmptyState>
      </Page>
    );
  }

  const notice = statusNotice(status, operator);
  const others = [...presences.values()];

  return (
    <Page
      title="Mappa"
      width="fill"
      actions={
        operator ? (
          <span className="chip chip-acc" role="status">
            {others.length === 1 ? '1 collegato' : `${others.length} collegati`}
          </span>
        ) : (
          ownPosition && <span className="chip chip-acc">Zona di {ownPosition.zoneName}</span>
        )
      }
    >
      {notice && (
        <p className="map-notice" role="status">
          {notice}
        </p>
      )}
      <div className="map-frame">
        <MapContainer
          className="map-canvas"
          bounds={REGION_BOUNDS}
          maxBounds={MAX_BOUNDS}
          maxBoundsViscosity={1}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
        >
          <ResizeWatcher />
          <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={MAX_ZOOM} />
          {operator
            ? others.map((p) => (
                <Marker key={p.userId} position={[p.lat, p.lng]} icon={markerIcon(p.role)}>
                  <Tooltip direction="top">
                    <strong>{p.fullName}</strong>
                    <br />
                    {roleLabel(p)}
                  </Tooltip>
                </Marker>
              ))
            : ownPosition && (
                <Marker position={[ownPosition.lat, ownPosition.lng]} icon={markerIcon(user.role, true)}>
                  <Tooltip direction="top">
                    <strong>Tu</strong>
                    <br />
                    {roleLabel(user)}
                  </Tooltip>
                </Marker>
              )}
        </MapContainer>
      </div>
      <Legend />
    </Page>
  );
}
