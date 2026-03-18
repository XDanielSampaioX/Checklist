'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import AppHeader from '@/components/AppHeader';
import AgentPanel from '@/components/AgentPanel';
import ChecklistCard from '@/components/ChecklistCard';
import ChecklistDetail from '@/components/ChecklistDetail';
import CreateChecklistModal from '@/components/CreateChecklistModal';
import { Checklist, UserSummary, checklistApi } from '@/lib/api';

const STATUS_COLUMNS: Array<{ status: Checklist['status']; title: string; accent: string }> = [
  { status: 'IN_PROGRESS', title: 'Em andamento', accent: 'var(--accent)' },
  { status: 'OVERDUE', title: 'Vencidos', accent: 'var(--danger)' },
  { status: 'COMPLETED_LATE', title: 'Concluidos com atraso', accent: 'var(--warning)' },
  { status: 'COMPLETED', title: 'Concluidos', accent: 'var(--success)' },
];

export default function Home() {
  return (
    <AuthGate>
      {(user, _refreshUser, logout) => (
        <HomeContent currentUser={user} onLogout={logout} />
      )}
    </AuthGate>
  );
}

function HomeContent({
  currentUser,
  onLogout,
}: {
  currentUser: UserSummary;
  onLogout: () => void;
}) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const checklistsData = await checklistApi.getAll();
      setChecklists(checklistsData);
    } catch (err) {
      setError('Could not connect to backend. Make sure the Java server is running on port 8080.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredChecklists = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return checklists;
    }

    return checklists.filter(checklist =>
      [
        checklist.title,
        checklist.description,
        checklist.assignedToUserName,
        checklist.storeName,
      ]
        .filter(Boolean)
        .some(value => value!.toLowerCase().includes(term))
    );
  }, [checklists, search]);

  const groupedChecklists = useMemo(
    () =>
      STATUS_COLUMNS.map(column => ({
        ...column,
        items: filteredChecklists.filter(checklist => checklist.status === column.status),
      })),
    [filteredChecklists]
  );

  const summary = {
    total: filteredChecklists.length,
    inProgress: filteredChecklists.filter(checklist => checklist.status === 'IN_PROGRESS').length,
    overdue: filteredChecklists.filter(checklist => checklist.status === 'OVERDUE').length,
    done: filteredChecklists.filter(checklist => checklist.completed).length,
  };

  return (
    <div className="app-canvas min-h-screen">
      <AppHeader user={currentUser} onCreate={() => setShowCreateModal(true)} onLogout={onLogout} />

      <main className="mx-auto flex max-w-[1500px] flex-col gap-6 px-4 py-6 pb-28">
        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="app-panel rounded-[30px] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Board operacional</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">
                  Uma visualizacao no estilo Trello para acompanhar cada checklist por status.
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                  Organize a operacao em colunas, encontre uma checklist rapidamente e abra os detalhes sem sair do board.
                </p>
              </div>

              <div className="flex w-full max-w-xl flex-col gap-3">
                <div className="app-panel-strong flex items-center gap-3 rounded-[24px] px-4 py-3">
                  <span className="text-sm font-semibold text-[var(--text-soft)]">Buscar</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Titulo, responsavel ou loja"
                    className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-soft)]"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="app-accent-button rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                  >
                    Criar checklist
                  </button>
                  <button
                    onClick={() => setShowAgentPanel(true)}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--surface)]"
                  >
                    Abrir agente
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-2">
            <div className="app-panel rounded-[28px] p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Resultados no board</p>
              <p className="mt-3 text-4xl font-black tracking-tight text-[var(--text-primary)]">{summary.total}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Checklists filtradas pela busca atual</p>
            </div>
            <div className="app-panel rounded-[28px] p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Em andamento</p>
              <p className="mt-3 text-4xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>{summary.inProgress}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Fluxos ativos no momento</p>
            </div>
            <div className="app-panel rounded-[28px] p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Vencidos</p>
              <p className="mt-3 text-4xl font-black tracking-tight" style={{ color: 'var(--danger)' }}>{summary.overdue}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Demandas que exigem atencao</p>
            </div>
            <div className="app-panel rounded-[28px] p-5">
              <p className="text-sm font-medium text-[var(--text-secondary)]">Concluidos</p>
              <p className="mt-3 text-4xl font-black tracking-tight" style={{ color: 'var(--success)' }}>{summary.done}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Entregas finalizadas</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-[var(--danger)]/30 bg-[color:rgba(191,111,112,0.12)] p-4 text-sm text-[var(--danger)]">
            {error}
          </div>
        )}

        {loading ? (
          <div className="app-panel rounded-[28px] py-20 text-center">
            <div className="app-soft">Loading checklists...</div>
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="app-panel rounded-[32px] px-6 py-16 text-center">
            <p className="mb-3 text-5xl">📋</p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {checklists.length === 0 ? 'Nenhuma checklist criada ainda' : 'Nenhuma checklist encontrada'}
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {checklists.length === 0
                ? 'Crie uma nova lista pelo topo da pagina ou use o agente flutuante.'
                : 'Tente ajustar o termo da busca para encontrar outra checklist.'}
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Kanban board</p>
                <h3 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Checklist board</h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">Arranjo visual inspirado em Trello, separado por status.</p>
            </div>

            <div className="hide-scrollbar flex gap-4 overflow-x-auto pb-2">
              {groupedChecklists.map(column => (
                <div key={column.status} className="app-board-column min-h-[58vh] w-[320px] shrink-0 rounded-[28px] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{column.title}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{column.items.length} checklist(s)</p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: column.accent }}
                    >
                      {column.items.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {column.items.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-4 text-sm text-[var(--text-secondary)]">
                        Nenhuma checklist nesta coluna.
                      </div>
                    ) : (
                      column.items.map(checklist => (
                        <ChecklistCard
                          key={checklist.id}
                          checklist={checklist}
                          onUpdate={loadData}
                          onSelect={setSelectedChecklistId}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {showAgentPanel && (
        <>
          <button
            aria-label="Close agent panel"
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
            onClick={() => setShowAgentPanel(false)}
          />
          <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md sm:right-6">
            <AgentPanel onCommandExecuted={loadData} onClose={() => setShowAgentPanel(false)} />
          </div>
        </>
      )}

      <button
        onClick={() => setShowAgentPanel(prev => !prev)}
        className="fixed bottom-5 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-2xl transition hover:-translate-y-1 sm:bottom-6 sm:right-6"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-label="Open AI agent"
      >
        {showAgentPanel ? '×' : '🤖'}
      </button>

      {showCreateModal && (
        <CreateChecklistModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadData}
          currentUser={currentUser}
        />
      )}

      {selectedChecklistId !== null && (
        <ChecklistDetail
          checklistId={selectedChecklistId}
          onClose={() => setSelectedChecklistId(null)}
          onUpdated={loadData}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
