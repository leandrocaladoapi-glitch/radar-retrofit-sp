import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Radar Retrofit São Paulo',
  description: 'Inteligência sobre requalificação imobiliária, incentivos públicos e oportunidades no Centro de São Paulo. Produzido por LCF Consulting.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        <header className="bg-slate-900 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Radar Retrofit SP
            </Link>
            <nav className="space-x-4 text-sm font-medium">
              <Link href="/pipeline" className="hover:text-blue-300 transition">Pipeline</Link>
              <Link href="/chamamento-atual" className="hover:text-blue-300 transition">Chamamento Atual</Link>
              <Link href="/mapa" className="hover:text-blue-300 transition">Mapa</Link>
              <Link href="/projetos" className="hover:text-blue-300 transition">Projetos</Link>
              <Link href="/oportunidades" className="hover:text-blue-300 transition">Oportunidades</Link>
            </nav>
          </div>
        </header>

        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-4">
              <p className="text-sm font-semibold text-white mb-2">Precisa analisar uma oportunidade específica?</p>
              <p className="text-sm">LCF Consulting — Inteligência urbana, regulatória e de investimentos.</p>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl mx-auto">
              Projeto independente de inteligência produzido pela LCF Consulting com base em dados públicos.
              Não substitui análise profissional habilitada. Não endossado oficialmente pela Prefeitura de São Paulo.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
