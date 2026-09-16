import projetosData from '../../data/projetos.json'
import oportunidadesData from '../../data/oportunidades.json'

const columns = [
  "Identificada",
  "Em análise",
  "Inscrita",
  "Credenciada",
  "Outorga",
  "Em execução",
  "Concluída"
]

export default function PipelinePage() {
  // Combine all items and map to columns
  const items = [
    ...oportunidadesData.map(op => ({ ...op, pipelineStatus: "Identificada", nome: op.endereco, isOportunidade: true, regiaoStr: op.regiao, badge: `Score: ${op.score}` })),
    ...projetosData.map(proj => {
      let status = "Inscrita";
      if (proj.situacao === "Credenciado") status = "Credenciada";
      if (proj.situacao === "Em execução") status = "Em execução";
      if (proj.situacao === "Concluído") status = "Concluída";
      return { ...proj, pipelineStatus: status, isOportunidade: false, regiaoStr: proj.empresa, badge: proj.chamamento }
    })
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Pipeline de Retrofit</h1>
        <p className="text-slate-600">Acompanhamento do estágio de maturidade das oportunidades e projetos conhecidos.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {columns.map((col, idx) => {
          const colItems = items.filter(item => item.pipelineStatus === col);
          return (
            <div key={idx} className="min-w-[280px] w-[300px] flex-shrink-0 snap-center flex flex-col bg-slate-100 rounded-xl p-3 border border-slate-200 shadow-sm max-h-[70vh]">
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-semibold text-slate-800 text-sm">{col}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{colItems.length}</span>
              </div>
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {colItems.map((item, itemIdx) => (
                  <div key={itemIdx} className={`bg-white p-3 rounded-lg border shadow-sm ${item.isOportunidade ? 'border-amber-200' : 'border-slate-200'}`}>
                    <h4 className="font-medium text-slate-900 text-sm mb-1 truncate">{item.nome}</h4>
                    <p className="text-xs text-slate-500 mb-2 truncate">
                      {item.regiaoStr}
                    </p>
                    {item.isOportunidade ? (
                       <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>
                    ) : (
                       <span className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">{item.badge}</span>
                    )}
                  </div>
                ))}
                {colItems.length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-6 border-2 border-dashed border-slate-200 rounded-lg">
                    Nenhum projeto
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
