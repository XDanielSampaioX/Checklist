'use client';

import { useState } from 'react';
import { agentApi, AgentResponse, Checklist, checklistApi } from '@/lib/api';
import { exportChecklists, parseExportIntent } from '@/lib/report-export';

interface AgentPanelProps {
  onCommandExecuted: () => void;
  onClose?: () => void;
}

export default function AgentPanel({ onCommandExecuted, onClose }: AgentPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ prompt: string; response: AgentResponse }>>([]);

  const examples = [
    "create a checklist called 'Shopping List'",
    "crie uma checklist chamada 'Abertura da Loja'",
    "exporte em pdf as checklists da Loja Norte",
    "baixar excel das checklists 1 e 3",
    "liste todas as checklists",
    "adicione o item 'Conferir estoque' na checklist 1",
    "list all checklists",
    "add item 'Buy milk' to checklist 1",
    "mark checklist 1 as complete",
    "show items in checklist 1",
    "delete checklist 1",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      let response: AgentResponse;
      const looksLikeExport = /\b(export|exporte|baixar|baixe|gerar|gere|extrair|extraia|pdf|excel|csv|relatorio)\b/i.test(prompt);

      if (looksLikeExport) {
        const allChecklists = await checklistApi.getAll();
        const exportIntent = parseExportIntent(prompt, allChecklists);
        if (!exportIntent) {
          response = await agentApi.execute(prompt);
        } else {
        const dashboard = buildDashboardSummary(exportIntent.selected.length > 0 ? exportIntent.selected : allChecklists);
        const selected = exportIntent.selected.length > 0 ? exportIntent.selected : allChecklists;

        if (selected.length === 0) {
          response = {
            action: 'EXPORT_REPORT',
            result: 'Nao encontrei checklists que correspondam ao filtro informado para exportacao.',
            success: false,
          };
        } else {
          await exportChecklists(exportIntent.format, dashboard, selected);
          response = {
            action: 'EXPORT_REPORT',
            result: `Exportacao iniciada em ${exportIntent.format.toUpperCase()} com ${selected.length} checklist(s).`,
            success: true,
          };
        }
        }
      } else {
        response = await agentApi.execute(prompt);
      }

      setHistory(prev => [{ prompt, response }, ...prev]);
      setPrompt('');
      onCommandExecuted();
    } catch (err) {
      setHistory(prev => [{
        prompt,
        response: { action: 'error', result: 'Failed to connect to backend. Make sure the Java server is running on port 8080.', success: false }
      }, ...prev]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buildDashboardSummary = (checklists: Checklist[]) => {
    const completedCount = checklists.filter(checklist => checklist.status === 'COMPLETED').length;
    const completedLateCount = checklists.filter(checklist => checklist.status === 'COMPLETED_LATE').length;
    const overdueCount = checklists.filter(checklist => checklist.status === 'OVERDUE').length;
    const inProgressCount = checklists.filter(checklist => checklist.status === 'IN_PROGRESS').length;
    const totalItems = checklists.reduce((total, checklist) => total + checklist.itemCount, 0);

    return {
      totalChecklists: checklists.length,
      completedCount,
      completedLateCount,
      overdueCount,
      inProgressCount,
      totalItems,
      completionRate: checklists.length === 0 ? 0 : (completedCount / checklists.length) * 100,
      overdueRate: checklists.length === 0 ? 0 : (overdueCount / checklists.length) * 100,
      recentChecklists: checklists.slice(0, 5),
      overdueChecklists: checklists.filter(checklist => checklist.status === 'OVERDUE'),
    };
  };

  return (
    <div className="app-panel rounded-[28px] p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: 'var(--accent-soft)' }}>
            🤖
          </span>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">Jovem</h2>
            <p className="text-xs text-[var(--text-secondary)]">Assistente para operar checklists em linguagem natural</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-soft)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
            aria-label="Close panel"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Converse com o Jovem... ex.: crie uma checklist chamada 'Loja'"
            className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="app-accent-button rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? '...' : '▶ Executar'}
          </button>
        </div>
      </form>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Exemplos de comandos</p>
        <div className="flex flex-wrap gap-2">
          {examples.map(example => (
            <button
              type="button"
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">Historico do Jovem</p>
          {history.map((entry, i) => (
            <div key={i} className="rounded-2xl border p-3 text-xs" style={entry.response.success
              ? { borderColor: 'color-mix(in srgb, var(--success) 28%, var(--border))', backgroundColor: 'color-mix(in srgb, var(--success) 12%, var(--surface-strong))' }
              : { borderColor: 'color-mix(in srgb, var(--danger) 28%, var(--border))', backgroundColor: 'color-mix(in srgb, var(--danger) 12%, var(--surface-strong))' }}>
              <p className="font-medium text-[var(--text-primary)]">› {entry.prompt}</p>
              <p className="mt-1" style={{ color: entry.response.success ? 'var(--success)' : 'var(--danger)' }}>
                {entry.response.result}
              </p>
              {entry.response.action && (
                <p className="mt-1 text-[var(--text-soft)]">Action: {entry.response.action}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
