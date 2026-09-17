import projetosData from '../../data/projetos.json'
import oportunidadesData from '../../data/oportunidades_index.json'
import PageHeader from '../../components/ui/PageHeader'

const columns = [
  'Identificada',
  'Em análise',
  'Inscrita',
  'Credenciada',
  'Outorga',
  'Em execução',
  'Concluída',
]

const COLUMN_TONE: Record<string, string> = {
  Identificada: 'bg-gold',
  'Em análise': 'bg-accent',
  Inscrita: 'bg-info',
  Credenciada: 'bg-success',
  Outorga: 'bg-purple',
  'Em execução': 'bg-warning',
  Concluída: 'bg-fg-subtle',
}

export default function PipelinePage() {
  const items = [
    ...oportunidadesData.map((op) => ({
      ...op,
      pipelineStatus: 'Identificada',
      nome: op.nome,
      isOportunidade: true,
      regiaoStr: `${op.distrito} • SQL ${op.sql}`,
      badge: `Score: ${op.score}`,
    })),
    ...projetosData.map((proj) => ({
      ...proj,
      pipelineStatus: 'Credenciada',
      isOportunidade: false,
      regiaoStr: proj.chamamento,
      badge: 'Lista oficial',
    })),
  ]

  return (
    <div className="page-shell page-shell-wide space-y-6">
      <PageHeader
        title="Pipeline de Retrofit"
        description="Acompanhamento do estágio de maturidade das oportunidades e projetos conhecidos."
      />

      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
          {columns.map((col, idx) => {
            const colItems = items.filter((item) => item.pipelineStatus === col)
            return (
              <div
                key={idx}
                className="flex max-h-[70vh] w-[300px] min-w-[280px] flex-shrink-0 snap-center flex-col rounded-xl border border-line bg-muted p-3 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
                    <span className={`h-2 w-2 rounded-full ${COLUMN_TONE[col] ?? 'bg-fg-subtle'}`} aria-hidden />
                    {col}
                  </h3>
                  <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold tabular text-fg-muted">
                    {colItems.length}
                  </span>
                </div>
                <div className="custom-scrollbar flex-grow space-y-3 overflow-y-auto pr-1">
                  {colItems.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`card p-3 ${item.isOportunidade ? 'border-warning/40' : 'border-line'}`}
                    >
                      <h4 className="mb-1 truncate text-sm font-medium text-fg">{item.nome}</h4>
                      <p className="mb-2 truncate text-xs text-fg-muted">{item.regiaoStr}</p>
                      {item.isOportunidade ? (
                        <span className="inline-block rounded bg-warning-muted px-1.5 py-0.5 text-[10px] font-bold text-warning-fg">
                          {item.badge}
                        </span>
                      ) : (
                        <span className="inline-block rounded bg-info-muted px-1.5 py-0.5 text-[10px] font-bold text-info-fg">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  ))}
                  {colItems.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed border-line py-6 text-center text-xs text-fg-subtle">
                      Nenhum projeto
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
