import { useId, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface TabItem {
  value: string
  label: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  ariaLabel?: string
}

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  ariaLabel = "内容标签",
}: TabsProps) {
  const baseId = useId()
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? items.find((item) => !item.disabled)?.value ?? "",
  )
  const selectedValue = value ?? internalValue
  const selectedIndex = items.findIndex(
    (item) => item.value === selectedValue && !item.disabled,
  )
  const activeIndex = selectedIndex >= 0 ? selectedIndex : items.findIndex((item) => !item.disabled)

  function select(index: number, focus = false) {
    const item = items[index]
    if (!item || item.disabled) return
    if (value === undefined) setInternalValue(item.value)
    onValueChange?.(item.value)
    if (focus) buttons.current[index]?.focus()
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabled = items.flatMap((item, itemIndex) => (item.disabled ? [] : [itemIndex]))
    if (!enabled.length) return

    let nextIndex: number | undefined
    if (event.key === "Home") nextIndex = enabled[0]
    if (event.key === "End") nextIndex = enabled[enabled.length - 1]
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const current = enabled.indexOf(index)
      const offset = event.key === "ArrowRight" ? 1 : -1
      nextIndex = enabled[(current + offset + enabled.length) % enabled.length]
    }
    if (nextIndex === undefined) return
    event.preventDefault()
    select(nextIndex, true)
  }

  return (
    <div className={cn("min-w-0", className)}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex gap-1 overflow-x-auto border-b border-[var(--as-border)]"
      >
        {items.map((item, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={item.value}
              ref={(node) => { buttons.current[index] = node }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                "relative shrink-0 rounded-t-md px-4 py-3 text-sm font-medium transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--as-ring)]",
                "disabled:cursor-not-allowed disabled:opacity-40",
                selected
                  ? "text-[var(--as-primary)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[var(--as-primary)]"
                  : "text-[var(--as-muted)] hover:bg-[var(--as-surface-alt)] hover:text-[var(--as-text)]",
              )}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item, index) => (
        <div
          key={item.value}
          id={`${baseId}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${index}`}
          tabIndex={0}
          hidden={index !== activeIndex}
          className="py-5 text-[var(--as-text)] focus-visible:outline-2 focus-visible:outline-[var(--as-ring)]"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
