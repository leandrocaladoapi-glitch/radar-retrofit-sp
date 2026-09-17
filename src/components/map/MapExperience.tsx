'use client'

/*
 * Experiência do Mapa de Oportunidades: orquestra dados, filtros, camadas,
 * painel de inteligência e a interação com o canvas.
 *
 * O componente de mapa é carregado dinamicamente (ssr: false) — o restante do
 * produto não paga o custo do WebGL.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Filter, Layers as LayersIcon, RotateCcw, Sparkles } from 'lucide-react'
import { decodificarMapa, type MapaRaw, type RegistroMapa } from '../../lib/mapa'
import {
  FILTROS_PADRAO,
  PRESETS,
  aplicarFiltros,
  contarFiltrosAtivos,
  opcoesUnicas,
  type Filtros,
} from './filters'

import { CAMADAS_PADRAO, PERIMETROS_URL, type Camadas, type PerimetrosGeo } from './layers'
import { BASE_PADRAO, TIPOS, type BaseId } from './theme'
import { BOUNDS_MUNDO, calcularEstatisticas, formatarNumero, type Bounds } from './stats'
import FilterPanel from './FilterPanel'
import InsightPanel from './InsightPanel'
import RecordCard from './RecordCard'
import { LayerPanel, LegendPanel } from './MapPanels'

/** Assinatura das dimensões usadas pelos recortes rápidos (evita comparação frágil). */
function assinaturaPreset(f: Partial<Filtros>): string {
  return JSON.stringify([f.scoreMin ?? 0, f.requalifica ?? 'todos', f.patrimonio ?? 'todos', f.areas ?? []])
}

function assinaturaFiltros(f: Filtros): string {
  return JSON.stringify([f.scoreMin, f.requalifica, f.patrimonio, f.areas])
}

const MapCanvas = dynamic(() => import('./MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-fg-muted">
      Carregando mapa…
    </div>
  ),
})

interface MapExperienceProps {
  raw: MapaRaw
}

type PainelMobile = 'filtros' | 'camadas' | null

