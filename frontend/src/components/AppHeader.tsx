'use client';

import Link from 'next/link';
import { UserSummary } from '@/lib/api';

interface AppHeaderProps {
  user: UserSummary;
  onCreate: () => void;
  onLogout: () => void;
}

export default function AppHeader({ user, onCreate, onLogout }: AppHeaderProps) {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface-strong)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-2xl text-white shadow-lg">
              ✓
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">{user.storeName ?? 'Workspace'}</p>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] sm:text-3xl">Checklist Manager</h1>
              <p className="text-sm text-[var(--text-secondary)]">{user.name} · {user.role}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-2 text-sm">
              <Link href="/" className="rounded-full px-4 py-2 text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]">Checklists</Link>
              <Link href="/dashboard" className="rounded-full px-4 py-2 text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]">Dashboard</Link>
            </nav>
            <button
              onClick={onCreate}
              className="app-accent-button rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5"
            >
              + Nova checklist
            </button>
            <button
              onClick={onLogout}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--surface)]"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
