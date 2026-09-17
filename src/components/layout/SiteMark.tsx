import { cn } from '../../lib/cn'

export function RadarMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('shrink-0', className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.32" />
      <circle cx="16" cy="16" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
      <circle cx="16" cy="16" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="1.7" fill="currentColor" />
      <path d="M16 16 L26.2 8.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="26.2" cy="8.4" r="1.35" fill="currentColor" />
    </svg>
  )
}

export function SiteMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-fg">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-gold-fg shadow-sm">
        <RadarMark className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-tight md:text-lg">
          Radar Retrofit SP
        </span>
        {!compact && (
          <span className="mt-1 hidden text-[10px] font-medium uppercase tracking-[0.16em] text-fg-subtle sm:block">
            LCF Consulting
          </span>
        )}
      </span>
    </span>
  )
}
