import { useId } from 'react';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { homePathFor, Page, PATHS } from '@/components/layout';
import { initials, roleLabel } from '@/lib';
import { useAuth, useCurrentUser } from './useAuth';

export function ProfilePage() {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const ids = useId();

  function handleClose() {
    // Pagina aperta direttamente: nessuna cronologia a cui tornare.
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
      <div className="profile-head">
        <span className="avatar avatar-lg" aria-hidden="true">
          {initials(user)}
        </span>
        <div>
          <div className="profile-name">{user.fullName}</div>
          <div className="profile-role">{roleLabel(user)}</div>
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
