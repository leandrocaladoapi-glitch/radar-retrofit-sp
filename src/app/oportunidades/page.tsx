import Link from 'next/link'
import oportunidades from '../../data/oportunidades.json'

export default function OportunidadesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Radar de Oportunidades</h1>
        <p className="text-slate-600">Imóveis identificados algoritimicamente com potencial de requalificação e subvenção. <strong className="text-blue-700">Análise indicativa, não substitui diligência oficial.</strong></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {oportunidades.map(op => (
          <Link href={`/oportunidades/${op.id}`} key={op.id} className="block group">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                  Score: {op.score}/100
                </div>
                <div className="text-xs text-slate-500">
                  Confiança: {op.confidence}%
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{op.endereco}</h3>
              <p className="text-sm text-slate-500 mb-4">{op.regiao} • {op.usoConhecido} • {op.area}m²</p>

              <div className="mt-auto space-y-2">
                <div className="text-sm border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-700">Motivo:</span> <span className="text-slate-600 line-clamp-2">{op.motivo}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {op.perimetros?.map((per, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] uppercase px-2 py-0.5 rounded">{per}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
