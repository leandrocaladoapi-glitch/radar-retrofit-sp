import { cn } from '../../lib/cn'

interface MetricCardProps {
  icon?: React.ReactNode
  label: React.ReactNode
  value: React.ReactNode
  detail?: React.ReactNode
  className?: string
}

export default function MetricCard({ icon, label, value, detail, className }: MetricCardProps) {
  return (
    <article
      className={cn(
        'card flex flex-col justify-between p-5 md:p-6',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-fg-muted">
        {icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-accent-muted text-accent" aria-hidden>
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      <div className="kpi-value text-3xl md:text-[2rem]">{value}</div>
      {detail && <div className="mt-3 text-sm text-fg-muted">{detail}</div>}
    </article>
  )
}
