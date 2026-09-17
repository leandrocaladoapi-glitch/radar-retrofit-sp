import Link from 'next/link'
import { Calendar, Tag, ChevronRight } from 'lucide-react'
import artigos from '../../data/artigos.json'
import PageHeader from '../../components/ui/PageHeader'

export const metadata = {
  title: 'Artigos e Atualizações',
  description:
    'Acompanhe as últimas análises, oportunidades de retrofit e movimentações de requalificação urbana no Centro de São Paulo.',
}

export default function ArtigosIndexPage() {
  const sortedArtigos = [...artigos].sort(
    (a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime()
  )

  return (
    <div className="page-shell mx-auto max-w-5xl space-y-10">
      <div className="border-b border-line pb-8">
        <PageHeader
          className="mb-0"
          title="Radar Editorial"
          description="Análises geradas automaticamente a partir de nossa base de inteligência sobre o mercado de retrofit, subvenções e requalificação no Centro de São Paulo."
        />
      </div>

      {sortedArtigos.length === 0 ? (
        <div className="card p-8 text-center text-fg-muted">
          Nenhum artigo publicado ainda. O Radar está processando os dados para a primeira atualização.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sortedArtigos.map((art) => (
            <Link
              key={art.slug}
              href={`/artigos/${art.slug}`}
              className="card card-interactive group flex h-full flex-col overflow-hidden"
            >
              <div className="flex flex-grow flex-col p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded bg-accent-muted px-2.5 py-1 text-xs font-bold text-accent">{art.categoria}</span>
                  <span className="flex items-center gap-1 text-xs text-fg-subtle">
                    <Calendar size={12} aria-hidden />
                    {new Date(art.dataPublicacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h2 className="mb-3 line-clamp-3 text-xl font-bold text-fg transition-colors duration-180 group-hover:text-accent">
                  {art.title}
                </h2>

                <p className="mb-6 text-sm text-fg-muted line-clamp-3">{art.descricao}</p>

                <div className="mt-auto">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {art.tags.slice(0, 2).map((tag: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs text-fg-muted">
                        <Tag size={10} aria-hidden /> {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm font-semibold text-accent transition-transform duration-180 group-hover:translate-x-1">
                    Ler artigo completo <ChevronRight size={16} className="ml-1" aria-hidden />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
