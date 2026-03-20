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

  const getInitials = (name?: string | null) => {
    if (!name) return '--';
    const [first = '', second = ''] = name.trim().split(/\s+/);
    return `${first.charAt(0)}${second.charAt(0) || first.charAt(1) || ''}`.toUpperCase();
  };

  const statusMap = {
    IN_PROGRESS: {
      label: 'Em andamento',
      badge: 'text-white',
      card: 'app-card',
      tone: 'var(--accent)',
    },
    OVERDUE: {
      label: 'Vencido',
      badge: 'text-white',
      card: 'app-card',
      tone: 'var(--danger)',
    },
    COMPLETED: {
      label: 'Concluido',
      badge: 'text-white',
      card: 'app-card',
      tone: 'var(--success)',
    },
    COMPLETED_LATE: {
      label: 'Concluido com atraso',
      badge: 'text-white',
      card: 'app-card',
      tone: 'var(--warning)',
    },
  } as const;

  const statusStyle = statusMap[checklist.status];
  const dueLabel = checklist.dueDate
    ? new Date(checklist.dueDate).toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Sem prazo';

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
      className={`cursor-pointer rounded-[24px] p-4 transition hover:-translate-y-1 hover:shadow-xl ${statusStyle.card}`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle.badge}`}
            style={{ backgroundColor: statusStyle.tone }}
          >
            {statusStyle.label}
          </span>
          <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
            {checklist.itemCount} itens
          </span>
          <span className="max-w-full truncate rounded-full bg-[var(--surface)] px-3 py-1 text-[11px] font-medium text-[var(--text-secondary)]">
            {checklist.storeCode ?? checklist.storeName ?? 'Sem loja'}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className={`truncate text-lg font-black tracking-tight ${checklist.completed ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
            {checklist.title}
          </h3>
          {checklist.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--text-secondary)]">{checklist.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="min-w-0 rounded-2xl bg-[var(--surface)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">Criado</p>
            <p className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]">
              {new Date(checklist.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="min-w-0 rounded-2xl bg-[var(--surface)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">Prazo</p>
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[var(--text-primary)]">{dueLabel}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-[var(--surface)] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-strong)] text-sm font-bold text-[var(--text-primary)]">
              {getInitials(checklist.createdByUserName)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">Criado por</p>
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{checklist.createdByUserName ?? 'Nao informado'}</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-[var(--surface)] p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--text-primary)]">
              {getInitials(checklist.assignedToUserName)}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-soft)]">Responsavel</p>
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">{checklist.assignedToUserName ?? 'Nao atribuido'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`min-w-0 rounded-2xl px-3 py-2 text-xs font-semibold transition ${
              checklist.completed
                ? 'bg-[var(--surface)] text-[var(--text-primary)] hover:opacity-80'
                : 'text-white hover:opacity-85'
            }`}
            style={checklist.completed ? undefined : { backgroundColor: 'var(--accent)' }}
          >
            <span className="block truncate">{checklist.completed ? 'Reabrir' : 'Concluir'}</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="min-w-0 rounded-2xl px-3 py-2 text-xs font-semibold transition"
            style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 16%, transparent)', color: 'var(--danger)' }}
          >
            <span className="block truncate">Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
