import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, FileText, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function AtualizacoesPage() {
  const updates = [
    { id: 1, type: 'edital', date: new Date().toISOString(), title: 'Novo edital detectado', desc: '4º Chamamento Público publicado no Diário Oficial.' },
    { id: 2, type: 'status', date: new Date(Date.now() - 86400000).toISOString(), title: 'Mudança de Status', desc: 'Projeto Edifício Virgínia avançou para "Em execução".' },
    { id: 3, type: 'credenciamento', date: new Date(Date.now() - 172800000).toISOString(), title: 'Credenciamento Aprovado', desc: 'Edifício Martinelli teve credenciamento aprovado (3º Chamamento).' },
  ]

  return (
    <div className="page-shell page-shell-narrow max-w-3xl space-y-6">
      <PageHeader
        title="Atualizações e Inteligência Temporal"
        description="Acompanhe as mudanças mais recentes detectadas nos dados públicos."
      />

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-muted p-4 font-semibold text-fg">Linha do Tempo Recente</div>
        <div className="divide-y divide-[var(--line)]">
          {updates.map((update) => (
            <div key={update.id} className="flex gap-4 p-4 transition duration-180 hover:bg-muted">
              <div className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                {update.type === 'edital' ? (
                  <FileText className="text-accent" size={20} aria-hidden />
                ) : update.type === 'status' ? (
                  <Bell className="text-warning" size={20} aria-hidden />
                ) : (
                  <CheckCircle2 className="text-success" size={20} aria-hidden />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-fg">{update.title}</h4>
                <p className="mt-1 text-sm text-fg-muted">{update.desc}</p>
                <span className="mt-2 block text-xs text-fg-subtle">
                  {formatDistanceToNow(new Date(update.date), { addSuffix: true, locale: ptBR })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
