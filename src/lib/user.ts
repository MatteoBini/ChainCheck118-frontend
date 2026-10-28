import type { Role, User } from '@/types';

const ROLE_LABELS: Record<Role, string> = {
  SOCCORRITORE: 'Soccorritore · equipaggio',
  ISPETTORE: 'Ispettore · referente flotta',
  OPERATORE: 'Operatore di centrale',
};

export function roleLabel(user: Pick<User, 'role'>): string {
  return ROLE_LABELS[user.role];
}

export function initials(user: Pick<User, 'fullName'>): string {
  const words = user.fullName.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.charAt(0) ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? '') : '';
  return `${first}${last}`.toUpperCase();
}
