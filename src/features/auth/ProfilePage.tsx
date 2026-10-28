import { useId } from 'react';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { homePathFor, Page, PATHS } from '@/components/layout';
import { initials, roleLabel } from '@/lib';
import { useAuth, useCurrentUser } from './useAuth';

/** Dati in sola lettura: il backend non espone la modifica del profilo. */
export function ProfilePage() {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ids = useId();

  function handleClose() {
    // Senza cronologia interna (pagina aperta direttamente) si torna alla home del ruolo.
    if (location.key === 'default') navigate(homePathFor(user.role), { replace: true });
    else navigate(-1);
  }

  async function handleSignOut() {
    await signOut();
    navigate(PATHS.login, { replace: true });
  }

  return (
    <Page
      title="Profilo"
      width="narrow"
      actions={
        <button type="button" className="btn" onClick={handleClose}>
          Chiudi
        </button>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="avatar avatar-lg" aria-hidden="true">
          {initials(user)}
        </span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em' }}>{user.fullName}</div>
          <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 2 }}>{roleLabel(user)}</div>
        </div>
      </div>

      <div className="card card-pad form">
        <div className="field">
          <label htmlFor={`${ids}-name`} className="field-label">
            Nome e cognome
          </label>
          <input id={`${ids}-name`} className="input-ro" type="text" value={user.fullName} readOnly />
        </div>
        <div className="field">
          <label htmlFor={`${ids}-username`} className="field-label">
            Username
          </label>
          <input id={`${ids}-username`} className="input-ro" type="text" value={user.username} readOnly />
        </div>
        <div className="field">
          <label htmlFor={`${ids}-role`} className="field-label">
            Ruolo
          </label>
          <input
            id={`${ids}-role`}
            className="input-ro"
            type="text"
            value={roleLabel(user)}
            readOnly
            aria-describedby={`${ids}-hint`}
          />
          <span id={`${ids}-hint`} className="field-hint">
            I dati del profilo e il ruolo sono gestiti dall'amministratore.
          </span>
        </div>
      </div>

      <div>
        <button type="button" className="btn" onClick={() => void handleSignOut()}>
          <LogOut size={16} aria-hidden="true" />
          Esci
        </button>
      </div>
    </Page>
  );
}
