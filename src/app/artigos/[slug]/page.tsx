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
    }
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
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'LCF Consulting',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/artigos/${artigo.slug}`
    }
  }

  return (
    <article className="max-w-3xl mx-auto pb-16">
      <Script
        id={`json-ld-article-${artigo.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-8">
        <Link href="/artigos" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Voltar para Artigos
        </Link>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className="bg-blue-50 text-blue-700 text-sm font-bold px-3 py-1 rounded">
            {artigo.categoria}
          </span>
          <span className="text-slate-500 text-sm flex items-center gap-1.5">
            <Calendar size={14} />
            Publicado em: {new Date(artigo.dataPublicacao).toLocaleDateString('pt-BR')}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight mb-6">
          {artigo.title}
        </h1>

        <div className="flex flex-wrap gap-2 mt-6 pb-8 border-b border-slate-200">
          {artigo.tags.map((tag: string, idx: number) => (
            <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <Tag size={12}/> {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: artigo.conteudo }}
      />
    </article>
  )
}
