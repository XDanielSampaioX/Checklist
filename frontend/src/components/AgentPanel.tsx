'use client';

import { useState } from 'react';
import { agentApi, AgentResponse } from '@/lib/api';

interface AgentPanelProps {
  onCommandExecuted: () => void;
  onClose?: () => void;
}

export default function AgentPanel({ onCommandExecuted, onClose }: AgentPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ prompt: string; response: AgentResponse }>>([]);

  const examples = [
    "create a checklist called 'Shopping List'",
    "list all checklists",
    "add item 'Buy milk' to checklist 1",
    "mark checklist 1 as complete",
    "show items in checklist 1",
    "delete checklist 1",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await agentApi.execute(prompt);
      setHistory(prev => [{ prompt, response }, ...prev]);
      setPrompt('');
      onCommandExecuted();
    } catch (err) {
      setHistory(prev => [{
        prompt,
        response: { action: 'error', result: 'Failed to connect to backend. Make sure the Java server is running on port 8080.', success: false }
      }, ...prev]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-panel rounded-[28px] p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl" style={{ backgroundColor: 'var(--accent-soft)' }}>
            🤖
          </span>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">AI Agent</h2>
            <p className="text-xs text-[var(--text-secondary)]">Execute commands using natural language</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--text-soft)] transition hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
            aria-label="Close panel"
          >
            ×
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Type a command... e.g., create a checklist called 'Tasks'"
            className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-soft)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="app-accent-button rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {loading ? '...' : '▶ Run'}
          </button>
        </div>
      </form>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">Example prompts</p>
        <div className="flex flex-wrap gap-2">
          {examples.map(example => (
            <button
              type="button"
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)]">Command history</p>
          {history.map((entry, i) => (
            <div key={i} className="rounded-2xl border p-3 text-xs" style={entry.response.success
              ? { borderColor: 'color-mix(in srgb, var(--success) 28%, var(--border))', backgroundColor: 'color-mix(in srgb, var(--success) 12%, var(--surface-strong))' }
              : { borderColor: 'color-mix(in srgb, var(--danger) 28%, var(--border))', backgroundColor: 'color-mix(in srgb, var(--danger) 12%, var(--surface-strong))' }}>
              <p className="font-medium text-[var(--text-primary)]">› {entry.prompt}</p>
              <p className="mt-1" style={{ color: entry.response.success ? 'var(--success)' : 'var(--danger)' }}>
                {entry.response.result}
              </p>
              {entry.response.action && (
                <p className="mt-1 text-[var(--text-soft)]">Action: {entry.response.action}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
