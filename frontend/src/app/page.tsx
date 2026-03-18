'use client';

import { useState, useEffect, useCallback } from 'react';
import { Checklist, checklistApi } from '@/lib/api';
import ChecklistCard from '@/components/ChecklistCard';
import CreateChecklistModal from '@/components/CreateChecklistModal';
import AgentPanel from '@/components/AgentPanel';
import ChecklistDetail from '@/components/ChecklistDetail';

export default function Home() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);

  const loadChecklists = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await checklistApi.getAll();
      setChecklists(data);
    } catch (err) {
      setError('Could not connect to backend. Make sure the Java server is running on port 8080.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecklists();
  }, [loadChecklists]);

  const completedCount = checklists.filter(c => c.completed).length;
  const totalCount = checklists.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Checklist Manager</h1>
                <p className="text-xs text-gray-500">Powered by AI Agents</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition"
            >
              + New Checklist
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {totalCount > 0 && (
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-100">
              <p className="text-3xl font-bold text-blue-600">{totalCount}</p>
              <p className="text-xs text-gray-500 mt-1">Total Checklists</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-100">
              <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="rounded-xl bg-white p-4 text-center shadow-sm border border-gray-100">
              <p className="text-3xl font-bold text-orange-500">{totalCount - completedCount}</p>
              <p className="text-xs text-gray-500 mt-1">In Progress</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <AgentPanel onCommandExecuted={loadChecklists} />
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-400">Loading checklists...</div>
          </div>
        ) : checklists.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">No checklists yet</p>
            <p className="text-sm text-gray-400 mt-1">Create one with the button above or use the AI Agent!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {checklists.map(checklist => (
              <ChecklistCard
                key={checklist.id}
                checklist={checklist}
                onUpdate={loadChecklists}
                onSelect={setSelectedChecklistId}
              />
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateChecklistModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadChecklists}
        />
      )}

      {selectedChecklistId !== null && (
        <ChecklistDetail
          checklistId={selectedChecklistId}
          onClose={() => setSelectedChecklistId(null)}
        />
      )}
    </div>
  );
}
