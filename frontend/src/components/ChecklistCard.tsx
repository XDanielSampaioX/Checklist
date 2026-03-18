'use client';

import { useState } from 'react';
import { Checklist, checklistApi } from '@/lib/api';

interface ChecklistCardProps {
  checklist: Checklist;
  onUpdate: () => void;
  onSelect: (id: number) => void;
}

export default function ChecklistCard({ checklist, onUpdate, onSelect }: ChecklistCardProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await checklistApi.toggle(checklist.id);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this checklist?')) return;
    setLoading(true);
    try {
      await checklistApi.delete(checklist.id);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={() => onSelect(checklist.id)}
      className={`cursor-pointer rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
        checklist.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${checklist.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
            {checklist.title}
          </h3>
          {checklist.description && (
            <p className="mt-1 text-sm text-gray-500">{checklist.description}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>{checklist.itemCount} items</span>
            <span>•</span>
            <span>{new Date(checklist.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              checklist.completed
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {checklist.completed ? '✓ Done' : 'Mark Done'}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
