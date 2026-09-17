'use client'

/*
 * Card do imóvel selecionado.
 * Reúne o que o usuário precisa para decidir se abre o dossiê completo:
 * identificação, tipologia, score, área, uso, status patrimonial e
 * enquadramento territorial — sempre com a fonte declarada.
 */

import Link from 'next/link'
import { ArrowRight, ShieldCheck, X } from 'lucide-react'
import type { RegistroMapa } from '../../lib/mapa'
import { TIPOS } from './theme'
import { formatarArea, formatarData, formatarMilhoes, rotuloRelacao } from './stats'

interface RecordCardProps {
  registro: RegistroMapa
  aoFechar: () => void
  variante?: 'painel' | 'folha'
}

function Linha({ rotulo, valor }: { rotulo: string; valor: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{rotulo}</span>
      <span className="text-right text-xs font-medium text-slate-800">{valor}</span>
    </div>
  )
}

export default function RecordCard({ registro, aoFechar, variante = 'painel' }: RecordCardProps) {
  const visual = TIPOS[registro.tipo]
  const protegido = !!registro.situacaoPatrimonial

  return (
    <div
      className={
        variante === 'folha'
          ? 'max-h-[62vh] w-full overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-4 shadow-2xl'
          : 'max-h-full w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
            style={{ backgroundColor: visual.cor }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" aria-hidden />
            {visual.rotulo}
          </span>
          <h3 className="mt-2 truncate text-sm font-bold text-slate-900" title={registro.nome}>
            {registro.nome}
          </h3>
          <p className="text-[11px] text-slate-500">
            SQL {registro.sql ?? 'não informado'} · {registro.distrito ?? 'distrito não informado'}
          </p>
        </div>
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar detalhes do imóvel"
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2 text-white">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-300">Opportunity Score</p>
          <p className="text-xl font-bold leading-none">{registro.score}</p>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="text-[11px] leading-snug text-slate-200">
          {registro.score >= 85 ? 'Alta aderência aos incentivos vigentes.' : 'Aderência moderada aos incentivos.'}
          {registro.confidence !== null && ` Confiança dos dados: ${registro.confidence}%.`}
        </div>
      </div>

      <div className="mt-3 divide-y divide-slate-100">
        <Linha rotulo="Área construída" valor={formatarArea(registro.areaConstruida)} />
        <Linha rotulo="Área do terreno" valor={formatarArea(registro.areaTerreno)} />
        <Linha rotulo="Uso cadastrado" valor={registro.usoCadastrado ?? '—'} />
        <Linha rotulo="Zoneamento" valor={registro.zoneamento ?? '—'} />
        <Linha
          rotulo="Status patrimonial"
          valor={
            protegido ? (
              <span className="inline-flex items-center gap-1 text-violet-700">
                <ShieldCheck size={12} />
                {registro.situacaoPatrimonial}
                {registro.nivelPatrimonial ? ` (${registro.nivelPatrimonial})` : ''}
              </span>
            ) : (
              'Sem proteção registrada'
            )
          }
        />
        <Linha
          rotulo="Requalifica Centro"
          valor={rotuloRelacao(registro.requalificaCentro)}
        />
        <Linha rotulo="AIU Setor Central" valor={rotuloRelacao(registro.aiuSetorCentral)} />
        <Linha rotulo="Custo estimado" valor={formatarMilhoes(registro.custoMilhoes)} />
        <Linha rotulo="Subvenção teórica" valor={formatarMilhoes(registro.tetoSubvencaoMilhoes)} />
        <Linha rotulo="Última verificação" valor={formatarData(registro.ultimaVerificacao)} />
      </div>

      {registro.zepec && (
        <p className="mt-2 rounded-md bg-violet-50 px-2 py-1.5 text-[11px] leading-relaxed text-violet-800">
          ZEPEC: {registro.zepec}
          {registro.resolucaoPatrimonial ? ` · ${registro.resolucaoPatrimonial}` : ''}
        </p>
      )}

      <Link
        href={`/oportunidades/${registro.slug}`}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
      >
        Abrir dossiê completo <ArrowRight size={14} />
      </Link>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        Dados oficiais (GeoSampa/cadastro fiscal) + estimativas declaradas do Radar. Localização aproximada pelo
        centroide do lote cadastral.
      </p>
    </div>
  )
}
