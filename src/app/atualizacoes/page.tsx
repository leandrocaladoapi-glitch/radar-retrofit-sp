import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, FileText, CheckCircle2, Archive } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import feed from '../../data/atualizacoes.json'

interface ItemFeed {
  tipo: string
  rotulo: string
  data: string
  sql: string | null
  slug: string | null
  nome: string | null
  campo: string | null
  antes: unknown
  depois: unknown
  motivo: string | null
  fonte: string | null
}

function descricao(item: ItemFeed): string {
  if (item.tipo === 'alteracao' && item.campo) {
    return `${item.campo}: ${String(item.antes ?? '—')} → ${String(item.depois ?? '—')}`
  }
  if (item.tipo === 'publicada') {
    return item.nome ? `${item.nome} — SQL ${item.sql}` : `SQL ${item.sql}`
  }
  if (item.tipo === 'arquivada') {
    return `${item.nome || item.sql} — ${item.motivo || 'deixou de atender aos critérios'}`
  }
  return item.motivo || item.nome || item.sql || item.rotulo
}

export default function AtualizacoesPage() {
  const itens = (feed.itens || []) as ItemFeed[]

  return (
    <div className="page-shell page-shell-narrow max-w-3xl space-y-6">
      <PageHeader
        title="Atualizações e Inteligência Temporal"
        description="Eventos reais do pipeline (fontes oficiais → validação → publicação). Nenhum item é redigido manualmente."
        meta={
          <p className="text-xs text-fg-subtle">
            {feed.totalEventos} eventos no histórico auditável • feed atualizado em{' '}
            {new Date(feed.atualizadoEm).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        }
      />

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-muted p-4 font-semibold text-fg">Linha do Tempo Recente</div>
        {itens.length > 0 ? (
          <div className="divide-y divide-[var(--line)]">
            {itens.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-4 transition duration-180 hover:bg-muted">
                <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {item.tipo === 'publicada' ? (
                    <FileText className="text-accent" size={20} aria-hidden />
                  ) : item.tipo === 'alteracao' ? (
                    <Bell className="text-warning" size={20} aria-hidden />
                  ) : item.tipo === 'arquivada' ? (
                    <Archive className="text-fg-subtle" size={20} aria-hidden />
                  ) : (
                    <CheckCircle2 className="text-success" size={20} aria-hidden />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-fg">{item.rotulo}</h4>
                  <p className="mt-1 break-words text-sm text-fg-muted">{descricao(item)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fg-subtle">
                    <span>{formatDistanceToNow(new Date(item.data), { addSuffix: true, locale: ptBR })}</span>
                    {item.fonte && <span>• {item.fonte}</span>}
                    {item.sql && <span className="font-mono tabular">• SQL {item.sql}</span>}
                  </div>
                  {item.slug && (
                    <Link href={`/oportunidades/${item.slug}`} className="mt-1 inline-block text-xs font-medium text-accent hover:underline">
                      Ver dossiê do imóvel
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-fg-muted">
            Nenhum evento registrado até o momento. O feed é atualizado automaticamente a cada execução do pipeline.
          </div>
        )}
      </div>
    </div>
  )
}
