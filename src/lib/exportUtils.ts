export function downloadCSV(columns: string[], rows: (string | number)[][], filename: string) {
  const csvContent = [
    columns.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
  ].join('\r\n');

  // Add UTF-8 BOM so Excel/Google Sheets opens Indonesian text correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
