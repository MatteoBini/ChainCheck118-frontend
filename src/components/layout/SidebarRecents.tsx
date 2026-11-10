import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecents, onRecentsChanged } from '@/app/api';
import type { RecentEntry, Role } from '@/types';
import { PATHS } from './navConfig';

interface SidebarRecentsProps {
  title: string;
  role: Role;
}

export function SidebarRecents({ title, role }: SidebarRecentsProps) {
  const [loaded, setLoaded] = useState<{ role: Role; entries: readonly RecentEntry[] } | null>(
    null,
  );
  // Scarta i dati di un ruolo precedente.
  const entries = loaded?.role === role ? loaded.entries : [];

  useEffect(() => {
    let controller: AbortController | null = null;

    function load() {
      controller?.abort();
      const current = new AbortController();
      controller = current;
      getRecents(role, current.signal)
        .then((list) => {
          if (!current.signal.aborted) setLoaded({ role, entries: list });
        })
        .catch(() => {
          /* errore ignorato: resta la lista già mostrata */
        });
    }

    load();
    const unsubscribe = onRecentsChanged(load);
    return () => {
      unsubscribe();
      controller?.abort();
    };
  }, [role]);

  if (entries.length === 0) return null;
  const headingId = 'sb-recents-title';

  return (
    <div className="sb-only">
      <h2 id={headingId} className="sb-title">
        {title}
      </h2>
      <ul className="sb-list" aria-labelledby={headingId}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link to={`${PATHS.history}?voce=${encodeURIComponent(entry.id)}`} className="nav rec">
              <span className="rec-title">{entry.title}</span>
              <span className="rec-sub">{entry.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
