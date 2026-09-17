import data from '../../data/subvencao.json'
import { Calendar, CheckCircle, MapPin, Building, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function ChamamentoAtual() {
  const { chamamentoAtual } = data

  const steps = ['Inscrição', 'Análise', 'Credenciamento', 'Priorização', 'Outorga', 'Execução'] as const

  return (
    <div className="page-shell page-shell-narrow max-w-4xl space-y-8">
      <PageHeader
        title="Painel do Chamamento Atual"
        description="Acompanhamento das regras e status do edital vigente."
      />

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-muted px-6 py-5">
          <h2 className="text-xl font-semibold text-fg">{chamamentoAtual.nome}</h2>
          <p className="text-sm text-fg-subtle">
            {chamamentoAtual.numero} • {chamamentoAtual.orgao}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                <Calendar size={18} aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold text-fg">Período de Inscrição</div>
                <div className="text-sm text-fg-muted">
                  Abertura: {new Date(chamamentoAtual.abertura).toLocaleDateString('pt-BR')} <br />
                  Encerramento: {new Date(chamamentoAtual.encerramento).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                <Building size={18} aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold text-fg">Categorias Aceitas</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {chamamentoAtual.categorias.map((cat) => (
                    <span key={cat} className="chip bg-info-muted text-info-fg">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                <MapPin size={18} aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold text-fg">Perímetro</div>
                <div className="text-sm text-fg-muted">{chamamentoAtual.perimetro}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-line bg-muted p-4">
              <div className="mb-1 text-sm font-semibold text-fg">Orçamento Estimado</div>
              <div className="kpi-value text-2xl">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(chamamentoAtual.orcamento)}
              </div>
              <div className="mt-2 text-sm text-fg-muted">
                Até <span className="font-semibold">{chamamentoAtual.percentualMaximo}%</span> do custo da obra
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning-muted text-warning">
                <AlertTriangle size={18} aria-hidden />
              </span>
              <div>
                <div className="text-sm font-semibold text-fg">Situação Atual</div>
                <div className="text-sm text-fg-muted">{chamamentoAtual.situacao}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-fg">Timeline do Processo</h3>
        <ol className="flex flex-col items-start justify-between gap-4 overflow-x-auto pb-4 text-sm text-fg-muted md:flex-row md:items-center">
          {steps.map((step, index) => (
            <li key={step} className="flex items-center gap-2 md:contents">
              {index === 0 ? (
                <div className="flex items-center gap-2 rounded-full bg-info-muted px-3 py-1.5 font-medium text-info-fg">
                  <CheckCircle size={16} aria-hidden /> {step}
                </div>
              ) : (
                <div className="flex items-center gap-2">{step}</div>
              )}
              {index < steps.length - 1 && <div className="hidden h-px flex-grow bg-line md:block" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>

      <div className="callout callout-warning">
        <div className="text-sm">
          <p className="mb-1 font-semibold">Aviso de Isenção</p>
          <p>
            Esta é uma interpretação baseada em dados públicos. Leia o edital integral oficial para regras completas. Não nos responsabilizamos por perdas decorrentes de decisões baseadas nestas informações.
          </p>
        </div>
      </div>
    </div>
  )
}
