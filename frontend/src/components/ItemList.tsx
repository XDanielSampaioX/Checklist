'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, itemApi } from '@/lib/api';

interface ItemListProps {
  checklistId: number;
}

export default function ItemList({ checklistId }: ItemListProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
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
      await itemApi.create(checklistId, { description: newItemDesc, completed: false });
      setNewItemDesc('');
      loadItems();
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await itemApi.delete(checklistId, itemId);
      loadItems();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-4 text-center text-sm text-gray-400">Loading items...</div>;

  return (
    <div>
      <form onSubmit={handleAddItem} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItemDesc}
          onChange={e => setNewItemDesc(e.target.value)}
          placeholder="Add a new item..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {adding ? '...' : 'Add'}
        </button>
      </form>
      <div className="space-y-2">
        {items.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">No items yet. Add one above!</p>
        )}
        {items.map(item => (
          <div
            key={item.id}
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              item.completed ? 'border-green-100 bg-green-50' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <button
              onClick={() => handleToggle(item.id)}
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                item.completed ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
              }`}
            >
              {item.completed && '✓'}
            </button>
            <span className={`flex-1 text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {item.description}
            </span>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
