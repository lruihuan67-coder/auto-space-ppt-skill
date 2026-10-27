import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type ControlSize = "sm" | "md" | "lg"

type FieldContextValue = {
  id: string
  describedBy?: string
  invalid: boolean
  required: boolean
}

const FieldContext = React.createContext<FieldContextValue | null>(null)

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  id: string
  label: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  required?: boolean
  children: React.ReactNode
}

export function Field({
  id,
  label,
  hint,
  error,
  required = false,
  children,
  className,
  ...props
}: FieldProps) {
  const invalid = Boolean(error)
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ")

  return (
    <FieldContext.Provider value={{ id, describedBy: describedBy || undefined, invalid, required }}>
      <div className={cn("grid gap-1.5", className)} {...props}>
        <label htmlFor={id} className="text-sm font-medium text-[var(--as-text)]">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-1 text-[var(--as-danger)]">
              *
            </span>
          )}
        </label>
        {children}
        {hint && (
          <p id={`${id}-hint`} className="text-xs leading-relaxed text-[var(--as-muted)]">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} role="alert" className="text-xs leading-relaxed text-[var(--as-danger)]">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  )
}

const controlBase =
  "w-full rounded-xl border bg-[var(--as-surface)] text-[var(--as-text)] placeholder:text-[var(--as-muted)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--as-surface)]"

const controlSizes: Record<ControlSize, string> = {
  sm: "min-h-8 px-3 py-1.5 text-sm",
  md: "min-h-10 px-3 py-2 text-sm",
  lg: "min-h-12 px-4 py-2.5 text-base",
}

function joinIds(...values: (string | undefined)[]) {
  return values.filter(Boolean).join(" ") || undefined
}

interface ControlExtras {
  uiSize?: ControlSize
  invalid?: boolean
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    ControlExtras {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      uiSize = "md",
      invalid,
      id,
      required,
      className,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const field = React.useContext(FieldContext)
    const isInvalid = invalid ?? field?.invalid ?? false
    return (
      <input
        ref={ref}
        type={type}
        id={id ?? field?.id}
        required={required ?? field?.required}
        aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
        aria-describedby={joinIds(ariaDescribedBy, field?.describedBy)}
        className={cn(
          controlBase,
          controlSizes[uiSize],
          isInvalid ? "border-[var(--as-danger)]" : "border-[var(--as-border)]",
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = "Input"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    ControlExtras {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      uiSize = "md",
      invalid,
      id,
      required,
      className,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const field = React.useContext(FieldContext)
    const isInvalid = invalid ?? field?.invalid ?? false
    return (
      <textarea
        ref={ref}
        id={id ?? field?.id}
        required={required ?? field?.required}
        rows={rows}
        aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
        aria-describedby={joinIds(ariaDescribedBy, field?.describedBy)}
        className={cn(
          controlBase,
          controlSizes[uiSize],
          "min-h-24 resize-y",
          isInvalid ? "border-[var(--as-danger)]" : "border-[var(--as-border)]",
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = "Textarea"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    ControlExtras {
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      uiSize = "md",
      invalid,
      id,
      required,
      className,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      placeholder,
      children,
      ...props
    },
    ref,
  ) => {
    const field = React.useContext(FieldContext)
    const isInvalid = invalid ?? field?.invalid ?? false
    return (
      <span className="relative block w-full">
        <select
          ref={ref}
          id={id ?? field?.id}
          required={required ?? field?.required}
          aria-invalid={ariaInvalid ?? (isInvalid || undefined)}
          aria-describedby={joinIds(ariaDescribedBy, field?.describedBy)}
          className={cn(
            controlBase,
            controlSizes[uiSize],
            "as-select appearance-none pr-12",
            isInvalid ? "border-[var(--as-danger)]" : "border-[var(--as-border)]",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-1/2 size-4 -translate-y-1/2 text-[var(--as-muted)]"
        />
      </span>
    )
  },
)

Select.displayName = "Select"
