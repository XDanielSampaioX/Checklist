'use client';

import { useState } from 'react';
import { agentApi, AgentResponse } from '@/lib/api';

interface AgentPanelProps {
  onCommandExecuted: () => void;
}

export default function AgentPanel({ onCommandExecuted }: AgentPanelProps) {
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
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-2xl">🤖</span>
        <div>
          <h2 className="font-bold text-purple-800">AI Agent</h2>
          <p className="text-xs text-purple-600">Execute commands using natural language</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Type a command... e.g., create a checklist called 'Tasks'"
            className="flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm focus:border-purple-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '...' : '▶ Run'}
          </button>
        </div>
      </form>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-purple-700">Example prompts:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map(example => (
            <button
              key={example}
              onClick={() => setPrompt(example)}
              className="rounded-full border border-purple-200 bg-white px-3 py-1 text-xs text-purple-600 hover:bg-purple-100"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-purple-700">Command History:</p>
          {history.map((entry, i) => (
            <div key={i} className={`rounded-lg p-3 text-xs ${entry.response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="font-medium text-gray-700">› {entry.prompt}</p>
              <p className={`mt-1 ${entry.response.success ? 'text-green-700' : 'text-red-600'}`}>
                {entry.response.result}
              </p>
              {entry.response.action && (
                <p className="mt-0.5 text-gray-400">Action: {entry.response.action}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
