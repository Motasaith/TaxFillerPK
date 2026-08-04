export function fmtPKR(n: number | null | undefined, opts?: { compact?: boolean }): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return 'Rs 0';
  const value = Number(n);
  if (opts?.compact) {
    const abs = Math.abs(value);
    if (abs >= 1_00_00_000) return `Rs ${(value / 1_00_00_000).toFixed(2)} crore`;
    if (abs >= 1_00_000) return `Rs ${(value / 1_00_000).toFixed(2)} lakh`;
  }
  return `Rs ${value.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
}

export function fmtNumber(n: number): string {
  return Number(n || 0).toLocaleString('en-PK', { maximumFractionDigits: 0 });
}

export function fmtDate(value?: string | null): string {
  if (!value) return 'Not set';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(value?: string | null): number | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

export function uid(prefix = 'd'): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function downloadBlob(name: string, data: BlobPart, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function toCSV(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`)
        .join(','),
    )
    .join('\r\n');
}
