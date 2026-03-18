'use client';

import { useState, useEffect, useCallback } from 'react';
import { Checklist, UserSummary, checklistApi } from '@/lib/api';
import ItemList from './ItemList';

interface ChecklistDetailProps {
  checklistId: number;
  onClose: () => void;
  onUpdated?: () => void;
  currentUser?: UserSummary | null;
}

export default function ChecklistDetail({ checklistId, onClose, onUpdated, currentUser }: ChecklistDetailProps) {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checklistApi.getById(checklistId);
      setChecklist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [checklistId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--overlay)]">
      <div className="app-panel rounded-xl p-8 text-center">Loading...</div>
    </div>
  );

  if (!checklist) return null;

  const statusMap = {
    IN_PROGRESS: { label: 'Em andamento', badge: 'bg-sky-100 text-sky-700' },
    OVERDUE: { label: 'Vencido', badge: 'bg-rose-100 text-rose-700' },
    COMPLETED: { label: 'Concluido', badge: 'bg-emerald-100 text-emerald-700' },
    COMPLETED_LATE: { label: 'Concluido com atraso', badge: 'bg-amber-100 text-amber-700' },
  } as const;

  const statusStyle = statusMap[checklist.status];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[var(--overlay)] sm:items-center">
      <div className="app-panel w-full max-w-2xl rounded-t-[28px] p-6 shadow-2xl sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle.badge}`}>
                {statusStyle.label}
              </span>
              {checklist.dueDate && (
                <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
                  Prazo {new Date(checklist.dueDate).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{checklist.title}</h2>
            {checklist.description && (
              <p className="text-sm text-[var(--text-secondary)]">{checklist.description}</p>
            )}
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Responsavel {checklist.assignedToUserName ?? 'nao definido'} · Loja {checklist.storeName ?? 'nao definida'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--text-soft)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
          >
            ✕
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <ItemList
            checklistId={checklistId}
            currentUser={currentUser}
            onItemsChanged={() => {
              load();
              onUpdated?.();
            }}
          />
        </div>
      </div>
    </div>
  );
}
