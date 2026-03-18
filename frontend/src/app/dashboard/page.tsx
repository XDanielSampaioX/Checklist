'use client';

import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import AuthGate from '@/components/AuthGate';
import ChecklistDetail from '@/components/ChecklistDetail';
import CreateChecklistModal from '@/components/CreateChecklistModal';
import DashboardReport from '@/components/DashboardReport';
import { DashboardReport as DashboardReportType, UserSummary, checklistApi } from '@/lib/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await checklistApi.getDashboard();
      setDashboard(data);
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
          <DashboardReport dashboard={dashboard} onOpenChecklist={setSelectedChecklistId} />
        )}
      </main>

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
