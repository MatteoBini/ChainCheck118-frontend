import { useEffect, useId, useState, type FormEvent } from 'react';
import { LinkIcon } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { ApiError, USE_MOCKS } from '@/app/api';
import { homePathFor } from '@/components/layout';
import { roleLabel } from '@/lib';
import type { Credentials, User } from '@/types';
import { useAuth } from './useAuth';

interface LocationState {
  from?: string;
}

interface DemoAccounts {
  users: readonly User[];
  password: string;
}

export function LoginPage() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const ids = useId();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState<DemoAccounts | null>(null);

  /** Gli utenti di prova si caricano solo con i mock attivi, così restano fuori dal bundle principale. */
  useEffect(() => {
    if (!USE_MOCKS) return;
    let active = true;
    void import('@/app/api/mock').then(({ MOCK_USERS, MOCK_PASSWORD }) => {
      if (active) setDemo({ users: MOCK_USERS, password: MOCK_PASSWORD });
    });
    return () => {
      active = false;
    };
  }, []);

  const from = (location.state as LocationState | null)?.from;

  // Unico punto di redirect: signIn aggiorna user e il re-render porta qui.
  if (user) return <Navigate to={from ?? homePathFor(user.role)} replace />;

  const valid = username.trim().length > 0 && password.length > 0;

  async function submit(credentials: Credentials) {
    setPending(true);
    setError(null);
    try {
      await signIn(credentials);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Username o password non corretti.'
          : 'Accesso non riuscito. Riprova.',
      );
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || pending) return;
    void submit({ username: username.trim(), password });
  }

  return (
    <main className="auth">
      <section className="card auth-card" aria-labelledby="login-title">
        <div className="sb-brand auth-brand">
          <span className="sb-brand-mark" aria-hidden="true">
            <LinkIcon size={16} strokeWidth={2} />
          </span>
          <span>
            ChainCheck<span className="sb-brand-sub">118</span>
          </span>
        </div>
        <div>
          <h1 id="login-title" className="page-title">
            Accesso
          </h1>
          <p className="empty-text auth-lead">
            Inserisci le credenziali fornite dall'amministratore.
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor={`${ids}-username`} className="field-label">
              Username
            </label>
            <input
              id={`${ids}-username`}
              className="input"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={`${ids}-password`} className="field-label">
              Password
            </label>
            <input
              id={`${ids}-password`}
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-p" disabled={!valid || pending}>
              {pending ? 'Accesso in corso…' : 'Accedi'}
            </button>
          </div>
        </form>

        {demo && (
          <div className="auth-roles">
            <p className="field-hint">Ambiente dimostrativo: entra con uno degli utenti di prova.</p>
            {demo.users.map((account) => (
              <button
                key={account.username}
                type="button"
                className="btn auth-role"
                disabled={pending}
                onClick={() => void submit({ username: account.username, password: demo.password })}
              >
                <span className="auth-role-text">
                  <span>{roleLabel(account)}</span>
                  <span className="auth-role-sub">
                    {account.fullName} · {account.username}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <p role="alert" className="msg msg-bad">
          {error}
        </p>
      </section>
    </main>
  );
}
