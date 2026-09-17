'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTheme, type Theme } from './ThemeProvider'

const OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Tema claro', icon: Sun },
  { id: 'dark', label: 'Tema escuro', icon: Moon },
  { id: 'system', label: 'Tema do sistema', icon: Monitor },
]

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, cycleTheme } = useTheme()

  if (compact) {
    const current = OPTIONS.find((option) => option.id === theme) ?? OPTIONS[2]
    const Icon = current.icon
    return (
      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`${current.label}. Alternar tema`}
        title={current.label}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-surface text-fg-muted transition duration-180 ease-radar hover:border-line-strong hover:text-fg focus-visible:outline-none"
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label="Seleção de tema"
      className="inline-flex items-center rounded-md border border-line bg-muted p-0.5"
    >
      {OPTIONS.map(({ id, label, icon: Icon }) => {
        const active = theme === id
        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            onClick={() => setTheme(id)}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-fg-subtle transition duration-180 ease-radar',
              'hover:text-fg focus-visible:outline-none',
              active && 'bg-surface text-fg shadow-sm'
            )}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
