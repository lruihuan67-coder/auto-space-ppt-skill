import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  id: string
  header: ReactNode
  cell: (row: T, rowIndex: number) => ReactNode
  align?: "left" | "center" | "right"
  className?: string
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  getRowId: (row: T, rowIndex: number) => string
  caption: string
  emptyMessage?: string
  className?: string
}

const alignment = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

export function DataTable<T>({
  columns,
  data,
  getRowId,
  caption,
  emptyMessage = "暂无数据",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-[var(--as-border)] bg-[var(--as-surface)]", className)}>
      <table className="w-full min-w-[40rem] border-collapse text-sm text-[var(--as-text)]">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[var(--as-surface-alt)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn(
                  "px-4 py-3 font-semibold text-[var(--as-muted)]",
                  alignment[column.align ?? "left"],
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={Math.max(columns.length, 1)} className="px-4 py-12 text-center text-[var(--as-muted)]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={getRowId(row, rowIndex)} className="border-t border-[var(--as-border)] hover:bg-[var(--as-surface-alt)]">
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "px-4 py-3 align-middle",
                      alignment[column.align ?? "left"],
                      column.className,
                    )}
                  >
                    {column.cell(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
