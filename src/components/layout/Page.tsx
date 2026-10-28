import type { ReactNode } from 'react';

interface PageProps {
  title: string;
  /** Pulsanti a destra nell'intestazione. */
  actions?: ReactNode;
  /** Barra d'azione fissa in fondo (es. "Firma e certifica"). */
  footer?: ReactNode;
  width?: 'narrow' | 'default' | 'wide';
  children: ReactNode;
}

const WIDTH_CLASS: Record<NonNullable<PageProps['width']>, string> = {
  narrow: 'page-inner is-narrow',
  default: 'page-inner',
  wide: 'page-inner is-wide',
};

/** Struttura standard di una schermata: intestazione, area scorrevole, footer opzionale. */
export function Page({ title, actions, footer, width = 'default', children }: PageProps) {
  return (
    <>
      <header className="page-head">
        <h1 className="page-title">{title}</h1>
        {actions && <div className="page-actions">{actions}</div>}
      </header>
      <div className="page-body">
        <div className={WIDTH_CLASS[width]}>{children}</div>
      </div>
      {footer && <footer className="page-foot">{footer}</footer>}
    </>
  );
}
