import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <section className="card empty">
      <h2 className="empty-title">{title}</h2>
      {children && <div className="empty-text">{children}</div>}
    </section>
  );
}
