import { LinkIcon, PanelLeft } from 'lucide-react';
import type { User } from '@/types';
import { NAV_CONFIG } from './navConfig';
import { SidebarLink } from './SidebarLink';
import { SidebarProfileButton } from './SidebarProfileButton';
import { SidebarRecents } from './SidebarRecents';
import { SidebarStatus } from './SidebarStatus';

interface SidebarProps {
  user: User;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const nav = NAV_CONFIG[user.role];

  return (
    <aside className={collapsed ? 'sb is-collapsed' : 'sb'} aria-label="Navigazione principale">
      <div className="sb-head">
        <div className="sb-brand sb-only">
          <span className="sb-brand-mark" aria-hidden="true">
            <LinkIcon size={16} strokeWidth={2} />
          </span>
          <span>
            ChainCheck<span className="sb-brand-sub">118</span>
          </span>
        </div>
        <button
          type="button"
          className="icobtn sb-toggle"
          aria-label={collapsed ? 'Espandi la barra laterale' : 'Comprimi la barra laterale'}
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          <PanelLeft size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {nav.primary && <SidebarLink item={nav.primary} variant="primary" />}

      <nav aria-label="Sezioni" className="sb-nav">
        {nav.items.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      {nav.recentsTitle && <SidebarRecents title={nav.recentsTitle} role={user.role} />}

      <div className="sb-spacer" />
      <SidebarStatus />
      <div className="sb-foot">
        <SidebarProfileButton user={user} />
      </div>
    </aside>
  );
}
