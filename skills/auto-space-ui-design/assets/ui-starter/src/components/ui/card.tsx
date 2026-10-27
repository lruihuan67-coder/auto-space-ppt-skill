import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "subtle"
  padding?: "none" | "sm" | "md" | "lg"
}

const paddings = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ tone = "default", padding = "md", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border-0 text-[var(--as-text)] shadow-sm",
        tone === "default" ? "bg-[var(--as-surface)]" : "bg-[var(--as-surface-alt)]",
        paddings[padding],
        className,
      )}
      {...props}
    />
  ),
)

Card.displayName = "Card"

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props} />
  ),
)

CardHeader.displayName = "CardHeader"

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-base font-semibold leading-snug tracking-tight text-[var(--as-text)]", className)} {...props} />
  ),
)

CardTitle.displayName = "CardTitle"

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm leading-relaxed text-[var(--as-muted)]", className)} {...props} />
  ),
)

CardDescription.displayName = "CardDescription"

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-4", className)} {...props} />
  ),
)

CardContent.displayName = "CardContent"

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-6 flex items-center gap-3", className)} {...props} />
  ),
)

CardFooter.displayName = "CardFooter"
