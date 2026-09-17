import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import artigos from '../../../data/artigos.json'

export async function generateStaticParams() {
  return artigos.map((artigo) => ({
    slug: artigo.slug,
  }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const artigo = artigos.find((a) => a.slug === params.slug)

  if (!artigo) {
    return { title: 'Artigo não encontrado' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radar-retrofit.lcfconsulting.com.br'

  return {
    title: artigo.title,
    description: artigo.descricao,
    openGraph: {
      title: artigo.title,
      description: artigo.descricao,
      type: 'article',
      url: `${siteUrl}/artigos/${artigo.slug}`,
      publishedTime: artigo.dataPublicacao,
      modifiedTime: artigo.dataAtualizacao,
      authors: ['LCF Consulting'],
    },
    twitter: {
      card: 'summary_large_image',
      title: artigo.title,
      description: artigo.descricao,
    },
    alternates: {
      canonical: `${siteUrl}/artigos/${artigo.slug}`,
    },
  }
}

export default function ArtigoPage({ params }: { params: { slug: string } }) {
  const artigo = artigos.find((a) => a.slug === params.slug)

  if (!artigo) {
    notFound()
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radar-retrofit.lcfconsulting.com.br'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: artigo.title,
    description: artigo.descricao,
    datePublished: artigo.dataPublicacao,
    dateModified: artigo.dataAtualizacao,
    author: {
      '@type': 'Organization',
      name: 'LCF Consulting',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LCF Consulting',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/artigos/${artigo.slug}`,
    },
  }

  return (
    <article className="page-shell mx-auto max-w-3xl pb-16">
      <Script
        id={`json-ld-article-${artigo.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8">
        <Link href="/artigos" className="mb-8 inline-flex min-h-tap items-center gap-2 text-sm font-medium text-accent hover:underline">
          <ArrowLeft size={16} aria-hidden /> Voltar para Artigos
        </Link>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="rounded bg-accent-muted px-3 py-1 text-sm font-bold text-accent">{artigo.categoria}</span>
          <span className="flex items-center gap-1.5 text-sm text-fg-muted">
            <Calendar size={14} aria-hidden />
            Publicado em: {new Date(artigo.dataPublicacao).toLocaleDateString('pt-BR')}
          </span>
        </div>

        <h1 className="mb-6 font-display text-4xl font-semibold leading-tight text-fg md:text-5xl">{artigo.title}</h1>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-line pb-8">
          {artigo.tags.map((tag: string, idx: number) => (
            <span key={idx} className="chip">
              <Tag size={12} aria-hidden /> {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="radar-prose" dangerouslySetInnerHTML={{ __html: artigo.conteudo }} />
    </article>
  )
}
