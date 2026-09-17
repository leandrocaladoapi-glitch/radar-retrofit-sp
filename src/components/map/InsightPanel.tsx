'use client'

/*
 * Painel de inteligência do mapa.
 *
 * Tudo o que aparece aqui é recalculado a partir do que está VISÍVEL:
 * viewport atual ∩ filtros ativos. O objetivo é responder "o que tem nesta
 * área que eu estou olhando?" em vez de só mostrar volume.
 */

import { ArrowUpRight, Building2, Layers, MapPin, ShieldCheck, TrendingUp } from 'lucide-react'
import type { ProjetosInfo, RegistroMapa } from '../../lib/mapa'
import { TIPOS } from './theme'
import {
  formatarArea,
  formatarMilhoes,
  formatarNumero,
  formatarScore,
  type EstatisticasViewport,
} from './stats'

interface InsightPanelProps {
  stats: EstatisticasViewport
  totalFiltrado: number
  filtrosAtivos: number
  projetos: ProjetosInfo
  aoSelecionar: (registro: RegistroMapa) => void
  baseAlternativa: boolean
}

function Metrica({
  rotulo,
  valor,
  detalhe,
  icone,
}: {
  rotulo: string
  valor: string
  detalhe?: string
  icone?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {icone}
        {rotulo}
      </p>
      <p className="mt-0.5 text-lg font-semibold leading-tight text-slate-900">{valor}</p>
      {detalhe && <p className="text-[11px] text-slate-500">{detalhe}</p>}
    </div>
  )
}

function Barra({ rotulo, total, maximo, cor }: { rotulo: string; total: number; maximo: number; cor?: string }) {
  const largura = maximo > 0 ? Math.max(4, Math.round((total / maximo) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
        <span className="truncate">{rotulo}</span>
        <span className="font-semibold text-slate-800">{formatarNumero(total)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${largura}%`, backgroundColor: cor ?? '#0F172A' }} />
      </div>
    </div>
  )
}

export default function InsightPanel({
  stats,
  totalFiltrado,
  filtrosAtivos,
  projetos,
  aoSelecionar,
  baseAlternativa,
}: InsightPanelProps) {
  const vazio = stats.imoveis === 0
  const maxDistrito = stats.distritos[0]?.total ?? 0
  const maxTipo = stats.tipos[0]?.total ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <TrendingUp size={15} /> Inteligência da área visível
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Considera o que está dentro do enquadramento atual do mapa
          {filtrosAtivos > 0 ? ` e nos ${filtrosAtivos} filtro(s) ativo(s)` : ''}.
        </p>
      </div>

      {vazio ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-center">
          <MapPin size={18} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">Nenhum imóvel no recorte visível</p>
          <p className="mt-1 text-xs text-slate-500">
            {totalFiltrado === 0
              ? 'Os filtros ativos não retornam imóveis. Ajuste os filtros para ver dados.'
              : 'Afaste o zoom ou mova o mapa para outra área do centro.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Metrica
              rotulo="Imóveis visíveis"
              valor={formatarNumero(stats.imoveis)}
              detalhe={`de ${formatarNumero(totalFiltrado)} no filtro`}
              icone={<Building2 size={12} />}
            />
            <Metrica
              rotulo="Prioritárias 85+"
              valor={formatarNumero(stats.prioritarias)}
              detalhe={`${Math.round((stats.prioritarias / Math.max(stats.imoveis, 1)) * 100)}% do recorte`}
              icone={<ArrowUpRight size={12} />}
            />
            <Metrica
              rotulo="Score médio"
              valor={formatarScore(stats.scoreMedio)}
              detalhe="Opportunity Score (0–100)"
            />
            <Metrica
              rotulo="Protegidos"
              valor={formatarNumero(stats.protegidos)}
              detalhe="tombados / em processo"
              icone={<ShieldCheck size={12} />}
            />
            <Metrica
              rotulo="Área média"
              valor={formatarArea(stats.areaMedia)}
              detalhe={`${formatarArea(stats.areaTotal)} no recorte`}
            />
            <Metrica rotulo="Custo médio" valor={formatarMilhoes(stats.custoMedio)} detalhe="estimativa paramétrica" />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-800">
              Subvenção teórica agregada
            </p>
            <p className="mt-0.5 text-lg font-semibold leading-tight text-amber-900">
              {formatarMilhoes(stats.tetoTotal)}
            </p>
            <p className="text-[11px] leading-relaxed text-amber-800/80">
              Soma dos tetos estimados (25% do custo de obra) dos imóveis visíveis. Custo total estimado no recorte:{' '}
              {formatarMilhoes(stats.custoTotal)}. Teto teórico não é valor concedido.
            </p>
          </div>

          {stats.distritos.length > 0 && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Distritos no recorte
              </p>
              <div className="space-y-2">
                {stats.distritos.map((distrito) => (
                  <Barra key={distrito.chave} rotulo={distrito.rotulo} total={distrito.total} maximo={maxDistrito} />
                ))}
              </div>
            </div>
          )}

          {stats.tipos.length > 0 && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Perfil dos pontos</p>
              <div className="space-y-2">
                {stats.tipos.map((tipo) => {
                  const visual = TIPOS[tipo.chave as keyof typeof TIPOS]
                  return (
                    <Barra
                      key={tipo.chave}
                      rotulo={tipo.rotulo}
                      total={tipo.total}
                      maximo={maxTipo}
                      cor={visual ? visual.cor : undefined}
                    />
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Top oportunidades visíveis
            </p>
            <ol className="space-y-2">
              {stats.top.map((registro, indice) => {
                const visual = TIPOS[registro.tipo]
                return (
                  <li key={registro.id}>
                    <button
                      type="button"
                      onClick={() => aoSelecionar(registro)}
                      className="w-full rounded-md px-2 py-1.5 text-left transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-400">{indice + 1}</span>
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: visual.cor }}
                          aria-hidden
                        />
                        <span className="truncate text-xs font-medium text-slate-800">{registro.nome}</span>
                      </span>
                      <span className="mt-0.5 block pl-[26px] text-[11px] text-slate-500">
                        Score {registro.score} · {formatarArea(registro.areaConstruida)} ·{' '}
                        {registro.distrito ?? 'distrito não informado'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            {stats.top.length === 0 && <p className="text-xs text-slate-500">Sem imóveis no recorte.</p>}
          </div>
        </>
      )}

      <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <Layers size={12} /> Projetos oficiais
        </p>
        <p className="text-xs leading-relaxed text-slate-600">
          <strong className="font-semibold text-slate-800">{formatarNumero(projetos.total)}</strong> projetos
          habilitados/credenciados catalogados · <strong className="font-semibold text-slate-800">0</strong>{' '}
          georreferenciados. {projetos.nota}{' '}
          <a href={projetos.url} className="font-medium text-slate-800 underline decoration-slate-300">
            Ver lista
          </a>
        </p>
        <p className="text-[11px] leading-relaxed text-slate-500">
          {baseAlternativa
            ? 'Base vetorial alternativa (raster) ativa — dados e filtros inalterados.'
            : 'Marcadores em área densa podem se sobrepor visualmente; os números deste painel consideram todos os imóveis do recorte.'}
        </p>
      </div>
    </div>
  )
}
