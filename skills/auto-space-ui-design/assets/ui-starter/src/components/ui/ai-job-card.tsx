import { Progress } from "@/components/ui/feedback"
import { cn } from "@/lib/utils"

export type AiJobStatus = "queued" | "running" | "succeeded" | "failed"

export interface AiJobCardProps {
  title: string
  description?: string
  project?: string
  status: AiJobStatus
  progress?: number
  updatedAt?: string
  onOpen?: () => void
  onRetry?: () => void
  className?: string
}

const statusMeta: Record<AiJobStatus, { label: string; className: string }> = {
  queued: { label: "排队中", className: "bg-[var(--as-surface-alt)] text-[var(--as-muted)]" },
  running: { label: "运行中", className: "bg-[var(--as-sky)]/10 text-[var(--as-primary)]" },
  succeeded: { label: "已完成", className: "bg-[var(--as-success)]/10 text-[var(--as-success)]" },
  failed: { label: "运行失败", className: "bg-[var(--as-danger)]/10 text-[var(--as-danger)]" },
}

export function AiJobCard({
  title,
  description,
  project,
  status,
  progress,
  updatedAt,
  onOpen,
  onRetry,
  className,
}: AiJobCardProps) {
  const statusInfo = statusMeta[status]

  return (
    <article className={cn("rounded-xl border-0 bg-[var(--as-surface)] p-5 text-[var(--as-text)] shadow-sm", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {project && <p className="mb-1 text-xs font-medium text-[var(--as-muted)]">{project}</p>}
          <h3 className="text-base font-semibold leading-6">{title}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", statusInfo.className)}>
          {statusInfo.label}
        </span>
      </div>
      {description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--as-muted)]">{description}</p>}
      {status === "running" && progress !== undefined && (
        <Progress value={progress} label="任务进度" showValue className="mt-5" />
      )}
      {(updatedAt || onOpen || (status === "failed" && onRetry)) && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--as-border)] pt-4">
          <span className="text-xs text-[var(--as-muted)]">{updatedAt}</span>
          <div className="ml-auto flex items-center gap-3">
            {status === "failed" && onRetry && (
              <button type="button" onClick={onRetry} className="rounded-md px-2 py-1 text-sm font-medium text-[var(--as-primary)] hover:bg-[var(--as-surface-alt)] focus-visible:outline-2 focus-visible:outline-[var(--as-ring)]">
                重试
              </button>
            )}
            {onOpen && (
              <button type="button" onClick={onOpen} className="rounded-md px-2 py-1 text-sm font-medium text-[var(--as-primary)] hover:bg-[var(--as-surface-alt)] focus-visible:outline-2 focus-visible:outline-[var(--as-ring)]">
                查看详情
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
