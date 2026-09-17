'use client'

/*
 * Legenda e painel de camadas.
 * A legenda é a chave de leitura do mapa; o painel de camadas controla o que é
 * exibido (tipologia, perímetros oficiais, limites distritais e base).
 */

import { ChevronDown, Eye, Layers } from 'lucide-react'
import type { ProjetosInfo } from '../../lib/mapa'
import { BASES, TIPOS, type BaseId } from './theme'
import { CAMADAS_INFO, type Camadas } from './layers'
import { formatarNumero } from './stats'
import type { TipoRegistro } from '../../lib/mapa'

interface LegendPanelProps {
  contagens: Record<string, number>
  compacta?: boolean
}

export function LegendPanel({ contagens, compacta = false }: LegendPanelProps) {
  return (
    <div className={compacta ? 'space-y-2' : 'space-y-2.5'}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Legenda</p>
      <ul className="space-y-1.5">
        {(Object.keys(TIPOS) as TipoRegistro[]).map((tipo) => {
          const visual = TIPOS[tipo]
          const total = contagens[tipo]
          return (
            <li key={tipo} className="flex items-start gap-2">
              <span
                className="mt-0.5 h-3 w-3 shrink-0 rounded-full ring-2 ring-white"
                style={{ backgroundColor: visual.cor, boxShadow: `0 0 0 1px ${visual.corBorda}` }}
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block text-xs font-medium leading-tight text-slate-800">
                  {visual.rotulo}
                  {typeof total === 'number' && (
                    <span className="ml-1 font-normal text-slate-400">({formatarNumero(total)})</span>
                  )}
                </span>
                <span className="block text-[11px] leading-snug text-slate-500">{visual.descricao}</span>
              </span>
            </li>
          )
        })}
      </ul>
      <div className="border-t border-slate-100 pt-2">
        <ul className="space-y-1.5 text-[11px] leading-snug text-slate-600">
          <li className="flex items-center gap-2">
            <span className="relative inline-flex h-4 w-4 items-center justify-center" aria-hidden>
              <span className="absolute h-4 w-4 rounded-full bg-slate-500/80" />
              <span className="relative text-[8px] font-bold text-white">12</span>
            </span>
            Agrupamento: número de imóveis na área. Clique para abrir o grupo.
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-cyan-600" aria-hidden />
            Imóvel dentro do Requalifica Centro (destaque quando não há geometria carregada)
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-indigo-600" aria-hidden />
            Imóvel dentro da AIU Setor Central
          </li>
        </ul>
      </div>
      <p className="border-t border-slate-100 pt-2 text-[11px] leading-snug text-slate-500">
        Tamanho do marcador cresce com o Opportunity Score. Em áreas densas o mapa evita sobreposição de ícones.
      </p>
    </div>
  )
}

interface LayerPanelProps {
  camadas: Camadas
  aoMudarCamadas: (camadas: Camadas) => void
  base: BaseId
  aoMudarBase: (base: BaseId) => void
  geometria: { requalifica: boolean; aiu: boolean; distritos: boolean }
  projetos: ProjetosInfo
}

function LinhaCamada({
  ativo,
  titulo,
  descricao,
  indisponivel,
  aoAlternar,
  nota,
}: {
  ativo: boolean
  titulo: string
  descricao: string
  indisponivel?: boolean
  nota?: string
  aoAlternar?: () => void
}) {
  return (
    <label
      className={`flex items-start gap-2.5 rounded-lg border px-2.5 py-2 transition ${
        indisponivel ? 'cursor-not-allowed border-slate-100 bg-slate-50' : 'cursor-pointer border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <input
        type="checkbox"
        checked={ativo}
        disabled={indisponivel}
        onChange={aoAlternar}
        className="mt-0.5 accent-slate-900"
      />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-slate-800">{titulo}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">{descricao}</span>
        {nota && <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">{nota}</span>}
      </span>
    </label>
  )
}

export function LayerPanel({ camadas, aoMudarCamadas, base, aoMudarBase, geometria, projetos }: LayerPanelProps) {
  const alternar = (chave: keyof Camadas) => aoMudarCamadas({ ...camadas, [chave]: !camadas[chave] })

  return (
    <div className="space-y-3">
      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <Layers size={12} /> Camadas
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Filtros definem o recorte; camadas definem o que aparece e como.
        </p>
      </div>

      <div className="space-y-2">
        <LinhaCamada
          ativo={camadas.imoveis}
          titulo="Imóveis pontuados"
          descricao="Oportunidades identificadas pelo Radar, com agrupamento por proximidade."
          aoAlternar={() => alternar('imoveis')}
        />
        <LinhaCamada
          ativo={camadas.prioritarias}
          titulo="Oportunidades prioritárias"
          descricao="Destaque para score ≥ 85 (losango esmeralda)."
          aoAlternar={() => alternar('prioritarias')}
        />
        <LinhaCamada
          ativo={camadas.protegidos}
          titulo="Patrimônio / tombamento"
          descricao="Destaque para imóveis tombados ou em processo (escudo violeta)."
          aoAlternar={() => alternar('protegidos')}
        />
        <LinhaCamada
          ativo={camadas.requalificaCentro}
          titulo={CAMADAS_INFO.requalificaCentro.rotulo}
          descricao={CAMADAS_INFO.requalificaCentro.descricao}
          nota={geometria.requalifica ? 'Geometria oficial carregada.' : 'Sem geometria oficial neste deploy.'}
          aoAlternar={() => alternar('requalificaCentro')}
        />
        <LinhaCamada
          ativo={camadas.aiuSetorCentral}
          titulo={CAMADAS_INFO.aiuSetorCentral.rotulo}
          descricao={CAMADAS_INFO.aiuSetorCentral.descricao}
          nota={geometria.aiu ? 'Geometria oficial carregada.' : 'Sem geometria oficial neste deploy.'}
          aoAlternar={() => alternar('aiuSetorCentral')}
        />
        <LinhaCamada
          ativo={camadas.distritos}
          titulo={CAMADAS_INFO.distritos.rotulo}
          descricao={CAMADAS_INFO.distritos.descricao}
          indisponivel={!geometria.distritos}
          nota={geometria.distritos ? undefined : 'Divisas ainda não carregadas nesta build.'}
          aoAlternar={() => (geometria.distritos ? alternar('distritos') : undefined)}
        />
        <LinhaCamada
          ativo={false}
          indisponivel
          titulo="Projetos contemplados / em execução"
          descricao={`${formatarNumero(projetos.total)} projetos na lista oficial, sem endereço, SQL ou coordenada publicados.`}
          nota="Sem geometria oficial não há ponto a plotar — ver /projetos."
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          <Eye size={12} /> Base do mapa
        </p>
        <div className="mt-2 flex gap-1.5">
          {BASES.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => aoMudarBase(opcao.id)}
              aria-pressed={base === opcao.id}
              title={opcao.descricao}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                base === opcao.id
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-slate-500">
          Base vetorial aberta (OpenFreeMap). Sem chave de API, sem conta e sem marca de água de erro.
        </p>
      </div>
    </div>
  )
}

export function LegendToggle({ aberta, aoAlternar }: { aberta: boolean; aoAlternar: () => void }) {
  return (
    <button
      type="button"
      onClick={aoAlternar}
      className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-800"
      aria-expanded={aberta}
    >
      Legenda <ChevronDown size={12} className={aberta ? 'rotate-180 transition' : 'transition'} />
    </button>
  )
}
