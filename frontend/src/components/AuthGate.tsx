'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { authApi, UserSummary } from '@/lib/api';
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
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-primary)]">Entrar no workspace</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Use uma das credenciais seed. Ex.: `admin@checklist.local / admin123`.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
            {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
            <button className="app-accent-button w-full rounded-2xl px-4 py-3 text-sm font-semibold">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children(user, loadUser, logout)}</>;
}
