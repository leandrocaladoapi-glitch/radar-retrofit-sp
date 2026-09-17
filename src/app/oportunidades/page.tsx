import Link from 'next/link'
import oportunidades from '../../data/oportunidades.json'

export default function OportunidadesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Radar de Oportunidades</h1>
        <p className="text-slate-600">Base de imóveis <strong className="text-blue-700">reais e verificáveis</strong> identificados algoritimicamente com potencial de requalificação. Os dados cadastrais são provenientes de fontes oficiais da Prefeitura.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {oportunidades.map(op => (
          <Link href={`/oportunidades/${op.id}`} key={op.id} className="block group">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-blue-600"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                  Score: {op.score}/100
                </div>
                <div className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded">
                  Confiança: {op.confidence}%
                </div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{op.nome || op.endereco}</h3>
              <p className="text-sm font-medium text-slate-600 mt-1">{op.endereco} - {op.regiao}</p>

              <div className="mt-3 text-xs text-slate-500 border border-slate-100 bg-slate-50 p-2 rounded">
                <strong>SQL Oficial:</strong> {op.sql}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {op.perimetros?.map((per, idx) => (
                    <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">{per}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800 mt-8">
        <strong>Nota de Integridade:</strong> Apenas imóveis com SQL validado, endereço confirmado e fontes documentais (GeoSampa/Cadastro Municipal) são publicados neste Radar. {oportunidades.length} oportunidades publicadas atualmente.
      </div>
    </div>
  )
}
