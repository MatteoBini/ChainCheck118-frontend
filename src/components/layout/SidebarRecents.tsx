import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecents } from '@/app/api';
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
  // i dati caricati per un ruolo precedente non vanno mostrati
  const entries = loaded?.role === role ? loaded.entries : [];

  useEffect(() => {
    let active = true;
    getRecents(role)
      .then((list) => {
        if (active) setLoaded({ role, entries: list });
      })
      .catch(() => {
        /* la lista è accessoria: in caso di errore resta nascosta */
      });
    return () => {
      active = false;
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
            <Link to={PATHS.history} className="nav rec">
              <span className="rec-title">{entry.title}</span>
              <span className="rec-sub">{entry.subtitle}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
