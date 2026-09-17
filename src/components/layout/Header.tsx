'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '../../lib/cn'
import ThemeToggle from '../theme/ThemeToggle'
import { SiteMark } from './SiteMark'

const NAV = [
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/chamamento-atual', label: 'Chamamento Atual' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/projetos', label: 'Projetos' },
  { href: '/oportunidades', label: 'Oportunidades' },
  { href: '/artigos', label: 'Radar Editorial' },
] as const

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuId = useId()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[var(--header-bg)] backdrop-blur-xl">
      <div className="h-[3px] bg-gradient-to-r from-gold via-accent to-gold" aria-hidden />
      <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-3 px-4 md:h-18 md:px-6 lg:px-8">
        <Link
          href="/"
          className="min-h-tap min-w-tap rounded-md focus-visible:outline-none"
          aria-label="Radar Retrofit SP — página inicial"
        >
          <SiteMark compact />
        </Link>

        <nav aria-label="Principal" className="hidden items-center xl:flex">
          <ul className="flex items-center gap-0.5">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex min-h-tap items-center px-3 text-[13px] font-semibold tracking-tight text-fg-muted transition duration-180 ease-radar hover:text-fg',
                      active && 'text-fg'
                    )}
                  >
                    {item.label}
                    {item.href === '/artigos' && (
                      <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                    )}
                    {active && (
                      <span
                        className="absolute inset-x-3 -bottom-[14px] h-[3px] rounded-full bg-gold"
                        aria-hidden
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <div className="sm:hidden">
            <ThemeToggle compact />
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-line bg-surface text-fg xl:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden" id={menuId}>
          <button
            type="button"
            className="fixed inset-0 top-[calc(var(--header-h)+3px)] z-40 bg-[var(--overlay)]"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Menu móvel"
            className="absolute inset-x-0 top-full z-50 border-b border-line bg-surface p-3 shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-tap items-center rounded-md px-4 text-base font-semibold text-fg-muted transition duration-180 ease-radar hover:bg-muted hover:text-fg',
                        active && 'bg-muted text-fg'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
