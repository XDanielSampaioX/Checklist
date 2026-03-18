'use client';

import { useEffect, useState } from 'react';
import { authApi, checklistApi, UserSummary } from '@/lib/api';

interface CreateChecklistModalProps {
  onClose: () => void;
  onCreated: () => void;
  currentUser: UserSummary;
}

export default function CreateChecklistModal({ onClose, onCreated, currentUser }: CreateChecklistModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignableUsers, setAssignableUsers] = useState<UserSummary[]>([]);
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authApi.listAssignableUsers()
      .then(users => {
        setAssignableUsers(users);
        const self = users.find(user => user.id === currentUser.id);
        setAssignedToUserId(String(self?.id ?? currentUser.id));
      })
      .catch(() => {
        setAssignableUsers([currentUser]);
        setAssignedToUserId(String(currentUser.id));
      });
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await checklistApi.create({
        title,
        description,
        dueDate: dueDate || null,
        assignedToUserId: Number(assignedToUserId),
      });
      onCreated();
      onClose();
    } catch (err) {
      setError('Failed to create checklist. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)]">
      <div className="app-panel w-full max-w-md rounded-[28px] p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-bold text-[var(--text-primary)]">Nova checklist</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Titulo *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex.: Lista de compras"
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Descricao</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Resumo do objetivo da checklist"
              rows={3}
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Prazo</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Responsavel</label>
            <select
              value={assignedToUserId}
              onChange={e => setAssignedToUserId(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none"
            >
              {assignableUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} · {user.role}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="app-accent-button flex-1 rounded-2xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
