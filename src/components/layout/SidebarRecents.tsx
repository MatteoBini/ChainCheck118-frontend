import { Link } from 'react-router-dom';
import type { RecentEntry } from '@/types';
import { PATHS } from './navConfig';

interface SidebarRecentsProps {
  title: string;
  entries: readonly RecentEntry[];
}

export function SidebarRecents({ title, entries }: SidebarRecentsProps) {
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
