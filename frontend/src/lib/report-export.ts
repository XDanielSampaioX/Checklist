'use client';

import { Checklist, DashboardReport, Item, itemApi } from './api';

export type DetailedChecklist = Checklist & { items: Item[] };
export type ExportFormat = 'excel' | 'pdf';

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function loadDetailedChecklists(checklists: Checklist[]): Promise<DetailedChecklist[]> {
  return Promise.all(
    checklists.map(async checklist => ({
      ...checklist,
      items: await itemApi.getByChecklist(checklist.id),
    }))
  );
}

export function downloadChecklistExcel(detailedChecklists: DetailedChecklist[]) {
  const rows = [
    ['Checklist', 'Responsavel', 'Criado por', 'Status', 'Prazo', 'Loja', 'Item', 'Item concluido', 'Anexo obrigatorio', 'Qtde anexos'],
    ...detailedChecklists.flatMap(checklist => {
      if (!checklist.items || checklist.items.length === 0) {
        return [[
          checklist.title,
          checklist.assignedToUserName ?? 'Sem responsavel',
          checklist.createdByUserName ?? 'Nao informado',
          checklist.status,
          checklist.dueDate ? new Date(checklist.dueDate).toLocaleString('pt-BR') : 'Sem prazo',
          checklist.storeName ?? 'Sem loja',
          'Sem itens',
          '',
          '',
          '',
        ]];
      }

      return checklist.items.map(item => [
        checklist.title,
        checklist.assignedToUserName ?? 'Sem responsavel',
        checklist.createdByUserName ?? 'Nao informado',
        checklist.status,
        checklist.dueDate ? new Date(checklist.dueDate).toLocaleString('pt-BR') : 'Sem prazo',
        checklist.storeName ?? 'Sem loja',
        item.description,
        item.completed ? 'Sim' : 'Nao',
        item.requiredAttachment ? 'Sim' : 'Nao',
        String(item.attachments.length),
      ]);
    }),
  ];

  const csv = rows
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'relatorio-checklists.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function printChecklistPdf(dashboard: DashboardReport, detailedChecklists: DetailedChecklist[]) {
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  if (!printWindow) return false;

  const checklistBlocks = detailedChecklists.map(checklist => {
    const itemRows = checklist.items.length > 0
      ? checklist.items.map(item => `
          <tr>
            <td>${escapeHtml(item.description)}</td>
            <td>${item.completed ? 'Sim' : 'Nao'}</td>
            <td>${item.requiredAttachment ? 'Sim' : 'Nao'}</td>
            <td>${item.attachments.length}</td>
          </tr>
        `).join('')
      : '<tr><td colspan="4">Sem itens</td></tr>';

    return `
      <div class="checklist">
        <h2>${escapeHtml(checklist.title)}</h2>
        <p>
          <strong>Responsavel:</strong> ${escapeHtml(checklist.assignedToUserName ?? 'Sem responsavel')}
          | <strong>Criado por:</strong> ${escapeHtml(checklist.createdByUserName ?? 'Nao informado')}
          | <strong>Status:</strong> ${escapeHtml(checklist.status.replaceAll('_', ' '))}
          | <strong>Prazo:</strong> ${escapeHtml(checklist.dueDate ? new Date(checklist.dueDate).toLocaleString('pt-BR') : 'Sem prazo')}
          | <strong>Loja:</strong> ${escapeHtml(checklist.storeName ?? 'Sem loja')}
        </p>
        <table>
          <thead><tr><th>Item</th><th>Concluido</th><th>Anexo obrigatorio</th><th>Anexos</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
      </div>
    `;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Relatorio de Checklists</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #2d211c; }
          h1 { margin-bottom: 8px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          .card { border: 1px solid #d7c0b4; border-radius: 16px; padding: 16px; background: #fff8f4; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #e4d2c7; padding: 10px; text-align: left; }
          th { background: #f1e2d8; }
          .checklist { margin-top: 28px; page-break-inside: avoid; }
        </style>
      </head>
      <body>
        <h1>Relatorio de Checklists</h1>
        <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        <div class="grid">
          <div class="card"><strong>Total</strong><br/>${dashboard.totalChecklists}</div>
          <div class="card"><strong>Concluidas</strong><br/>${dashboard.completedCount}</div>
          <div class="card"><strong>Vencidas</strong><br/>${dashboard.overdueCount}</div>
          <div class="card"><strong>Itens</strong><br/>${dashboard.totalItems}</div>
        </div>
        ${checklistBlocks || '<p>Sem dados</p>'}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}

export async function exportChecklists(format: ExportFormat, dashboard: DashboardReport, checklists: Checklist[]) {
  const detailedChecklists = await loadDetailedChecklists(checklists);
  if (format === 'excel') {
    downloadChecklistExcel(detailedChecklists);
    return;
  }

  printChecklistPdf(dashboard, detailedChecklists);
}

export function parseExportIntent(prompt: string, allChecklists: Checklist[]) {
  const normalizedPrompt = normalize(prompt);
  const isExport = /(export|baixar|gerar|extrair).*(relatorio|checklist|checklists|planilha|pdf|excel|csv)|\b(pdf|excel|csv)\b/.test(normalizedPrompt);
  if (!isExport) {
    return null;
  }

  const format: ExportFormat = /(pdf)/.test(normalizedPrompt) ? 'pdf' : 'excel';
  const ids = Array.from(prompt.matchAll(/\b\d+\b/g)).map(match => Number(match[0]));
  const quotedTerms = Array.from(prompt.matchAll(/["']([^"']+)["']/g)).map(match => normalize(match[1]));
  const rawTerm = normalizedPrompt
    .replace(/\b(export|exporte|baixar|baixe|gerar|gere|extrair|extraia|relatorio|relatorios|checklist|checklists|em|formato|pdf|excel|csv|das|dos|de|da|do|para|quero|baixar)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let selected = allChecklists;

  if (ids.length > 0) {
    selected = allChecklists.filter(checklist => ids.includes(checklist.id));
  } else if (!normalizedPrompt.includes('todas') && !normalizedPrompt.includes('todos')) {
    const searchTerms = quotedTerms.length > 0 ? quotedTerms : rawTerm ? [rawTerm] : [];
    if (searchTerms.length > 0) {
      selected = allChecklists.filter(checklist => {
        const haystack = normalize([
          checklist.title,
          checklist.description,
          checklist.assignedToUserName,
          checklist.createdByUserName,
          checklist.storeName,
          checklist.storeCode,
        ].filter(Boolean).join(' '));

        return searchTerms.some(term => haystack.includes(term));
      });
    }
  }

  return {
    format,
    selected,
  };
}
