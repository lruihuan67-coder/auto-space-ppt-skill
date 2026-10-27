import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface MetricCardProps {
  label: string
  value: string
  detail?: string
  icon?: ReactNode
  accent?: "blue" | "sky" | "orange" | "yellow"
  className?: string
}

export function MetricCard({ label, value, detail, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-[var(--as-muted)]">{label}</p>
        {icon && <span className="text-[var(--as-primary)]" aria-hidden="true">{icon}</span>}
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-[var(--as-text)] tabular-nums">{value}</p>
      {detail && <p className="mt-2 text-xs leading-5 text-[var(--as-muted)]">{detail}</p>}
    </Card>
  )
}
