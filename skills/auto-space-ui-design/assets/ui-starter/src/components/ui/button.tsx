import * as React from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "link"

export type ButtonSize = "sm" | "md" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--as-primary)] text-white hover:bg-[var(--as-primary-hover)] active:brightness-90",
  secondary:
    "bg-[var(--as-surface-alt)] text-[var(--as-text)] hover:brightness-95 active:brightness-90",
  outline:
    "border border-[var(--as-border)] bg-[var(--as-surface)] text-[var(--as-text)] hover:bg-[var(--as-surface-alt)]",
  ghost:
    "text-[var(--as-text)] hover:bg-[var(--as-surface-alt)]",
  danger:
    "bg-[var(--as-danger)] text-white hover:brightness-90 active:brightness-85",
  link:
    "text-[var(--as-primary)] underline-offset-4 hover:underline",
}

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-2 rounded-[8px] px-3 text-sm",
  md: "min-h-11 gap-2 rounded-[8px] px-4 text-sm",
  lg: "min-h-[52px] gap-2 rounded-[8px] px-5 text-base",
  icon: "h-11 w-11 rounded-[8px] p-0",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      type = "button",
      className,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--as-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--as-surface)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  ),
)

Button.displayName = "Button"
