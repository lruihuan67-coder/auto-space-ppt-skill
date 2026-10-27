import * as React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "orange"
  | "yellow"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: "sm" | "md"
  dot?: boolean
}

const variants: Record<BadgeVariant, { body: string; dot: string }> = {
  neutral: {
    body: "border-[var(--as-border)] bg-[var(--as-surface-alt)] text-[var(--as-text)]",
    dot: "bg-[var(--as-muted)]",
  },
  primary: {
    body: "border-[var(--as-primary)] bg-[var(--as-surface)] text-[var(--as-primary)]",
    dot: "bg-[var(--as-primary)]",
  },
  info: {
    body: "border-[var(--as-sky)] bg-[var(--as-surface)] text-[var(--as-text)]",
    dot: "bg-[var(--as-sky)]",
  },
  success: {
    body: "border-transparent bg-[var(--as-success-bg)] text-[var(--as-success)]",
    dot: "bg-[var(--as-success)]",
  },
  warning: {
    body: "border-transparent bg-[var(--as-warning-bg)] text-[var(--as-warning)]",
    dot: "bg-[var(--as-warning)]",
  },
  danger: {
    body: "border-[var(--as-danger)] bg-[var(--as-surface)] text-[var(--as-text)]",
    dot: "bg-[var(--as-danger)]",
  },
  orange: {
    body: "border-[var(--as-orange)] bg-[var(--as-surface)] text-[var(--as-text)]",
    dot: "bg-[var(--as-orange)]",
  },
  yellow: {
    body: "border-[var(--as-yellow)] bg-[var(--as-surface)] text-[var(--as-text)]",
    dot: "bg-[var(--as-yellow)]",
  },
}

export function Badge({ variant = "neutral", size = "md", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium leading-none",
        size === "sm" ? "min-h-5 px-2 py-1 text-xs" : "min-h-6 px-2.5 py-1 text-xs",
        variants[variant].body,
        className,
      )}
      {...props}
    >
      {dot && <span aria-hidden="true" className={cn("h-1.5 w-1.5 shrink-0 rounded-full", variants[variant].dot)} />}
      {children}
    </span>
  )
}
