import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bell, FileText, CheckCircle2 } from 'lucide-react'

export default function AtualizacoesPage() {
  const updates = [
    { id: 1, type: 'edital', date: new Date().toISOString(), title: 'Novo edital detectado', desc: '4º Chamamento Público publicado no Diário Oficial.' },
    { id: 2, type: 'status', date: new Date(Date.now() - 86400000).toISOString(), title: 'Mudança de Status', desc: 'Projeto Edifício Virgínia avançou para "Em execução".' },
    { id: 3, type: 'credenciamento', date: new Date(Date.now() - 172800000).toISOString(), title: 'Credenciamento Aprovado', desc: 'Edifício Martinelli teve credenciamento aprovado (3º Chamamento).' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Atualizações e Inteligência Temporal</h1>
        <p className="text-slate-600">Acompanhe as mudanças mais recentes detectadas nos dados públicos.</p>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">Linha do Tempo Recente</div>
        <div className="divide-y divide-slate-100">
          {updates.map((update) => (
            <div key={update.id} className="p-4 flex gap-4 hover:bg-slate-50 transition">
              <div className="mt-1">
                {update.type === 'edital' ? <FileText className="text-blue-500" size={20}/> :
                 update.type === 'status' ? <Bell className="text-amber-500" size={20}/> :
                 <CheckCircle2 className="text-green-500" size={20}/>}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{update.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{update.desc}</p>
                <span className="text-xs text-slate-400 mt-2 block">
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
