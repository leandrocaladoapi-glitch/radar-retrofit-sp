import Link from 'next/link'
import { RadarMark } from './SiteMark'

const PRODUTO = [
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/chamamento-atual', label: 'Chamamento Atual' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/projetos', label: 'Projetos' },
  { href: '/oportunidades', label: 'Oportunidades' },
  { href: '/artigos', label: 'Radar Editorial' },
]

const INTELIGENCIA = [
  { href: '/mercado', label: 'Inteligência de Mercado' },
  { href: '/relatorio', label: 'Relatório Executivo' },
  { href: '/simulador', label: 'Simulador Indicativo' },
  { href: '/atualizacoes', label: 'Atualizações' },
]

const TRANSPARENCIA = [
  { href: '/metodologia', label: 'Metodologia' },
  { href: '/fontes', label: 'Fontes de Dados' },
]

function NavList({ title, items }: { title: string; items: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#e0b84a]">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex min-h-tap items-center text-sm text-white/70 transition duration-180 ease-radar hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#121a22] text-[#f3f0e6]">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-12 md:grid-cols-2 md:px-6 lg:grid-cols-12 lg:px-8 lg:py-16">
        <div className="lg:col-span-5">
          <div className="inline-flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-[#e0b84a]">
              <RadarMark className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-white">Radar Retrofit SP</span>
          </div>
          <div className="mt-6 max-w-md space-y-2">
            <p className="text-sm font-semibold text-white">Precisa analisar uma oportunidade específica?</p>
            <p className="text-sm text-white/75">LCF Consulting — Inteligência urbana, regulatória e de investimentos.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          <NavList title="Produto" items={PRODUTO} />
          <NavList title="Inteligência" items={INTELIGENCIA} />
          <NavList title="Transparência" items={TRANSPARENCIA} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[90rem] px-4 py-6 md:px-6 lg:px-8">
          <p className="max-w-3xl text-xs leading-relaxed text-white/50">
            Projeto independente de inteligência produzido pela LCF Consulting com base em dados públicos.
            Não substitui análise profissional habilitada. Não endossado oficialmente pela Prefeitura de São Paulo.
          </p>
        </div>
      </div>
    </footer>
  )
}
