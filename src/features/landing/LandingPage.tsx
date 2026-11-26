import { ArrowRight, ClipboardCheck, LinkIcon, Radio, ShieldCheck } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/feedback';
import { PATHS, homePathFor } from '@/components/layout';
import { useAuth } from '@/features/auth';

/** Blocchi illustrativi: rappresentano la catena, non dati reali. */
const CHAIN = [
  { n: '1042', label: 'Checklist equipaggio', meta: 'MSB-07 · turno mattino', hash: '0x9f3a…c41e' },
  { n: '1043', label: 'Ispezione mezzo', meta: 'MSA-02 · conforme', hash: '0x2b71…08d9' },
  { n: '1044', label: 'Segnalazione chiusa', meta: 'MSB-11 · ossigeno', hash: '0xe5c0…7a32' },
] as const;

const ROLES = [
  { icon: ClipboardCheck, label: 'Soccorritori' },
  { icon: ShieldCheck, label: 'Ispettori' },
  { icon: Radio, label: 'Centrale operativa' },
] as const;

export function LandingPage() {
  const { status, user } = useAuth();

  if (status === 'loading') return <LoadingScreen label="Verifica della sessione…" />;
  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  return (
    <div className="lp">
      <header className="lp-bar">
        <div className="sb-brand lp-brand">
          <span className="sb-brand-mark" aria-hidden="true">
            <LinkIcon size={16} strokeWidth={2} />
          </span>
          <span>
            ChainCheck<span className="sb-brand-sub">118</span>
          </span>
        </div>
        <Link to={PATHS.about} className="btn lp-bar-btn">
          Informazioni sul progetto
        </Link>
      </header>

      <main className="lp-hero">
        <div className="lp-copy">
          <p className="lp-eyebrow">Emergenza sanitaria 118</p>
          <h1 className="lp-title">
            Ogni controllo del mezzo,
            <br />
            <span className="lp-title-acc">certificato e verificabile.</span>
          </h1>
          <p className="lp-lead">
            Checklist di equipaggio, ispezioni e segnalazioni registrate su blockchain: un
            registro che nessuno può alterare dopo la firma.
          </p>
          <div className="lp-actions">
            <Link to={PATHS.login} className="btn btn-p lp-cta">
              Accedi alla piattaforma
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ul className="lp-roles" aria-label="Pensato per">
            {ROLES.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon size={15} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <ol className="lp-chain" aria-hidden="true">
          {CHAIN.map((block) => (
            <li key={block.n} className="lp-block">
              <div className="lp-block-head">
                <span className="lp-block-n">#{block.n}</span>
                <span className="lp-block-ok">
                  <ShieldCheck size={13} />
                  Certificato
                </span>
              </div>
              <p className="lp-block-label">{block.label}</p>
              <p className="lp-block-meta">{block.meta}</p>
              <p className="lp-block-hash">{block.hash}</p>
            </li>
          ))}
        </ol>
      </main>

      <footer className="lp-foot">
        <span>ChainCheck118</span>
        <span>Accesso riservato al personale autorizzato</span>
      </footer>
    </div>
  );
}
