import data from '../../data/subvencao.json'
import { Calendar, CheckCircle, MapPin, Building, AlertTriangle } from 'lucide-react'

export default function ChamamentoAtual() {
  const { chamamentoAtual } = data

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Painel do Chamamento Atual</h1>
        <p className="text-slate-600">Acompanhamento das regras e status do edital vigente.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-800">{chamamentoAtual.nome}</h2>
          <p className="text-sm text-slate-500">{chamamentoAtual.numero} • {chamamentoAtual.orgao}</p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <Calendar className="text-blue-600 shrink-0 mt-1" size={20} />
              <div>
                <div className="text-sm font-semibold text-slate-900">Período de Inscrição</div>
                <div className="text-sm text-slate-600">
                  Abertura: {new Date(chamamentoAtual.abertura).toLocaleDateString('pt-BR')} <br/>
                  Encerramento: {new Date(chamamentoAtual.encerramento).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <Building className="text-blue-600 shrink-0 mt-1" size={20} />
              <div>
                <div className="text-sm font-semibold text-slate-900">Categorias Aceitas</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {chamamentoAtual.categorias.map(cat => (
                    <span key={cat} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">{cat}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <MapPin className="text-blue-600 shrink-0 mt-1" size={20} />
              <div>
                <div className="text-sm font-semibold text-slate-900">Perímetro</div>
                <div className="text-sm text-slate-600">{chamamentoAtual.perimetro}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="text-sm font-semibold text-slate-900 mb-1">Orçamento Estimado</div>
                <div className="text-2xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(chamamentoAtual.orcamento)}
                </div>
                <div className="text-sm text-slate-600 mt-2">
                  Até <span className="font-semibold">{chamamentoAtual.percentualMaximo}%</span> do custo da obra
                </div>
             </div>

             <div className="flex gap-3 items-start pt-2">
              <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
              <div>
                <div className="text-sm font-semibold text-slate-900">Situação Atual</div>
                <div className="text-sm text-slate-600">{chamamentoAtual.situacao}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Timeline do Processo</h3>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-slate-600 overflow-x-auto pb-4">
            <div className="flex items-center gap-2 font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full"><CheckCircle size={16} /> Inscrição</div>
            <div className="hidden md:block h-px bg-slate-300 flex-grow"></div>
            <div className="flex items-center gap-2">Análise</div>
            <div className="hidden md:block h-px bg-slate-300 flex-grow"></div>
            <div className="flex items-center gap-2">Credenciamento</div>
            <div className="hidden md:block h-px bg-slate-300 flex-grow"></div>
            <div className="flex items-center gap-2">Priorização</div>
            <div className="hidden md:block h-px bg-slate-300 flex-grow"></div>
            <div className="flex items-center gap-2">Outorga</div>
            <div className="hidden md:block h-px bg-slate-300 flex-grow"></div>
            <div className="flex items-center gap-2">Execução</div>
        </div>
      </div>

       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <p className="font-semibold mb-1">Aviso de Isenção</p>
          <p>Esta é uma interpretação baseada em dados públicos. Leia o edital integral oficial para regras completas. Não nos responsabilizamos por perdas decorrentes de decisões baseadas nestas informações.</p>
      </div>
    </div>
  )
}
