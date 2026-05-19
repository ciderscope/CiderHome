import React from "react";
import { Badge } from "./Badge";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export function EntityTable<T extends { id: string }>({ rows, columns }: { rows: T[]; columns: Column<T>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="border-b border-[var(--border)] px-3 py-2 text-[11px] font-bold uppercase text-[var(--mid)]">
                {column.label}
              </th>
            ))}
            <th className="border-b border-[var(--border)] px-3 py-2 text-right text-[11px] font-bold uppercase text-[var(--mid)]">
              Etat
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-[var(--paper2)]">
              {columns.map((column) => (
                <td key={String(column.key)} className="border-b border-[var(--border)] px-3 py-3 text-[var(--ink)]">
                  {column.render ? column.render(row) : String(row[column.key] ?? "")}
                </td>
              ))}
              <td className="border-b border-[var(--border)] px-3 py-3 text-right">
                <Badge variant="ok">suivi</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
