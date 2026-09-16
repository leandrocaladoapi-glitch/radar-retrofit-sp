import oportunidadesData from '../../data/oportunidades.json'
import Link from 'next/link'
import { ArrowRight, ShieldAlert,  } from 'lucide-react'

export default function OportunidadesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Radar de Oportunidades</h1>
        <p className="text-slate-600">Imóveis identificados com características compatíveis para potencial análise de retrofit e subvenção.</p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Atenção:</strong> Estes dados são indicativos e gerados a partir de bases públicas. A presença nesta lista NÃO garante elegibilidade à subvenção. Cada caso exige análise técnica e jurídica detalhada.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {oportunidadesData.map((op) => (
          <div key={op.id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-slate-900">{op.endereco}</h3>
                <p className="text-sm text-slate-500">{op.regiao}</p>
              </div>
              <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full flex flex-col items-center">
                <span>Score</span>
                <span className="text-sm">{op.score}</span>
              </div>
            </div>

            <div className="p-5 flex-grow space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">Motivo Principal</span>
                <p className="text-sm text-slate-800">{op.motivo}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Área</span>
                  <span>{op.area} m²</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Zoneamento</span>
                  <span>{op.zoneamento}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Confiança dos Dados</span>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${op.confidence}%` }}></div>
                </div>
                <div className="text-right text-xs text-slate-500 mt-1">{op.confidence}%</div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <Link href={`/oportunidades/${op.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-center gap-1 w-full">
                Ver dossiê completo <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
