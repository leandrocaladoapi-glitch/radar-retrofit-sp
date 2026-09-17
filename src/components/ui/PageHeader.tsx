import { cn } from '../../lib/cn'

interface PageHeaderProps {
  title: string
  description?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({ title, description, meta, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-8 md:mb-10', className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">{title}</h1>
          {description && (
            <div className="text-base leading-relaxed text-fg-muted md:text-lg">{description}</div>
          )}
          {meta}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
