import { useId } from "react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center rounded-xl border border-dashed border-[var(--as-border)] bg-[var(--as-surface)] px-6 py-12 text-center", className)}>
      {icon && <div aria-hidden="true" className="mb-4 text-[var(--as-primary)]">{icon}</div>}
      <h3 className="text-base font-semibold text-[var(--as-text)]">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-6 text-[var(--as-muted)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export interface SkeletonProps {
  className?: string
  label?: string
}

export function Skeleton({ className, label = "内容加载中" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("h-4 w-full animate-pulse rounded-md bg-[var(--as-surface-alt)] motion-reduce:animate-none", className)}
    />
  )
}

export interface ProgressProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  className?: string
}

export function Progress({ value, max = 100, label, showValue = false, className }: ProgressProps) {
  const labelId = useId()
  const validMax = Number.isFinite(max) && max > 0 ? max : 100
  const validValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), validMax) : 0
  const percentage = Math.round((validValue / validMax) * 100)

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-medium">
          {label && <span id={labelId} className="text-[var(--as-muted)]">{label}</span>}
          {showValue && <span className="ml-auto tabular-nums text-[var(--as-text)]">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label ? undefined : "进度"}
        aria-labelledby={label ? labelId : undefined}
        aria-valuemin={0}
        aria-valuemax={validMax}
        aria-valuenow={validValue}
        className="h-2 overflow-hidden rounded-full bg-[var(--as-surface-alt)]"
      >
        <div className="h-full rounded-full bg-[var(--as-primary)] transition-[width] motion-reduce:transition-none" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
