import { getToken } from './session';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, { ...init, headers });
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'OPERATOR';
  supervisorId: number | null;
  storeId: number | null;
  storeName: string | null;
}

export interface LoginResponse {
  token: string;
  user: UserSummary;
}

export interface Checklist {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  status: 'IN_PROGRESS' | 'OVERDUE' | 'COMPLETED' | 'COMPLETED_LATE';
  overdue: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  completedAt: string | null;
  assignedToUserId: number | null;
  assignedToUserName: string | null;
  createdByUserId: number | null;
  createdByUserName: string | null;
  storeId: number | null;
  storeName: string | null;
}

export interface DashboardReport {
  totalChecklists: number;
  completedCount: number;
  completedLateCount: number;
  inProgressCount: number;
  overdueCount: number;
  totalItems: number;
  completionRate: number;
  overdueRate: number;
  recentChecklists: Checklist[];
  overdueChecklists: Checklist[];
}

export interface Item {
  id: number;
  description: string;
  completed: boolean;
  requiredAttachment: boolean;
  order: number;
  checklistId: number;
  createdAt: string;
  attachments: ItemAttachment[];
}

export interface ItemAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
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

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiFetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Failed to login');
    return res.json();
  },
  me: async (): Promise<UserSummary> => {
    const res = await apiFetch(`${API_BASE}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },
  listAssignableUsers: async (): Promise<UserSummary[]> => {
    const res = await apiFetch(`${API_BASE}/users/assignable`);
    if (!res.ok) throw new Error('Failed to fetch assignable users');
    return res.json();
  },
};

export const checklistApi = {
  getAll: async (): Promise<Checklist[]> => {
    const res = await apiFetch(`${API_BASE}/checklists`);
    if (!res.ok) throw new Error('Failed to fetch checklists');
    return res.json();
  },
  getById: async (id: number): Promise<Checklist> => {
    const res = await apiFetch(`${API_BASE}/checklists/${id}`);
    if (!res.ok) throw new Error('Failed to fetch checklist');
    return res.json();
  },
  getDashboard: async (): Promise<DashboardReport> => {
    const res = await apiFetch(`${API_BASE}/checklists/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard report');
    return res.json();
  },
  create: async (data: Partial<Checklist>): Promise<Checklist> => {
    const res = await apiFetch(`${API_BASE}/checklists`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create checklist');
    return res.json();
  },
  update: async (id: number, data: Partial<Checklist>): Promise<Checklist> => {
    const res = await apiFetch(`${API_BASE}/checklists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update checklist');
    return res.json();
  },
  delete: async (id: number): Promise<void> => {
    const res = await apiFetch(`${API_BASE}/checklists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete checklist');
  },
  toggle: async (id: number): Promise<Checklist> => {
    const res = await apiFetch(`${API_BASE}/checklists/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle checklist');
    return res.json();
  },
};

export const itemApi = {
  getByChecklist: async (checklistId: number): Promise<Item[]> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items`);
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },
  create: async (checklistId: number, data: Partial<Item>): Promise<Item> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create item');
    return res.json();
  },
  update: async (checklistId: number, itemId: number, data: Partial<Item>): Promise<Item> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update item');
    return res.json();
  },
  delete: async (checklistId: number, itemId: number): Promise<void> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete item');
  },
  toggle: async (checklistId: number, itemId: number): Promise<Item> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}/toggle`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to toggle item');
    return res.json();
  },
  addAttachment: async (checklistId: number, itemId: number, fileName: string, fileUrl: string): Promise<ItemAttachment> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}/attachments`, {
      method: 'POST',
      body: JSON.stringify({ fileName, fileUrl }),
    });
    if (!res.ok) throw new Error('Failed to add attachment');
    return res.json();
  },
  removeAttachment: async (checklistId: number, itemId: number, attachmentId: number): Promise<void> => {
    const res = await apiFetch(`${API_BASE}/checklists/${checklistId}/items/${itemId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove attachment');
  },
};

export const agentApi = {
  execute: async (prompt: string): Promise<AgentResponse> => {
    const res = await apiFetch(`${API_BASE}/agent/execute`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to execute agent command');
    return res.json();
  },
};
