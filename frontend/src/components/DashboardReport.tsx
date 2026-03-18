'use client';

import { DashboardReport as DashboardReportData } from '@/lib/api';

interface DashboardReportProps {
  dashboard: DashboardReportData;
  onOpenChecklist: (id: number) => void;
}

export default function DashboardReport({ dashboard, onOpenChecklist }: DashboardReportProps) {
  const reportCards = [
    { label: 'Em andamento', value: dashboard.inProgressCount, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
    { label: 'Vencidos', value: dashboard.overdueCount, tone: 'bg-rose-50 text-rose-700 border-rose-100' },
    { label: 'Concluidos', value: dashboard.completedCount, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Concluidos com atraso', value: dashboard.completedLateCount, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  ];

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="app-panel rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Dashboard</p>
              <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Relatorios operacionais</h3>
            </div>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">Tempo real</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {reportCards.map(card => (
              <div key={card.label} className={`rounded-[24px] border p-4 ${card.tone}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">{card.label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight">{card.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 text-[var(--text-primary)] shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Resumo executivo</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Extracao de relatorios</h3>
          <div className="mt-5 space-y-4 text-sm text-[var(--text-secondary)]">
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Taxa de conclusao</p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{dashboard.completionRate.toFixed(0)}%</p>
            </div>
            <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-soft)]">Itens mapeados</p>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">{dashboard.totalItems}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="app-panel rounded-[32px] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Relatorio</p>
              <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Pendencias vencidas</h3>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)' }}>
              {dashboard.overdueChecklists.length} em risco
            </span>
          </div>
          <div className="space-y-3">
            {dashboard.overdueChecklists.length === 0 ? (
              <div className="rounded-[24px] p-4 text-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 16%, transparent)', color: 'var(--success)' }}>Nenhuma checklist vencida.</div>
            ) : (
              dashboard.overdueChecklists.map(checklist => (
                <div key={checklist.id} className="rounded-[24px] border p-4" style={{ borderColor: 'color-mix(in srgb, var(--danger) 26%, var(--border))', backgroundColor: 'color-mix(in srgb, var(--danger) 10%, var(--surface-strong))' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{checklist.title}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{checklist.assignedToUserName ?? 'Sem responsavel'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenChecklist(checklist.id)}
                      className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-xs font-semibold"
                      style={{ color: 'var(--danger)' }}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="app-panel rounded-[32px] p-6">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Relatorio</p>
            <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)]">Movimentacoes recentes</h3>
          </div>
          <div className="space-y-3">
            {dashboard.recentChecklists.map(checklist => (
              <button
                key={checklist.id}
                type="button"
                onClick={() => onOpenChecklist(checklist.id)}
                className="flex w-full items-center justify-between rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4 text-left transition hover:bg-[var(--surface)]"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{checklist.title}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{checklist.assignedToUserName ?? 'Sem responsavel'}</p>
                </div>
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                  {checklist.status.replaceAll('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
