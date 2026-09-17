import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radar-retrofit.lcfconsulting.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Radar Retrofit São Paulo | Inteligência em Requalificação | LCF Consulting',
    template: '%s | Radar Retrofit SP'
  },
  description: 'Plataforma de inteligência artificial e dados sobre oportunidades de retrofit, requalificação imobiliária e subvenção econômica no Centro de São Paulo.',
  keywords: ['retrofit são paulo', 'requalifica centro', 'subvenção econômica sp', 'investimento imobiliário centro sp', 'retrofit ai', 'inteligência de mercado imobiliário', 'oportunidades retrofit', 'LCF Consulting'],
  authors: [{ name: 'LCF Consulting' }],
  creator: 'LCF Consulting',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    title: 'Radar Retrofit São Paulo | LCF Consulting',
    description: 'Encontre oportunidades de retrofit e requalificação no Centro de SP com nossa engine de dados públicos e inteligência artificial.',
    siteName: 'Radar Retrofit SP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar Retrofit São Paulo',
    description: 'Inteligência e dados sobre requalificação imobiliária e subvenção econômica no Centro de São Paulo.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Radar Retrofit São Paulo',
    url: siteUrl,
    description: 'Inteligência sobre requalificação imobiliária e incentivos públicos no Centro de São Paulo.',
    publisher: {
      '@type': 'Organization',
      name: 'LCF Consulting',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/oportunidades?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
        {/* JSON-LD Schema for Google & AI Search Engines */}
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

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
              <Link href="/artigos" className="hover:text-blue-300 transition text-amber-300">Radar Editorial</Link>
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
