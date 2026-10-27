import * as React from "react"
import { cn } from "@/lib/utils"

interface ChoiceExtras {
  label?: React.ReactNode
  description?: React.ReactNode
  invalid?: boolean
}

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
    ChoiceExtras {}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, invalid, id, className, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex items-start gap-2.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={description ? `${inputId}-description` : undefined}
          className={cn(
            "mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer accent-[var(--as-primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-ring)] focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {(label || description) && (
          <div className={cn("grid gap-0.5", disabled && "opacity-50")}>
            {label && (
              <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-[var(--as-text)]">
                {label}
              </label>
            )}
            {description && (
              <p id={`${inputId}-description`} className="text-xs leading-relaxed text-[var(--as-muted)]">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
)

Checkbox.displayName = "Checkbox"

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
    ChoiceExtras {}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, invalid, id, className, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex items-start gap-2.5">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={description ? `${inputId}-description` : undefined}
          className={cn(
            "mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer accent-[var(--as-primary)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-ring)] focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        {(label || description) && (
          <div className={cn("grid gap-0.5", disabled && "opacity-50")}>
            {label && (
              <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-[var(--as-text)]">
                {label}
              </label>
            )}
            {description && (
              <p id={`${inputId}-description`} className="text-xs leading-relaxed text-[var(--as-muted)]">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
)

Radio.displayName = "Radio"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
    ChoiceExtras {}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, invalid, id, className, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id ?? generatedId
    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={description ? `${inputId}-description` : undefined}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "relative mt-0.5 block h-6 w-11 shrink-0 cursor-pointer rounded-full bg-[var(--as-border)] transition-colors",
            "peer-checked:bg-[var(--as-primary)] peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--as-ring)] peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-5",
            className,
          )}
        />
        {(label || description) && (
          <div className={cn("grid gap-0.5", disabled && "opacity-50")}>
            {label && (
              <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-[var(--as-text)]">
                {label}
              </label>
            )}
            {description && (
              <p id={`${inputId}-description`} className="text-xs leading-relaxed text-[var(--as-muted)]">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
)

Switch.displayName = "Switch"
