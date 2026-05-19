export interface CsvColumn<T> {
  key: keyof T;
  label: string;
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const raw = String(value);
  if (/[",\n\r;]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCell(column.label)).join(';');
  const body = rows.map((row) => columns.map((column) => escapeCell(row[column.key])).join(';'));
  return [header, ...body].join('\n');
}

