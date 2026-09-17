import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '../components/theme/ThemeProvider'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-sans',
  weight: '100 900',
  display: 'swap',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-mono',
  weight: '100 900',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radar-retrofit.lcfconsulting.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Radar Retrofit São Paulo | Inteligência em Requalificação | LCF Consulting',
    template: '%s | Radar Retrofit SP',
  },
  description:
    'Plataforma de inteligência artificial e dados sobre oportunidades de retrofit, requalificação imobiliária e subvenção econômica no Centro de São Paulo.',
  keywords: [
    'retrofit são paulo',
    'requalifica centro',
    'subvenção econômica sp',
    'investimento imobiliário centro sp',
    'retrofit ai',
    'inteligência de mercado imobiliário',
    'oportunidades retrofit',
    'LCF Consulting',
  ],
  authors: [{ name: 'LCF Consulting' }],
  creator: 'LCF Consulting',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    title: 'Radar Retrofit São Paulo | LCF Consulting',
    description:
      'Encontre oportunidades de retrofit e requalificação no Centro de SP com nossa engine de dados públicos e inteligência artificial.',
    siteName: 'Radar Retrofit SP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radar Retrofit São Paulo',
    description:
      'Inteligência e dados sobre requalificação imobiliária e subvenção econômica no Centro de São Paulo.',
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

const themeInit = `(function(){try{var t=localStorage.getItem('radar-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.setAttribute('data-theme',d?'dark':'light');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        url: `${siteUrl}/favicon.ico`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/oportunidades?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-bg font-sans text-fg antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <ThemeProvider>
          <a href="#conteudo" className="skip-link">
            Pular para o conteúdo
          </a>
          <Header />
          <main id="conteudo" className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
