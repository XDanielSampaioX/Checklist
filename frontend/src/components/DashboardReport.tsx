'use client';

import { useMemo, useState } from 'react';
import { Checklist, DashboardReport as DashboardReportData } from '@/lib/api';
import { exportChecklists } from '@/lib/report-export';

interface DashboardReportProps {
  dashboard: DashboardReportData;
  allChecklists: Checklist[];
  onOpenChecklist: (id: number) => void;
}

export default function DashboardReport({ dashboard, allChecklists, onOpenChecklist }: DashboardReportProps) {
  const reportCards = [
    { label: 'Em andamento', value: dashboard.inProgressCount, tone: 'bg-sky-50 text-sky-700 border-sky-100' },
    { label: 'Vencidos', value: dashboard.overdueCount, tone: 'bg-rose-50 text-rose-700 border-rose-100' },
    { label: 'Concluidos', value: dashboard.completedCount, tone: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Concluidos com atraso', value: dashboard.completedLateCount, tone: 'bg-amber-50 text-amber-700 border-amber-100' },
  ];
  const [showSelector, setShowSelector] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const exportItems = useMemo(() => {
    const selected = allChecklists.filter(checklist => selectedIds.includes(checklist.id));
    return selected.length > 0 ? selected : allChecklists;
  }, [allChecklists, selectedIds]);
  const distribution = [
    { label: 'Concluidos', value: dashboard.completedCount, color: '#7da38e' },
    { label: 'Concluidos com atraso', value: dashboard.completedLateCount, color: '#d3a35f' },
    { label: 'Em andamento', value: dashboard.inProgressCount, color: '#dc8e74' },
    { label: 'Vencidos', value: dashboard.overdueCount, color: '#bf6f70' },
  ];
  const chartTotal = distribution.reduce((total, item) => total + item.value, 0) || 1;
  const donutStyle = `conic-gradient(${distribution.reduce<string[]>((segments, item, index) => {
    const previous = distribution.slice(0, index).reduce((total, current) => total + current.value, 0);
    const start = (previous / chartTotal) * 360;
    const end = ((previous + item.value) / chartTotal) * 360;
    segments.push(`${item.color} ${start}deg ${end}deg`);
    return segments;
  }, []).join(', ')})`;

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(format);
    try {
      await exportChecklists(format, dashboard, exportItems);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="app-panel rounded-[32px] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Dashboard</p>
              <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Relatorios operacionais</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSelector(prev => !prev)}
                className="rounded-full bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface)]"
              >
                Selecionar checklists
              </button>
              <button
                type="button"
                onClick={() => handleExport('excel')}
                disabled={exporting !== null}
                className="rounded-full bg-[var(--surface-strong)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface)]"
              >
                {exporting === 'excel' ? 'Gerando Excel...' : 'Baixar Excel'}
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                disabled={exporting !== null}
                className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:opacity-90"
              >
                {exporting === 'pdf' ? 'Gerando PDF...' : 'Baixar PDF'}
              </button>
            </div>
          </div>
          {showSelector && (
            <div className="mb-5 rounded-[24px] border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Selecione as checklists do relatorio</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(allChecklists.map(checklist => checklist.id))}
                    className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Marcar todas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="rounded-full bg-[var(--surface)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Limpar
                  </button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {allChecklists.map(checklist => {
                  const checked = selectedIds.includes(checklist.id);
                  return (
                    <label
                      key={checklist.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedIds(prev =>
                            checked ? prev.filter(id => id !== checklist.id) : [...prev, checklist.id]
                          )
                        }
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--text-primary)]">{checklist.title}</span>
                        <span className="block text-xs text-[var(--text-secondary)]">
                          {checklist.assignedToUserName ?? 'Sem responsavel'} · {checklist.status.replaceAll('_', ' ')}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-[var(--text-secondary)]">
                {selectedIds.length > 0 ? `${selectedIds.length} checklist(s) selecionada(s).` : 'Nenhuma marcada: o download usara todas as checklists listadas.'}
              </p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {reportCards.map(card => (
              <div key={card.label} className={`rounded-[24px] border p-4 ${card.tone}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">{card.label}</p>
                <p className="mt-3 text-3xl font-black tracking-tight">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Grafico de conclusao</p>
              <div className="mt-5 flex flex-col items-center gap-5 md:flex-row">
                <div
                  className="relative h-44 w-44 shrink-0 rounded-full"
                  style={{ background: donutStyle }}
                >
                  <div className="absolute inset-[18%] flex items-center justify-center rounded-full bg-[var(--surface-strong)] text-center">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Conclusao</p>
                      <p className="mt-1 text-2xl font-black text-[var(--text-primary)]">{dashboard.completionRate.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  {distribution.map(item => (
                    <div key={item.label} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-sm text-[var(--text-primary)]">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Distribuicao por status</p>
              <div className="mt-5 flex h-52 items-end gap-4">
                {distribution.map(item => {
                  const height = `${Math.max((item.value / chartTotal) * 100, item.value > 0 ? 16 : 6)}%`;
                  return (
                    <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="text-xs font-semibold text-[var(--text-secondary)]">{item.value}</div>
                      <div className="flex h-full w-full items-end justify-center rounded-[20px] bg-[var(--surface-strong)] p-2">
                        <div
                          className="w-full rounded-[16px] transition-all"
                          style={{ height, backgroundColor: item.color }}
                        />
                      </div>
                      <div className="text-center text-xs font-medium text-[var(--text-secondary)]">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
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
