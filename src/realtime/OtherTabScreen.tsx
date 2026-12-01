import { LinkIcon, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/components/layout';
import { useAuth } from '@/features/auth';
import { useRealtime } from './useRealtime';

/**
 * Mostrata al posto dell'app quando ChainCheck118 è aperto in un'altra scheda
 * (regola della scheda unica, come WhatsApp Web).
 */
export function OtherTabScreen() {
  const { takeOver } = useRealtime();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate(PATHS.login, { replace: true });
  }

  return (
    <main className="auth">
      <section className="card auth-card" aria-labelledby="other-tab-title">
        <span className="sb-brand auth-brand">
          <span className="sb-brand-mark" aria-hidden="true">
            <LinkIcon size={16} strokeWidth={2} />
          </span>
          <span>
            ChainCheck<span className="sb-brand-sub">118</span>
          </span>
        </span>
        <div>
          <h1 id="other-tab-title" className="page-title">
            ChainCheck118 è aperto in un'altra scheda
          </h1>
          <p className="empty-text auth-lead">Puoi usarlo in una sola scheda alla volta.</p>
        </div>
        <div className="other-tab-actions">
          <button type="button" className="btn btn-p" onClick={takeOver}>
            Usa qui
          </button>
          <button type="button" className="btn" onClick={() => void handleSignOut()}>
            <LogOut size={16} aria-hidden="true" />
            Esci
          </button>
        </div>
      </section>
    </main>
  );
}
