'use client';

import { useCallback, useEffect, useState } from 'react';
import AgentPanel from '@/components/AgentPanel';
import AppHeader from '@/components/AppHeader';
import AuthGate from '@/components/AuthGate';
import ChecklistDetail from '@/components/ChecklistDetail';
import CreateChecklistModal from '@/components/CreateChecklistModal';
import DashboardReport from '@/components/DashboardReport';
import ThemeToggle from '@/components/ThemeToggle';
import { Checklist, DashboardReport as DashboardReportType, UserSummary, checklistApi } from '@/lib/api';

export default function DashboardPage() {
  return (
    <AuthGate>
      {(user, _refreshUser, logout) => (
        <DashboardContent currentUser={user} onLogout={logout} />
      )}
    </AuthGate>
  );
}

function DashboardContent({
  currentUser,
  onLogout,
}: {
  currentUser: UserSummary;
  onLogout: () => void;
}) {
  const [dashboard, setDashboard] = useState<DashboardReportType | null>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardData, checklistData] = await Promise.all([
        checklistApi.getDashboard(),
        checklistApi.getAll(),
      ]);
      setDashboard(dashboardData);
      setChecklists(checklistData);
    } catch (err) {
      setError('Nao foi possivel carregar o dashboard.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="app-canvas min-h-screen">
      <AppHeader user={currentUser} onCreate={() => setShowCreateModal(true)} onLogout={onLogout} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && <div className="mb-4 rounded-2xl border p-4 text-sm" style={{ borderColor: 'color-mix(in srgb, var(--danger) 26%, var(--border))', backgroundColor: 'color-mix(in srgb, var(--danger) 10%, var(--surface-strong))', color: 'var(--danger)' }}>{error}</div>}
        {loading || !dashboard ? (
          <div className="app-panel rounded-[28px] py-20 text-center">
            <div className="app-soft">Carregando dashboard...</div>
          </div>
        ) : (
          <DashboardReport dashboard={dashboard} allChecklists={checklists} onOpenChecklist={setSelectedChecklistId} />
        )}
      </main>

      {showAgentPanel && (
        <>
          <button
            aria-label="Fechar painel do Jovem"
            className="fixed inset-0 z-40 bg-[var(--overlay)]"
            onClick={() => setShowAgentPanel(false)}
          />
          <div className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md sm:right-6">
            <AgentPanel onCommandExecuted={loadDashboard} onClose={() => setShowAgentPanel(false)} />
          </div>
        </>
      )}

      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setShowAgentPanel(prev => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-xl text-[var(--text-primary)] shadow-2xl transition hover:-translate-y-1 hover:bg-[var(--surface)]"
          aria-label="Abrir Jovem"
          title="Abrir Jovem"
        >
          {showAgentPanel ? '×' : '🤖'}
        </button>
      </div>

      {showCreateModal && (
        <CreateChecklistModal onClose={() => setShowCreateModal(false)} onCreated={loadDashboard} currentUser={currentUser} />
      )}

      {selectedChecklistId !== null && (
        <ChecklistDetail
          checklistId={selectedChecklistId}
          onClose={() => setSelectedChecklistId(null)}
          onUpdated={loadDashboard}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
