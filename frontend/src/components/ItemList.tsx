'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, UserSummary, itemApi } from '@/lib/api';

interface ItemListProps {
  checklistId: number;
  onItemsChanged?: () => void;
  currentUser?: UserSummary | null;
}

export default function ItemList({ checklistId, onItemsChanged, currentUser }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemRequiredAttachment, setNewItemRequiredAttachment] = useState(false);
  const [attachmentDrafts, setAttachmentDrafts] = useState<Record<number, { fileName: string; fileUrl: string }>>({});
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await itemApi.getByChecklist(checklistId);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [checklistId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim()) return;
    setAdding(true);
    try {
      await itemApi.create(checklistId, {
        description: newItemDesc,
        completed: false,
        requiredAttachment: newItemRequiredAttachment,
      });
      setNewItemDesc('');
      setNewItemRequiredAttachment(false);
      loadItems();
      onItemsChanged?.();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (itemId: number) => {
    try {
      await itemApi.toggle(checklistId, itemId);
      loadItems();
      onItemsChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await itemApi.delete(checklistId, itemId);
      loadItems();
      onItemsChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAttachment = async (itemId: number) => {
    const draft = attachmentDrafts[itemId];
    if (!draft?.fileName?.trim() || !draft?.fileUrl?.trim()) return;

    try {
      await itemApi.addAttachment(checklistId, itemId, draft.fileName, draft.fileUrl);
      setAttachmentDrafts(prev => ({ ...prev, [itemId]: { fileName: '', fileUrl: '' } }));
      loadItems();
      onItemsChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAttachment = async (itemId: number, attachmentId: number) => {
    try {
      await itemApi.removeAttachment(checklistId, itemId, attachmentId);
      loadItems();
      onItemsChanged?.();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-4 text-center text-sm text-[var(--text-soft)]">Loading items...</div>;

  return (
    <div>
      <form onSubmit={handleAddItem} className="mb-4 space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemDesc}
            onChange={e => setNewItemDesc(e.target.value)}
            placeholder="Add a new item..."
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="app-accent-button rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {adding ? '...' : 'Add'}
          </button>
        </div>
        {currentUser && currentUser.role !== 'OPERATOR' && (
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={newItemRequiredAttachment}
              onChange={e => setNewItemRequiredAttachment(e.target.checked)}
            />
            Exigir anexo para concluir este item
          </label>
        )}
      </form>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="py-4 text-center text-sm text-[var(--text-soft)]">No items yet. Add one above!</p>
        )}
        {items.map(item => (
          <div
            key={item.id}
            className="rounded-lg border border-[var(--border)] p-3"
            style={item.completed
              ? { backgroundColor: 'color-mix(in srgb, var(--success) 10%, var(--surface-strong))' }
              : { backgroundColor: 'var(--surface-strong)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(item.id)}
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                  item.completed ? 'text-white' : ''
                }`}
                style={item.completed ? { borderColor: 'var(--success)', backgroundColor: 'var(--success)' } : { borderColor: 'var(--border)' }}
              >
                {item.completed && '✓'}
              </button>
              <div className="flex-1">
                <span className={`text-sm ${item.completed ? 'text-[var(--text-soft)] line-through' : 'text-[var(--text-primary)]'}`}>
                  {item.description}
                </span>
                {item.requiredAttachment && (
                  <p className="mt-1 text-xs font-medium" style={{ color: 'var(--warning)' }}>Anexo obrigatorio para concluir</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs"
                style={{ color: 'var(--danger)' }}
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2 rounded-2xl bg-[var(--surface)] p-3">
              <div className="space-y-2">
                {item.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs">
                    <a href={attachment.fileUrl} target="_blank" className="underline" style={{ color: 'var(--accent)' }} rel="noreferrer">
                      {attachment.fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(item.id, attachment.id)}
                      className="font-semibold"
                      style={{ color: 'var(--danger)' }}
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {item.attachments.length === 0 && (
                  <p className="text-xs text-[var(--text-soft)]">Nenhum anexo adicionado.</p>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_auto]">
                <input
                  type="text"
                  value={attachmentDrafts[item.id]?.fileName ?? ''}
                  onChange={e => setAttachmentDrafts(prev => ({ ...prev, [item.id]: { fileName: e.target.value, fileUrl: prev[item.id]?.fileUrl ?? '' } }))}
                  placeholder="Nome do anexo"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs text-[var(--text-primary)]"
                />
                <input
                  type="text"
                  value={attachmentDrafts[item.id]?.fileUrl ?? ''}
                  onChange={e => setAttachmentDrafts(prev => ({ ...prev, [item.id]: { fileName: prev[item.id]?.fileName ?? '', fileUrl: e.target.value } }))}
                  placeholder="URL do anexo"
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-2 text-xs text-[var(--text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => handleAddAttachment(item.id)}
                  className="app-accent-button rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  Anexar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
