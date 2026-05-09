// Export utilities — web only (uses Blob + URL.createObjectURL)

function triggerDownload(blob, filename) {
  if (typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportJSON(tasks) {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  triggerDownload(blob, `tasks_backup_${today()}.json`);
}

export function exportCSV(tasks) {
  const headers = ['id','name','category','taskCategory','recurringType','completed','dueDateSeconds','createdAt'];
  const rows = tasks.map(t =>
    headers.map(h => {
      const val = t[h] ?? '';
      // Escape commas / quotes
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  triggerDownload(blob, `tasks_export_${today()}.csv`);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
