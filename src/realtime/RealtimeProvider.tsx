import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getToken, USE_MOCKS } from '@/app/api';
import { useAuth } from '@/features/auth';
import type { ClientToServerEvents, HandshakeAuth, Presence, ServerToClientEvents, Zone } from './contract';
import { RealtimeContext, type OwnPosition, type RealtimeContextValue, type RealtimeStatus } from './RealtimeContext';
import { startSimulation, step, toLatLng, type SimState } from './simulation';

type RealtimeSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const TAB_ID_KEY = 'cc118.tabId';
/** Attesa prima di riprovare quando il server rifiuta per un problema temporaneo. */
const RETRY_MS = 5000;
const NO_PRESENCES: ReadonlyMap<number, Presence> = new Map();

let fallbackTabId: string | undefined;

function randomId(): string {
  // randomUUID esiste solo in contesti sicuri (https o localhost).
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Id della scheda: sopravvive a F5 ma è diverso per ogni scheda (sessionStorage). */
function getTabId(): string {
  try {
    const stored = window.sessionStorage.getItem(TAB_ID_KEY);
    if (stored) return stored;
    const id = randomId();
    window.sessionStorage.setItem(TAB_ID_KEY, id);
    return id;
  } catch {
    return (fallbackTabId ??= randomId());
  }
}

interface RealtimeProviderProps {
  children: ReactNode;
}

/**
 * Un solo socket per sessione, aperto dopo il login e chiuso al logout. Sta sopra il
 * router, quindi cambiare pagina non lo chiude: la posizione viene trasmessa anche se
 * l'utente non è sulla Mappa.
 */
export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { user, signOut } = useAuth();
  const userId = user?.id;
  const role = user?.role;

  const [status, setStatus] = useState<Exclude<RealtimeStatus, 'disabled'>>('connecting');
  const [ownPosition, setOwnPosition] = useState<OwnPosition | null>(null);
  const [presences, setPresences] = useState<ReadonlyMap<number, Presence>>(NO_PRESENCES);

  const socketRef = useRef<RealtimeSocket | null>(null);
  /** true solo per il collegamento chiesto con "Usa qui". */
  const takeoverRef = useRef(false);

  useEffect(() => {
    if (userId === undefined || role === undefined || USE_MOCKS) return;

    const tabId = getTabId();
    const socket: RealtimeSocket = io({
      path: '/socket.io',
      // Funzione: viene rivalutata a ogni tentativo, quindi legge token e takeover aggiornati.
      auth: (cb) => cb({ token: getToken() ?? '', tabId, takeover: takeoverRef.current } satisfies HandshakeAuth),
    });
    socketRef.current = socket;

    let blocked = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let tickTimer: ReturnType<typeof setInterval> | undefined;
    let sim: SimState<Zone> | null = null;
    let lastTick = 0;

    function stopSimulation() {
      clearInterval(tickTimer);
      tickTimer = undefined;
    }

    function block() {
      blocked = true;
      stopSimulation();
      clearTimeout(retryTimer);
      setStatus('blocked');
    }

    function tick() {
      if (!sim) return;
      const now = performance.now();
      sim = step(sim, (now - lastTick) / 1000);
      lastTick = now;
      const position = toLatLng(sim);
      setOwnPosition({ ...position, zoneName: sim.zone.name });
      // volatile: se il socket non è pronto l'update si scarta, niente raffiche al riconnect.
      if (socket.connected) socket.volatile.emit('location:update', position);
    }

    socket.on('connect', () => {
      blocked = false;
      takeoverRef.current = false;
      setStatus('connected');
    });

    socket.on('connect_error', (error) => {
      switch (error.message) {
        case 'UNAUTHORIZED':
          void signOut();
          return;
        case 'ALREADY_OPEN':
          block();
          return;
        default:
          setStatus('offline');
          // Errore di rete: Socket.IO riprova da solo (socket.active). Un rifiuto del server
          // (es. UNAVAILABLE) invece no: si riprova a mano dopo qualche secondo.
          if (!socket.active) {
            clearTimeout(retryTimer);
            retryTimer = setTimeout(() => socket.connect(), RETRY_MS);
          }
      }
    });

    socket.on('disconnect', () => {
      if (!blocked) setStatus('offline');
    });

    socket.on('session:replaced', block);
    socket.on('session:expired', () => void signOut());

    // Chiudendo la scheda il browser non sempre chiude il WebSocket in modo pulito, e il
    // server se ne accorgerebbe solo al ping timeout (~45 s): nel frattempo una nuova
    // scheda vedrebbe "aperto in un'altra scheda". La disconnessione esplicita lo avvisa
    // subito. Se la pagina torna dalla bfcache, ci si ricollega.
    function onPageHide() {
      socket.disconnect();
    }
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted && !blocked) socket.connect();
    }
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);

    if (role === 'OPERATORE') {
      socket.on('presence:snapshot', ({ users }) => {
        setPresences(new Map(users.map((p) => [p.userId, p])));
      });
      socket.on('presence:update', (presence) => {
        setPresences((prev) => new Map(prev).set(presence.userId, presence));
      });
      socket.on('presence:remove', ({ userId: removedId }) => {
        setPresences((prev) => {
          if (!prev.has(removedId)) return prev;
          const next = new Map(prev);
          next.delete(removedId);
          return next;
        });
      });
    } else {
      socket.on('location:config', ({ zones, intervalMs }) => {
        // Dopo una riconnessione il mezzo riparte da dove era.
        if (!sim || !zones.some((z) => z.id === sim?.zone.id)) {
          if (zones.length === 0) return;
          sim = startSimulation(zones);
        }
        stopSimulation();
        lastTick = performance.now();
        tick();
        tickTimer = setInterval(tick, intervalMs);
      });
    }

    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      stopSimulation();
      clearTimeout(retryTimer);
      socket.off();
      socket.disconnect();
      socketRef.current = null;
      takeoverRef.current = false;
      setStatus('connecting');
      setOwnPosition(null);
      setPresences(NO_PRESENCES);
    };
  }, [userId, role, signOut]);

  const takeOver = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.connected) return;
    takeoverRef.current = true;
    setStatus('connecting');
    socket.connect();
  }, []);

  const disabled = userId === undefined || USE_MOCKS;
  const value = useMemo<RealtimeContextValue>(
    () => ({
      status: disabled ? 'disabled' : status,
      ownPosition: disabled ? null : ownPosition,
      presences: disabled ? NO_PRESENCES : presences,
      takeOver,
    }),
    [disabled, status, ownPosition, presences, takeOver],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
