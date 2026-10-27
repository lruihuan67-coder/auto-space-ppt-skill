import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export type AlertVariant = "info" | "success" | "warning" | "danger"

export interface AlertProps {
  title: string
  children?: ReactNode
  variant?: AlertVariant
  action?: ReactNode
  className?: string
}

export function Alert({
  title,
  children,
  variant = "info",
  action,
  className,
}: AlertProps) {
  return (
    <div
      role={variant === "warning" || variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 rounded-lg border border-[var(--as-border)] bg-[var(--as-surface)] px-4 py-3 text-[var(--as-text)]",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {children && <div className="mt-1 text-sm leading-6 text-[var(--as-muted)]">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
