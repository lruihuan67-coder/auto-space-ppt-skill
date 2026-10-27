import { useEffect, useId, useRef } from "react"
import type { MouseEvent, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  closeLabel?: string
  className?: string
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  closeLabel = "关闭对话框",
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const id = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
      dialog.showModal()
      const initial = dialog.querySelector<HTMLElement>("[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled])")
      ;(initial ?? closeRef.current)?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) onOpenChange(false)
  }

  function handleClose() {
    if (open) onOpenChange(false)
    returnFocusRef.current?.focus()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
      onClick={handleBackdropClick}
      onClose={handleClose}
      className={cn(
        "m-auto w-[min(92vw,36rem)] max-h-[min(88vh,48rem)] overflow-y-auto rounded-xl border border-[var(--as-border)] bg-[var(--as-surface)] p-0 text-[var(--as-text)] shadow-2xl backdrop:bg-black/60",
        className,
      )}
    >
      <div className="px-6 pt-6">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">{title}</h2>
            {description && (
              <p id={`${id}-description`} className="mt-2 text-sm leading-6 text-[var(--as-muted)]">
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={() => onOpenChange(false)}
            className="grid size-8 shrink-0 place-items-center rounded-md text-[var(--as-muted)] hover:bg-[var(--as-surface-alt)] hover:text-[var(--as-text)] focus-visible:outline-2 focus-visible:outline-[var(--as-ring)]"
          >
            <span aria-hidden="true" className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="py-6">{children}</div>
      </div>
      {footer && (
        <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--as-border)] px-6 py-4">
          {footer}
        </div>
      )}
    </dialog>
  )
}
