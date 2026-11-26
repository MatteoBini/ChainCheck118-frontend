import { ArrowLeft, ArrowUpRight, LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/components/layout';

const STEPS = [
  {
    title: 'Checklist di turno',
    text: "A inizio turno l'equipaggio compila la checklist del mezzo. Il backend la serializza in JSON canonico e ne calcola l'hash SHA-256.",
  },
  {
    title: 'Scrittura on-chain',
    text: "L'hash viene registrato dallo smart contract ChainCheckRegistry insieme a tipo, mittente e timestamp. Il dato resta nel database, la sua impronta sulla blockchain.",
  },
  {
    title: 'Ispezione collegata',
    text: "L'ispettore verifica lo stesso mezzo: la sua ispezione viene registrata on-chain con un riferimento all'hash della checklist originale.",
  },
  {
    title: 'Confronto e segnalazioni',
    text: 'Le due registrazioni vengono confrontate: ogni discrepanza diventa una segnalazione visibile in tempo reale alla centrale operativa.',
  },
] as const;

const ROLES = [
  { name: 'Soccorritore', text: 'Compila le checklist di turno e consulta le proprie segnalazioni.' },
  { name: 'Ispettore', text: 'Esegue le ispezioni a campione e le confronta con le checklist.' },
  { name: 'Operatore di centrale', text: 'Monitora lo stato dei mezzi, le discrepanze e il registro di audit.' },
] as const;

const STACK = [
  { area: 'Frontend', items: ['React 18', 'TypeScript', 'Vite', 'React Router'] },
  { area: 'Backend', items: ['Node.js 22', 'Express', 'Prisma', 'PostgreSQL 16', 'Zod', 'JWT'] },
  { area: 'Blockchain', items: ['Solidity 0.8.24', 'Hardhat', 'ethers.js 6'] },
  { area: 'Infrastruttura', items: ['Docker Compose', 'nginx', 'WebSocket'] },
] as const;

export function AboutPage() {
  return (
    <div className="lp ab">
      <header className="lp-bar">
        <Link to="/" className="sb-brand lp-brand ab-home" aria-label="ChainCheck118 – torna alla home">
          <span className="sb-brand-mark" aria-hidden="true">
            <LinkIcon size={16} strokeWidth={2} />
          </span>
          <span>
            ChainCheck<span className="sb-brand-sub">118</span>
          </span>
        </Link>
        <Link to={PATHS.login} className="btn lp-bar-btn">
          Accedi
        </Link>
      </header>

      <main className="ab-main">
        <Link to="/" className="link ab-back">
          <ArrowLeft size={15} aria-hidden="true" />
          Home
        </Link>

        <section className="ab-intro">
          <p className="lp-eyebrow">Il progetto</p>
          <h1 className="ab-title">Certificazione su blockchain delle checklist dei mezzi di soccorso</h1>
          <p className="lp-lead">
            ChainCheck118 è il progetto d'esame del corso di <strong>Tecnologie Internet</strong>{' '}
            (Università di Parma, Ingegneria Informatica, Elettronica e delle Telecomunicazioni). Nasce
            per rendere verificabili i controlli sulle ambulanze del servizio 118: chi ha controllato
            cosa e quando, senza possibilità di modificarlo a posteriori.
          </p>
        </section>

        <section className="ab-section" aria-labelledby="ab-how">
          <h2 id="ab-how" className="ab-h2">
            Come funziona
          </h2>
          <ol className="ab-steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="ab-step">
                <span className="ab-step-n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="ab-h3">{step.title}</h3>
                <p className="ab-text">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="ab-section" aria-labelledby="ab-roles">
          <h2 id="ab-roles" className="ab-h2">
            Ruoli
          </h2>
          <dl className="ab-list">
            {ROLES.map((role) => (
              <div key={role.name} className="ab-row">
                <dt className="ab-h3">{role.name}</dt>
                <dd className="ab-text">{role.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="ab-section" aria-labelledby="ab-stack">
          <h2 id="ab-stack" className="ab-h2">
            Tecnologie
          </h2>
          <dl className="ab-list">
            {STACK.map((group) => (
              <div key={group.area} className="ab-row">
                <dt className="ab-h3">{group.area}</dt>
                <dd className="ab-tags">
                  {group.items.map((item) => (
                    <span key={item} className="ab-tag">
                      {item}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="ab-section ab-author" aria-labelledby="ab-author">
          <h2 id="ab-author" className="ab-h2">
            Autori
          </h2>
          <div className="ab-author-row">
            <p className="ab-text">Matteo Bini · Università di Parma (mat. 371617)</p>
            <a href="https://matteobini.me" target="_blank" rel="noreferrer" className="btn lp-bar-btn">
              matteobini.me
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="ab-author-row">
            <p className="ab-text">Andrea Vaccaro · Università di Parma (mat. 371549)</p>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <span>ChainCheck118</span>
        <span>Progetto d'esame · Tecnologie Internet</span>
      </footer>
    </div>
  );
}
