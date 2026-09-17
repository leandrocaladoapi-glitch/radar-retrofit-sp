import Link from 'next/link'
import { Calendar, Tag, ChevronRight } from 'lucide-react'
import artigos from '../../data/artigos.json'

export const metadata = {
  title: 'Artigos e Atualizações',
  description: 'Acompanhe as últimas análises, oportunidades de retrofit e movimentações de requalificação urbana no Centro de São Paulo.',
}

export default function ArtigosIndexPage() {
  // Sort articles by publication date (newest first)
  const sortedArtigos = [...artigos].sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime());

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Radar Editorial</h1>
        <p className="text-xl text-slate-600 max-w-3xl">
          Análises geradas automaticamente a partir de nossa base de inteligência sobre o mercado de retrofit, subvenções e requalificação no Centro de São Paulo.
        </p>
      </div>

      {sortedArtigos.length === 0 ? (
        <div className="bg-slate-50 p-8 rounded-xl text-center border border-slate-200 text-slate-500">
          Nenhum artigo publicado ainda. O Radar está processando os dados para a primeira atualização.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedArtigos.map((art) => (
            <Link key={art.slug} href={`/artigos/${art.slug}`} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-400 transition-all h-full">
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded">
                    {art.categoria}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(art.dataPublicacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-3">
                  {art.title}
                </h2>

                <p className="text-slate-600 text-sm mb-6 line-clamp-3">
                  {art.descricao}
                </p>

                <div className="mt-auto">
                   <div className="flex flex-wrap gap-2 mb-4">
                     {art.tags.slice(0, 2).map((tag: string, idx: number) => (
                       <span key={idx} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                         <Tag size={10}/> {tag}
                       </span>
                     ))}
                   </div>
                   <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                     Ler artigo completo <ChevronRight size={16} className="ml-1"/>
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
