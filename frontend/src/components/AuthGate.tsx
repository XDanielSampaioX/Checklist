'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { authApi, storeApi, StoreSummary, UserSummary } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/session';
import ThemeToggle from './ThemeToggle';

interface AuthGateProps {
  children: (user: UserSummary, refreshUser: () => Promise<void>, logout: () => void) => ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('admin@checklist.local');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [storeId, setStoreId] = useState<number | ''>('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authApi.me();
      setUser(data);
      setError('');
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      return;
    }

    storeApi.getAll()
      .then(data => {
        setStores(data);
        setStoreId(prev => prev || data[0]?.id || '');
      })
      .catch(() => {
        setStores([]);
      });
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.login(email, password);
      setToken(response.token);
      setUser(response.user);
      setError('');
    } catch {
      setError('Nao foi possivel autenticar com essas credenciais.');
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) {
      setError('Selecione uma loja para concluir o cadastro.');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        name,
        email,
        password,
        storeId: Number(storeId),
      });
      setToken(response.token);
      setUser(response.user);
      setError('');
    } catch {
      setError('Nao foi possivel concluir o cadastro com os dados informados.');
      clearToken();
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  if (loading && !user) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Carregando sessao...</div>;
  }

  if (!user) {
    return (
      <div className="app-canvas flex min-h-screen items-center justify-center px-4">
        <div className="fixed right-4 top-4 z-10">
          <ThemeToggle />
        </div>
        <div className="app-panel w-full max-w-md rounded-[32px] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">Acesso</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-primary)]">
            {mode === 'login' ? 'Entrar no workspace' : 'Criar conta'}
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {mode === 'login'
              ? 'Use uma das credenciais seed ou entre com sua conta.'
              : 'Cadastre um operador vinculado a uma loja. Se houver supervisor na loja, ele sera associado automaticamente.'}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-strong)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-[var(--surface)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setEmail('');
                setPassword('');
              }}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-[var(--surface)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
            >
              Registrar
            </button>
          </div>
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="mt-6 space-y-4">
            {mode === 'register' && (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nome completo"
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)]"
              />
            )}
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)]"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)]"
            />
            {mode === 'register' && (
              <select
                value={storeId}
                onChange={e => setStoreId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)]"
              >
                <option value="">Selecione a loja</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>
                    {store.code} · {store.name}
                  </option>
                ))}
              </select>
            )}
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button className="app-accent-button w-full rounded-2xl px-4 py-3 text-sm font-semibold">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>
          {mode === 'login' && (
            <p className="mt-4 text-xs text-[var(--text-secondary)]">Ex.: `admin@checklist.local / admin123`.</p>
          )}
        </div>
      </div>
    );
  }

  return <>{children(user, loadUser, logout)}</>;
}
