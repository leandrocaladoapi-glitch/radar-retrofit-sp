import Link from 'next/link'
import indice from '../../data/oportunidades_index.json'
import status from '../../data/etl_status.json'
import type { OportunidadeIndex } from '../../lib/types'

export const metadata = {
  title: 'Radar de Oportunidades — imóveis reais da área central | Radar Retrofit SP',
  description:
    'Base de imóveis reais da área central de São Paulo identificados a partir do Cadastro Imobiliário Fiscal (GeoSampa) e cruzados por geometria com os perímetros oficiais do Requalifica Centro e da AIU Setor Central.',
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR')
}

function relacaoLabel(rel: string) {
  if (rel === 'dentro') return 'dentro'
  if (rel === 'intersecta') return 'intersecta'
  return 'fora'
}

export default function OportunidadesPage() {
  const ops = indice as OportunidadeIndex[]
  const verificacao = new Date(status.executadoEm)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Radar de Oportunidades</h1>
        <p className="text-slate-600">
          {fmt(ops.length)} imóveis <strong>reais</strong> da área central de São Paulo, identificados no Cadastro
          Imobiliário Fiscal (camada Lote do GeoSampa) e cruzados por geometria com os perímetros oficiais.{' '}
          <strong className="text-blue-700">Os dados cadastrais são oficiais; as projeções financeiras são estimativas do Radar.</strong>
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Última verificação das fontes oficiais:{' '}
          {verificacao.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          {' • '}
          {status.candidatosRetidos} candidatos retidos internamente por confiança de dados insuficiente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ops.map((op) => (
          <Link href={`/oportunidades/${op.slug}`} key={op.id} className="block group">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-800 text-xs font-bold px-2 py-1 rounded">Score: {op.score}/100</div>
                <div className="text-xs text-slate-500">Confiança: {op.confidence}%</div>
              </div>

              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{op.nome}</h3>
              <p className="text-sm text-slate-500">
                SQL {op.sql} • {op.usoCadastrado} • {fmt(op.areaConstruida)} m²
              </p>
              <p className="text-[11px] text-slate-400 mb-4">Dados cadastrais oficiais — GeoSampa / Cadastro Imobiliário Fiscal</p>

              <div className="mt-auto space-y-2">
                <div className="text-sm border-t border-slate-100 pt-3">
                  <span className="font-semibold text-slate-700">Motivo:</span>{' '}
                  <span className="text-slate-600 line-clamp-2">{op.motivoPrincipal}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {op.requalificaCentro !== 'fora' && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] uppercase px-2 py-0.5 rounded">
                      Requalifica Centro: {relacaoLabel(op.requalificaCentro)}
                    </span>
                  )}
                  {op.aiuSetorCentral !== 'fora' && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] uppercase px-2 py-0.5 rounded">
                      AIU Setor Central: {relacaoLabel(op.aiuSetorCentral)}
                    </span>
                  )}
                  {op.protegido && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] uppercase px-2 py-0.5 rounded">Imóvel protegido</span>
                  )}
                  {op.zoneamento && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] uppercase px-2 py-0.5 rounded">{op.zoneamento}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
