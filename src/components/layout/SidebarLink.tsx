import { Link, NavLink } from 'react-router-dom';
import type { NavItem } from './navConfig';

interface SidebarLinkProps {
  item: NavItem;
  variant?: 'nav' | 'primary';
}

export function SidebarLink({ item, variant = 'nav' }: SidebarLinkProps) {
  const Icon = item.icon;

  if (variant === 'primary') {
    return (
      <Link to={item.to} className="newbtn" title={item.label}>
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className="lbl">{item.label}</span>
      </Link>
    );
  }

  return (
    <NavLink to={item.to} className={({ isActive }) => (isActive ? 'nav is-on' : 'nav')} title={item.label}>
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      <span className="lbl grow">{item.label}</span>
    </NavLink>
  );
}