function Sheet({
  titulo,
  aoFechar,
  children,
}: {
  titulo: string
  aoFechar: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-end bg-[var(--overlay)] p-0 sm:items-center sm:justify-center sm:p-4">
      <button type="button" aria-label="Fechar" className="absolute inset-0 cursor-default" onClick={aoFechar} />
      <div
        role="dialog"
        aria-label={titulo}
        className="relative max-h-[88vh] w-full overflow-y-auto rounded-t-2xl bg-surface p-4 shadow-2xl sm:max-w-md sm:rounded-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-fg">{titulo}</h3>
          <button
            type="button"
            onClick={aoFechar}
            className="inline-flex min-h-tap min-w-tap items-center justify-center rounded-md px-2 text-xs font-medium text-fg-muted hover:bg-muted hover:text-fg"
          >
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function MapExperience({ raw }: MapExperienceProps) {
  const dados = useMemo(() => decodificarMapa(raw), [raw])
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_PADRAO)
  const [camadas, setCamadas] = useState<Camadas>(CAMADAS_PADRAO)
  const [base, setBase] = useState<BaseId>(BASE_PADRAO)
  const [selecionado, setSelecionado] = useState<RegistroMapa | null>(null)
  const [bounds, setBounds] = useState<Bounds>(BOUNDS_MUNDO)
  const [perimetros, setPerimetros] = useState<PerimetrosGeo | null>(null)
  const [painelMobile, setPainelMobile] = useState<PainelMobile>(null)
  const [baseAlternativa, setBaseAlternativa] = useState(false)
  const [enquadrar, setEnquadrar] = useState(0)

  // Geometria oficial dos perímetros: carregada em runtime e opcional.
  // Se o arquivo não existir nesta build, o mapa funciona em modo destaque.
  useEffect(() => {
    let cancelado = false
    fetch(PERIMETROS_URL, { cache: 'force-cache' })
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((json) => {
        if (cancelado || !json || !json.camadas) return
        const valido = (camada: { data?: { features?: unknown[] } } | undefined) =>
          !!camada && Array.isArray(camada.data?.features) && camada.data!.features!.length > 0
        const resultado: PerimetrosGeo = {}
        if (valido(json.camadas.requalifica)) resultado.requalifica = json.camadas.requalifica
        if (valido(json.camadas.aiu)) resultado.aiu = json.camadas.aiu
        if (valido(json.camadas.distritos)) resultado.distritos = json.camadas.distritos
        if (Object.keys(resultado).length) {
          setPerimetros(resultado)
          setCamadas((atual) => ({ ...atual, distritos: !!resultado.distritos }))
        }
      })
      .catch(() => {
        /* geometria opcional: ausência não quebra o mapa */
      })
    return () => {
      cancelado = true
    }
  }, [])

  const registrosFiltrados = useMemo(() => aplicarFiltros(dados.registros, filtros), [dados.registros, filtros])
  const indicePorId = useMemo(() => {
    const mapa = new Map<string, RegistroMapa>()
    dados.registros.forEach((r) => mapa.set(r.id, r))
    return mapa
  }, [dados.registros])

  const stats = useMemo(
    () => calcularEstatisticas(registrosFiltrados, bounds, dados.cortePrioritario),
    [registrosFiltrados, bounds, dados.cortePrioritario]
  )

  const filtrosAtivos = contarFiltrosAtivos(filtros)
  const distritos = useMemo(() => opcoesUnicas(dados.registros, 'distrito'), [dados.registros])
  const usos = useMemo(() => opcoesUnicas(dados.registros, 'usoCadastrado'), [dados.registros])

  const contagensPorTipo = useMemo(() => {
    const contagens: Record<string, number> = {}
    registrosFiltrados.forEach((r) => {
      contagens[r.tipo] = (contagens[r.tipo] ?? 0) + 1
    })
    return contagens
  }, [registrosFiltrados])

  const aoAtualizarViewport = useCallback((novosBounds: Bounds) => {
    setBounds(novosBounds)
  }, [])

  const aoSelecionar = useCallback((registro: RegistroMapa | null) => {
    setSelecionado(registro)
    if (registro) setPainelMobile(null)
  }, [])

  const geometria = {
    requalifica: !!perimetros?.requalifica,
    aiu: !!perimetros?.aiu,
    distritos: !!perimetros?.distritos,
  }

  const botoesMobile = (
    <div className="absolute left-3 top-3 z-[500] flex flex-wrap gap-2 lg:hidden">
      <button
        type="button"
        onClick={() => setPainelMobile('filtros')}
        className="inline-flex min-h-tap items-center gap-1.5 rounded-lg bg-surface/95 px-3 py-2 text-xs font-semibold text-fg shadow-md backdrop-blur"
      >
        <Filter size={13} /> Filtros
        {filtrosAtivos > 0 && (
          <span className="rounded-full bg-fg px-1.5 text-[10px] font-bold text-bg">{filtrosAtivos}</span>
        )}
      </button>
      <button
        type="button"
        onClick={() => setPainelMobile('camadas')}
        className="inline-flex min-h-tap items-center gap-1.5 rounded-lg bg-surface/95 px-3 py-2 text-xs font-semibold text-fg shadow-md backdrop-blur"
      >
        <LayersIcon size={13} /> Camadas
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Barra de presets + status */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          <Sparkles size={13} /> Recortes rápidos
        </span>
        {PRESETS.map((preset) => {
          const ativo = assinaturaPreset(preset.filtros) === assinaturaFiltros(filtros)
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setFiltros({ ...FILTROS_PADRAO, ...preset.filtros })}
              aria-pressed={ativo}
              className={`min-h-tap rounded-full border px-3 py-1 text-xs font-medium transition ${
                ativo
                  ? 'border-fg bg-fg text-bg'
                  : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
              }`}
            >
              {preset.rotulo}
            </button>
          )
        })}
        <button
          type="button"
          onClick={() => {
            setFiltros(FILTROS_PADRAO)
            setSelecionado(null)
            setEnquadrar((valor) => valor + 1)
          }}
          className="inline-flex min-h-tap items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg-muted transition hover:border-line-strong hover:text-fg"
        >
          <RotateCcw size={12} /> Ver tudo
        </button>
        <span className="ml-auto text-xs text-fg-muted">
          <strong className="font-semibold text-fg">{formatarNumero(registrosFiltrados.length)}</strong> imóveis
          no recorte · base {dados.total} publicados
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        {/* Filtros — desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+0.75rem)] max-h-[calc(100vh-var(--header-h)-1.5rem)] overflow-y-auto rounded-xl border border-line bg-surface p-4">
            <FilterPanel
              filtros={filtros}
              aoMudar={setFiltros}
              distritos={distritos}
              usos={usos}
              visiveis={registrosFiltrados.length}
              total={dados.total}
            />
          </div>

          <details
            className="sticky top-[calc(var(--header-h)+0.75rem)] mt-4 max-h-[calc(100vh-var(--header-h)-1.5rem)] overflow-y-auto rounded-xl border border-line bg-surface p-4"
            open
          >
            <summary className="cursor-pointer text-sm font-bold text-fg">Camadas e base do mapa</summary>
            <div className="mt-3">
              <LayerPanel
                camadas={camadas}
                aoMudarCamadas={setCamadas}
                base={base}
                aoMudarBase={setBase}
                geometria={geometria}
                projetos={dados.projetos}
              />
            </div>
          </details>

          <details className="sticky top-[calc(var(--header-h)+0.75rem)] mt-4 rounded-xl border border-line bg-surface p-4" open>
            <summary className="cursor-pointer text-sm font-bold text-fg">Legenda</summary>
            <div className="mt-3">
              <LegendPanel contagens={contagensPorTipo} />
            </div>
          </details>
        </aside>

        {/* Mapa */}
        <section className="relative h-[62vh] min-h-[420px] overflow-hidden rounded-xl border border-line bg-muted shadow-sm lg:h-[calc(100vh-13rem)] lg:min-h-[600px]">
          <MapCanvas
            registros={registrosFiltrados}
            indicePorId={indicePorId}
            selecionado={selecionado}
            onSelecionar={aoSelecionar}
            onViewport={aoAtualizarViewport}
            camadas={camadas}
            base={base}
            perimetros={perimetros}
            boundsIniciais={dados.bounds}
            comandoEnquadrar={enquadrar}
            onBaseAlternativa={() => setBaseAlternativa(true)}
          />

          {botoesMobile}

          {registrosFiltrados.length === 0 && (
            <div className="pointer-events-none absolute inset-x-4 top-1/2 z-[600] -translate-y-1/2 rounded-xl border border-line bg-surface/95 p-4 text-center shadow-lg">
              <p className="text-sm font-semibold text-fg">Nenhum imóvel atende aos filtros atuais</p>
              <p className="mt-1 text-xs text-fg-muted">Ajuste ou limpe os filtros para voltar a ver os pontos.</p>
              <button
                type="button"
                onClick={() => setFiltros(FILTROS_PADRAO)}
                className="pointer-events-auto mt-3 rounded-md bg-fg px-3 py-1.5 text-xs font-semibold text-bg"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {/* Card do imóvel selecionado — desktop */}
          {selecionado && (
            <div className="absolute bottom-3 left-3 top-3 z-[700] hidden w-[330px] lg:block">
              <RecordCard registro={selecionado} aoFechar={() => setSelecionado(null)} />
            </div>
          )}
        </section>

        {/* Inteligência — desktop */}
        <aside className="hidden xl:block">
          <div className="sticky top-[calc(var(--header-h)+0.75rem)] max-h-[calc(100vh-var(--header-h)-1.5rem)] overflow-y-auto rounded-xl border border-line bg-surface p-4">
            <InsightPanel
              stats={stats}
              totalFiltrado={registrosFiltrados.length}
              filtrosAtivos={filtrosAtivos}
              projetos={dados.projetos}
              aoSelecionar={aoSelecionar}
              baseAlternativa={baseAlternativa}
            />
          </div>
        </aside>
      </div>

      {/* Abaixo de xl: legenda, card e inteligência empilhados */}
      <div className="space-y-4 xl:hidden">
        <details className="rounded-xl border border-line bg-surface p-3" open>
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Legenda do mapa
          </summary>
          <div className="mt-3">
            <LegendPanel contagens={contagensPorTipo} />
          </div>
        </details>

        <div className="rounded-xl border border-line bg-surface p-4">
          <InsightPanel
            stats={stats}
            totalFiltrado={registrosFiltrados.length}
            filtrosAtivos={filtrosAtivos}
            projetos={dados.projetos}
            aoSelecionar={aoSelecionar}
            baseAlternativa={baseAlternativa}
          />
        </div>
      </div>

      {/* Card do imóvel — folha inferior no mobile */}
      {selecionado && (
        <div className="fixed inset-x-0 bottom-0 z-[1100] lg:hidden">
          <RecordCard
            registro={selecionado}
            aoFechar={() => setSelecionado(null)}
            variante="folha"
          />
        </div>
      )}

      {painelMobile === 'filtros' && (
        <Sheet titulo="Filtros do mapa" aoFechar={() => setPainelMobile(null)}>
          <FilterPanel
            filtros={filtros}
            aoMudar={setFiltros}
            distritos={distritos}
            usos={usos}
            visiveis={registrosFiltrados.length}
            total={dados.total}
          />
        </Sheet>
      )}

      {painelMobile === 'camadas' && (
        <Sheet titulo="Camadas e base" aoFechar={() => setPainelMobile(null)}>
          <LayerPanel
            camadas={camadas}
            aoMudarCamadas={setCamadas}
            base={base}
            aoMudarBase={setBase}
            geometria={geometria}
            projetos={dados.projetos}
          />
          <p className="mt-3 text-[11px] leading-relaxed text-fg-muted">
            Tipologias: {Object.entries(TIPOS).map(([, visual]) => visual.rotulo).join(' · ')}.
          </p>
        </Sheet>
      )}
    </div>
  )
}
