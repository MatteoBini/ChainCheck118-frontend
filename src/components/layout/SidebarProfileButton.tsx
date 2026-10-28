import { NavLink } from 'react-router-dom';
import { initials, roleLabel } from '@/lib';
import type { User } from '@/types';
import { PATHS } from './navConfig';

interface SidebarProfileButtonProps {
  user: User;
}

export function SidebarProfileButton({ user }: SidebarProfileButtonProps) {
  const name = user.fullName;
  return (
    <NavLink
      to={PATHS.profile}
      className={({ isActive }) => (isActive ? 'nav sb-profile is-on' : 'nav sb-profile')}
      aria-label={`Apri il profilo di ${name}`}
      title={name}
    >
      <span className="avatar" aria-hidden="true">
        {initials(user)}
      </span>
      <span className="lbl sb-profile-text">
        <span className="sb-profile-name">{name}</span>
        <span className="sb-profile-role">{roleLabel(user)}</span>
      </span>
    </NavLink>
  );
}
