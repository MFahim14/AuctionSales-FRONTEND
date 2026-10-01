"use client";

import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

export function Table<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  layout = "auto",
}: {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  layout?: "auto" | "fixed";
}) {
  const fixed = layout === "fixed";
  return (
    <div className={`min-w-0 rounded-[8px] border border-hairline ${fixed ? "overflow-hidden" : "overflow-x-auto"}`}>
      <table className={`${fixed ? "w-full table-fixed" : "min-w-full"} border-collapse text-left text-sm`}>
        <thead className="sticky top-0 bg-surface-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-muted ${
                  fixed ? "break-words" : "whitespace-nowrap"
                } ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className={`border-t border-hairline ${onRowClick ? "cursor-pointer hover:bg-surface-muted" : ""}`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 align-middle text-ink ${column.className ?? ""}`}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
