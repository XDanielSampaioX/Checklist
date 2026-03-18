const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Checklist {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: number;
  description: string;
  completed: boolean;
  order: number;
  checklistId: number;
  createdAt: string;
}

export interface AgentRequest {
  prompt: string;
}

export interface AgentResponse {
  action: string;
  result: string;
  success: boolean;
}

export const checklistApi = {
  getAll: async (): Promise<Checklist[]> => {
    const res = await fetch(`${API_BASE}/checklists`);
    if (!res.ok) throw new Error('Failed to fetch checklists');
    return res.json();
  },
  getById: async (id: number): Promise<Checklist> => {
    const res = await fetch(`${API_BASE}/checklists/${id}`);
    if (!res.ok) throw new Error('Failed to fetch checklist');
    return res.json();
  },
  create: async (data: Partial<Checklist>): Promise<Checklist> => {
    const res = await fetch(`${API_BASE}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create checklist');
    return res.json();
  },
  update: async (id: number, data: Partial<Checklist>): Promise<Checklist> => {
    const res = await fetch(`${API_BASE}/checklists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update checklist');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/checklists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete checklist');
  },
  toggle: async (id: number): Promise<Checklist> => {
    const res = await fetch(`${API_BASE}/checklists/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle checklist');
    return res.json();
  },
};

export const itemApi = {
  getByChecklist: async (checklistId: number): Promise<Item[]> => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items`);
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },
  create: async (checklistId: number, data: Partial<Item>): Promise<Item> => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  },
  update: async (checklistId: number, itemId: number, data: Partial<Item>): Promise<Item> => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },
  delete: async (checklistId: number, itemId: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
  },
  toggle: async (checklistId: number, itemId: number): Promise<Item> => {
    const res = await fetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle item');
    return res.json();
  },
};

export const agentApi = {
  execute: async (prompt: string): Promise<AgentResponse> => {
    const res = await fetch(`${API_BASE}/agent/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to execute agent command');
    return res.json();
  },
};
