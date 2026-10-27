import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface MarketingHeroProps {
  eyebrow: string
  title: string
  description: string
  primaryAction: ReactNode
  secondaryAction?: ReactNode
  className?: string
}

export function MarketingHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: MarketingHeroProps) {
  return (
    <section
      className={cn("relative isolate overflow-hidden rounded-[2rem] bg-[#071426] text-white", className)}
      aria-label={eyebrow}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 85% at 9% 2%, rgba(36,92,181,.72), transparent 75%), radial-gradient(ellipse 50% 80% at 100% 30%, rgba(0,170,255,.22), transparent 70%)",
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full border border-white/15" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-4 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-white/15" />
      <div aria-hidden="true" className="pointer-events-none absolute right-24 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-[#00AAFF]/20 blur-3xl" />
      <div className="relative z-10 max-w-3xl px-8 py-16 sm:px-14 sm:py-20 lg:py-24">
        <p className="mb-6 text-xs font-semibold tracking-[0.28em] text-[#9BDFFF]">{eyebrow}</p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">{description}</p>
        <div className="mt-9 flex flex-wrap gap-3">{primaryAction}{secondaryAction}</div>
      </div>
    </section>
  )
}
