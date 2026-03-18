'use client';

import { useState, useEffect, useCallback } from 'react';
import { Checklist, checklistApi } from '@/lib/api';
import ItemList from './ItemList';

interface ChecklistDetailProps {
  checklistId: number;
  onClose: () => void;
}

export default function ChecklistDetail({ checklistId, onClose }: ChecklistDetailProps) {
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
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="rounded-xl bg-white p-8 text-center">Loading...</div>
    </div>
  );

  if (!checklist) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-2xl rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{checklist.title}</h2>
            {checklist.description && (
              <p className="text-sm text-gray-500">{checklist.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <ItemList checklistId={checklistId} />
        </div>
      </div>
    </div>
  );
}
