'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:translate-y-[-1px] hover:bg-[var(--surface)]"
      aria-label="Alternar tema"
    >
      {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
    </button>
  );
}
