'use client'

/*
 * Canvas do mapa (MapLibre GL + base vetorial sem chave de API).
 *
 * Responsabilidades:
 *  - renderizar a base, os clusters e os marcadores (uma única fonte GeoJSON);
 *  - reagir a filtros/camadas sem recriar o mapa;
 *  - clusterização nativa (agrupa, contabiliza e abre progressivamente no zoom);
 *  - seleção, tooltip leve e leitura de viewport.
 *
 * Nada é renderizado "solto": abaixo do zoom de expansão do cluster, os pontos
 * aparecem agrupados — o que elimina o "tapete de bolinhas".
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  NavigationControl,
  Popup,
  ScaleControl,
  type ExpressionSpecification,
  type GeoJSONSourceSpecification,
  type StyleSpecification,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { FeatureCollection } from 'geojson'
import type { RegistroMapa } from '../../lib/mapa'
import {
  BASES,
  CENTRO_INICIAL,
  CORES,
  ESTILO_FALLBACK,
  TIPOS,
  ZOOM_INICIAL,
  ZOOM_MAX,
  type BaseId,
} from './theme'
import type { Camadas, PerimetrosGeo } from './layers'
import type { Bounds } from './stats'
import { registrarIcones } from './icons'

const FONTE = 'imoveis'
const TIMEOUT_FALLBACK_MS = 9000
const NENHUMA_SELECAO = '__radar_nenhum__'

export interface MapCanvasProps {
  registros: RegistroMapa[]
  indicePorId: Map<string, RegistroMapa>
  selecionado: RegistroMapa | null
  onSelecionar: (registro: RegistroMapa | null) => void
  onViewport: (bounds: Bounds) => void
  camadas: Camadas
  base: BaseId
  perimetros: PerimetrosGeo | null
  boundsIniciais: [[number, number], [number, number]]
  /** Incrementar este contador pede ao mapa que reenquadre o recorte atual. */
  comandoEnquadrar?: number
  /** Avisa a interface quando a base vetorial falha e o plano B raster entra. */
  onBaseAlternativa?: () => void
}

function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  )
}

function montarFeatureCollection(registros: RegistroMapa[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: registros.map((r) => ({
      type: 'Feature',
      // O identificador viaja em properties (strings estáveis), evitando
      // ambiguidade de id numérico no worker de clusterização.
      geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
      properties: {
        id: r.id,
        nome: r.nome,
        tipo: r.tipo,
        score: r.score,
        areaConstruida: r.areaConstruida,
        uso: r.usoCadastrado ?? '',
        situacao: r.situacaoPatrimonial ?? '',
        requalificaCentro: r.requalificaCentro,
        aiuSetorCentral: r.aiuSetorCentral,
      },
    })),
  }
}

export default function MapCanvas({
  registros,
  indicePorId,
  selecionado,
  onSelecionar,
  onViewport,
  camadas,
  base,
  perimetros,
  boundsIniciais,
  comandoEnquadrar = 0,
  onBaseAlternativa,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const tooltipRef = useRef<Popup | null>(null)
  const fallbackRef = useRef(false)
  const timerFallbackRef = useRef<number | null>(null)
  const estiloAplicadoRef = useRef<string | null>(null)
  const ajusteInicialRef = useRef(false)
  const [pronto, setPronto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [baseAlternativa, setBaseAlternativa] = useState(false)

  // Última versão das props, acessível dentro dos handlers registrados no mapa.
  const propsRef = useRef({
    registros,
    indicePorId,
    selecionado,
    onSelecionar,
    onViewport,
    camadas,
    perimetros,
    boundsIniciais,
    onBaseAlternativa,
  })
  useEffect(() => {
    propsRef.current = {
      registros,
      indicePorId,
      selecionado,
      onSelecionar,
      onViewport,
      camadas,
      perimetros,
      boundsIniciais,
      onBaseAlternativa,
    }
  })

  const expressaoIcone = useCallback((camadasAtuais: Camadas): ExpressionSpecification => {
    const prioritaria = TIPOS.oportunidade_prioritaria.icone
    const tombado = TIPOS.tombado.icone
    const tombadoPrioritario = TIPOS.tombado_prioritario.icone
    const base = TIPOS.oportunidade.icone
    const protegidoNormal = camadasAtuais.protegidos ? tombado : base
    const protegidoPrioritario = camadasAtuais.protegidos
      ? camadasAtuais.prioritarias
        ? tombadoPrioritario
        : tombado
      : camadasAtuais.prioritarias
        ? prioritaria
        : base
    const oportunidadePrioritaria = camadasAtuais.prioritarias ? prioritaria : base
    const expressao = [
      'case',
      ['==', ['get', 'tipo'], 'tombado_prioritario'],
      protegidoPrioritario,
      ['==', ['get', 'tipo'], 'tombado'],
      protegidoNormal,
      ['==', ['get', 'tipo'], 'oportunidade_prioritaria'],
      oportunidadePrioritaria,
      base,
    ]
    return expressao as unknown as ExpressionSpecification
  }, [])

  const tamanhoIcone = useMemo(() => {
    const base = [
      'case',
      ['==', ['get', 'tipo'], 'tombado_prioritario'],
      0.86,
      ['==', ['get', 'tipo'], 'tombado'],
      0.74,
      ['==', ['get', 'tipo'], 'oportunidade_prioritaria'],
      0.78,
      0.66,
    ]
    const expressao = [
      'interpolate',
      ['linear'],
      ['zoom'],
      10,
      ['*', base, 0.95],
      13,
      base,
      16,
      ['*', base, 1.05],
      18,
      ['*', base, 1.15],
    ]
    return expressao as unknown as ExpressionSpecification
  }, [])

  /** Cria (uma única vez) as fontes e camadas do mapa. Idempotente. */
  const configurar = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    registrarIcones(map)

    const dados = montarFeatureCollection(propsRef.current.registros)

    if (!map.getSource(FONTE)) {
      const especificacao: GeoJSONSourceSpecification = {
        type: 'geojson',
        data: dados,
        cluster: true,
        clusterRadius: 60,
        clusterMaxZoom: 14,
        clusterProperties: { scoreMax: ['max', ['get', 'score']] },
      }
      map.addSource(FONTE, especificacao)
    }

    // 1) Perímetros oficiais (quando a geometria está disponível) — ficam no fundo
    const perimetrosAtuais = propsRef.current.perimetros
    if (perimetrosAtuais?.aiu && !map.getSource('perimetro-aiu')) {
      map.addSource('perimetro-aiu', { type: 'geojson', data: perimetrosAtuais.aiu.data })
    }
    if (perimetrosAtuais?.requalifica && !map.getSource('perimetro-requalifica')) {
      map.addSource('perimetro-requalifica', { type: 'geojson', data: perimetrosAtuais.requalifica.data })
    }
    if (perimetrosAtuais?.distritos && !map.getSource('distritos')) {
      map.addSource('distritos', { type: 'geojson', data: perimetrosAtuais.distritos.data })
    }

    if (map.getSource('perimetro-aiu') && !map.getLayer('perimetro-aiu-fill')) {
      map.addLayer({
        id: 'perimetro-aiu-fill',
        type: 'fill',
        source: 'perimetro-aiu',
        paint: { 'fill-color': CORES.perimetroAiu, 'fill-opacity': 0.05 },
      })
      map.addLayer({
        id: 'perimetro-aiu-line',
        type: 'line',
        source: 'perimetro-aiu',
        paint: { 'line-color': CORES.perimetroAiu, 'line-width': 1.2, 'line-opacity': 0.75, 'line-dasharray': [3, 2] },
      })
    }
    if (map.getSource('perimetro-requalifica') && !map.getLayer('perimetro-requalifica-fill')) {
      map.addLayer({
        id: 'perimetro-requalifica-fill',
        type: 'fill',
        source: 'perimetro-requalifica',
        paint: { 'fill-color': CORES.perimetroRequalifica, 'fill-opacity': 0.06 },
      })
      map.addLayer({
        id: 'perimetro-requalifica-line',
        type: 'line',
        source: 'perimetro-requalifica',
        paint: { 'line-color': CORES.perimetroRequalifica, 'line-width': 1.4, 'line-opacity': 0.85 },
      })
    }
    if (map.getSource('distritos') && !map.getLayer('distritos-line')) {
      map.addLayer({
        id: 'distritos-line',
        type: 'line',
        source: 'distritos',
        paint: { 'line-color': CORES.distrito, 'line-width': 0.9, 'line-opacity': 0.5, 'line-dasharray': [2, 1.5] },
      })
    }

    // 2) Destaque territorial (usado quando não há geometria oficial carregada)
    if (!map.getLayer('destaque-aiu')) {
      map.addLayer({
        id: 'destaque-aiu',
        type: 'circle',
        source: FONTE,
        filter: ['==', ['get', 'aiuSetorCentral'], 'dentro'],
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 9, 14, 15, 17, 26],
          'circle-stroke-color': CORES.haloAiu,
          'circle-stroke-width': 1.1,
          'circle-stroke-opacity': 0.55,
        },
      })
    }
    if (!map.getLayer('destaque-requalifica')) {
      map.addLayer({
        id: 'destaque-requalifica',
        type: 'circle',
        source: FONTE,
        filter: ['==', ['get', 'requalificaCentro'], 'dentro'],
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 7, 14, 12, 17, 20],
          'circle-stroke-color': CORES.haloRequalifica,
          'circle-stroke-width': 1.5,
          'circle-stroke-opacity': 0.8,
        },
      })
    }

    // 3) Clusters
    if (!map.getLayer('imoveis-clusters')) {
      map.addLayer({
        id: 'imoveis-clusters',
        type: 'circle',
        source: FONTE,
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            CORES.clusterBaixo,
            8,
            CORES.clusterMedio,
            40,
            CORES.clusterAlto,
          ],
          'circle-radius': ['step', ['get', 'point_count'], 14, 8, 18, 40, 23, 150, 29],
          'circle-stroke-width': 2,
          'circle-stroke-color': CORES.clusterBorda,
          'circle-opacity': 0.92,
        },
      })
    }
    if (!map.getLayer('imoveis-cluster-count')) {
      map.addLayer({
        id: 'imoveis-cluster-count',
        type: 'symbol',
        source: FONTE,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Noto Sans Regular'],
          'text-size': ['step', ['get', 'point_count'], 11, 40, 12, 200, 13],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: { 'text-color': '#ffffff' },
      })
    }

    // 4) Marcadores individuais — anti-colisão: em área densa o mapa prioriza
    //    os imóveis de maior score e evita o empilhamento de bolinhas.
    if (!map.getLayer('imoveis-pontos')) {
      map.addLayer({
        id: 'imoveis-pontos',
        type: 'symbol',
        source: FONTE,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': expressaoIcone(propsRef.current.camadas),
          'icon-size': tamanhoIcone,
          'icon-allow-overlap': false,
          'icon-ignore-placement': false,
          'icon-padding': 3,
          'symbol-sort-key': ['-', ['get', 'score']],
        },
      })
    }

    // 5) Seleção — sempre visível, mesmo sob o anti-colisão
    if (!map.getLayer('imoveis-selecao')) {
      map.addLayer({
        id: 'imoveis-selecao',
        type: 'circle',
        source: FONTE,
        filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'id'], NENHUMA_SELECAO]],
        paint: {
          'circle-color': 'rgba(0,0,0,0)',
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 12, 14, 18, 17, 30],
          'circle-stroke-color': CORES.selecao,
          'circle-stroke-width': 2.5,
          'circle-stroke-opacity': 0.85,
        },
      })
    }
  }, [expressaoIcone, tamanhoIcone])

  /** Aplica dados + camadas sem recriar nada. */
  const aplicarEstado = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const dadosAtuais = propsRef.current.registros
    const camadasAtuais = propsRef.current.camadas

    const fonte = map.getSource(FONTE) as GeoJSONSource | undefined
    if (fonte) {
      fonte.setData(montarFeatureCollection(dadosAtuais))
    }

    const visivel = (id: string, condicao: boolean) => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', condicao ? 'visible' : 'none')
      }
    }

    visivel('imoveis-clusters', camadasAtuais.imoveis)
    visivel('imoveis-cluster-count', camadasAtuais.imoveis)
    visivel('imoveis-pontos', camadasAtuais.imoveis)
    visivel('imoveis-selecao', camadasAtuais.imoveis)

    const temGeometriaRequalifica = !!map.getSource('perimetro-requalifica')
    const temGeometriaAiu = !!map.getSource('perimetro-aiu')
    const temGeometriaDistritos = !!map.getSource('distritos')

    visivel('perimetro-requalifica-fill', camadasAtuais.requalificaCentro && temGeometriaRequalifica)
    visivel('perimetro-requalifica-line', camadasAtuais.requalificaCentro && temGeometriaRequalifica)
    visivel('perimetro-aiu-fill', camadasAtuais.aiuSetorCentral && temGeometriaAiu)
    visivel('perimetro-aiu-line', camadasAtuais.aiuSetorCentral && temGeometriaAiu)
    visivel('distritos-line', camadasAtuais.distritos && temGeometriaDistritos)

    // O destaque por imóvel só entra quando não há geometria oficial daquele perímetro
    visivel('destaque-requalifica', camadasAtuais.imoveis && camadasAtuais.requalificaCentro && !temGeometriaRequalifica)
    visivel('destaque-aiu', camadasAtuais.imoveis && camadasAtuais.aiuSetorCentral && !temGeometriaAiu)

    if (map.getLayer('imoveis-pontos')) {
      map.setLayoutProperty('imoveis-pontos', 'icon-image', expressaoIcone(camadasAtuais))
    }
  }, [expressaoIcone])

  /** Reaplica o destaque do imóvel selecionado (também após troca de base). */
  const aplicarSelecao = useCallback(() => {
    const map = mapRef.current
    if (!map || !map.getLayer('imoveis-selecao')) return
    const atual = propsRef.current.selecionado
    map.setFilter('imoveis-selecao', [
      'all',
      ['!', ['has', 'point_count']],
      ['==', ['get', 'id'], atual ? atual.id : NENHUMA_SELECAO],
    ])
  }, [])

  // Inicialização
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let map: MapLibreMap
    try {
      map = new MapLibreMap({
        container: containerRef.current,
        style: BASES[0].style,
        center: CENTRO_INICIAL,
        zoom: ZOOM_INICIAL,
        minZoom: 10,
        maxZoom: ZOOM_MAX,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
        fadeDuration: 120,
      })
    } catch {
      setErro('Não foi possível iniciar o mapa neste navegador (WebGL indisponível).')
      return
    }

    mapRef.current = map
    estiloAplicadoRef.current = BASES[0].style

    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new ScaleControl({ maxWidth: 90, unit: 'metric' }), 'bottom-left')
    if (map.touchZoomRotate) map.touchZoomRotate.disableRotation()

    const aplicarFallback = (motivo: string) => {
      if (fallbackRef.current || !mapRef.current) return
      fallbackRef.current = true
      setBaseAlternativa(true)
      propsRef.current.onBaseAlternativa?.()
      console.warn(`[mapa] base vetorial indisponível (${motivo}); aplicando base raster alternativa.`)
      mapRef.current.setStyle(ESTILO_FALLBACK as unknown as StyleSpecification)
    }

    map.on('style.load', () => {
      configurar()
      aplicarEstado()
      aplicarSelecao()
    })

    map.on('load', () => {
      setPronto(true)
      if (timerFallbackRef.current) {
        window.clearTimeout(timerFallbackRef.current)
        timerFallbackRef.current = null
      }
      if (!ajusteInicialRef.current) {
        ajusteInicialRef.current = true
        const [[sul, oeste], [norte, leste]] = propsRef.current.boundsIniciais
        map.fitBounds(
          new LngLatBounds([oeste, sul], [leste, norte]),
          { padding: { top: 40, bottom: 40, left: 40, right: 40 }, maxZoom: 14, duration: 0 }
        )
      }
      const b = map.getBounds()
      propsRef.current.onViewport({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      })
    })

    // Só troca de base quando o problema é claramente da própria base
    // (evita reagir a erros de tile isolado ou de glifo ausente).
    map.on('error', (evento) => {
      const mensagem = String((evento as { error?: { message?: string } })?.error?.message ?? '')
      if (/openfreemap|failed to load style|style\.json/i.test(mensagem)) {
        aplicarFallback(mensagem.slice(0, 120))
      }
    })

    timerFallbackRef.current = window.setTimeout(() => {
      if (!mapRef.current || mapRef.current.isStyleLoaded()) return
      aplicarFallback('tempo limite ao carregar o estilo da base')
    }, TIMEOUT_FALLBACK_MS)

    const tooltip = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 16,
      maxWidth: '260px',
      className: 'radar-tooltip',
    })
    tooltipRef.current = tooltip

    const camadasInterativas = ['imoveis-clusters', 'imoveis-pontos']
    const camadasExistentes = () => camadasInterativas.filter((id) => map.getLayer(id))

    let rafHover: number | null = null
    let ultimoPonto: { x: number; y: number } | null = null

    const aoMover = (evento: { point: { x: number; y: number }; lngLat: { lng: number; lat: number } }) => {
      ultimoPonto = evento.point
      if (rafHover !== null) return
      rafHover = window.requestAnimationFrame(() => {
        rafHover = null
        const ponto = ultimoPonto
        if (!ponto || !mapRef.current) return
        const camadasAtivas = camadasExistentes()
        if (!camadasAtivas.length || !propsRef.current.camadas.imoveis) {
          tooltip.remove()
          return
        }
        const recursos = mapRef.current.queryRenderedFeatures([ponto.x, ponto.y], { layers: camadasAtivas })
        if (!recursos.length) {
          mapRef.current.getCanvas().style.cursor = ''
          tooltip.remove()
          return
        }
        const feature = recursos[0]
        mapRef.current.getCanvas().style.cursor = 'pointer'
        const propriedades = (feature.properties ?? {}) as Record<string, unknown>
        if (typeof propriedades.point_count === 'number') {
          tooltip
            .setLngLat([evento.lngLat.lng, evento.lngLat.lat])
            .setHTML(
              `<div class="radar-tooltip-caixa"><strong>${propriedades.point_count} imóveis agrupados</strong><span>Clique para abrir o grupo</span></div>`
            )
            .addTo(mapRef.current)
          return
        }
        const registro = propsRef.current.indicePorId.get(String(propriedades.id))
        if (!registro) {
          tooltip.remove()
          return
        }
        const visual = TIPOS[registro.tipo]
        tooltip
          .setLngLat([registro.lng, registro.lat])
          .setHTML(
            `<div class="radar-tooltip-caixa"><strong>${escaparHtml(registro.nome)}</strong>` +
              `<span><i style="background:${visual.cor}"></i>${escaparHtml(visual.rotulo)} · Score ${registro.score}</span>` +
              `<span class="radar-tooltip-dica">Clique para ver o dossiê resumido</span></div>`
          )
          .addTo(mapRef.current)
      })
    }

    const aoSair = () => {
      tooltip.remove()
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = ''
    }

    const aoClicar = (evento: { point: { x: number; y: number } }) => {
      const camadasAtivas = camadasExistentes()
      if (!camadasAtivas.length || !propsRef.current.camadas.imoveis) return
      const recursos = map.queryRenderedFeatures([evento.point.x, evento.point.y], { layers: camadasAtivas })
      if (!recursos.length) {
        propsRef.current.onSelecionar(null)
        return
      }
      const feature = recursos[0]
      const propriedades = (feature.properties ?? {}) as Record<string, unknown>

      if (typeof propriedades.cluster_id === 'number') {
        const fonte = map.getSource(FONTE) as GeoJSONSource | undefined
        const clusterId = propriedades.cluster_id
        const coordenadas = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates
        if (!fonte) return
        Promise.resolve(fonte.getClusterExpansionZoom(clusterId))
          .then((zoom) => {
            map.easeTo({
              center: coordenadas,
              zoom: Math.min(zoom + 0.35, ZOOM_MAX),
              duration: 420,
            })
          })
          .catch(() => {
            map.easeTo({ center: coordenadas, zoom: Math.min(map.getZoom() + 2, ZOOM_MAX), duration: 420 })
          })
        return
      }

      const registro = propsRef.current.indicePorId.get(String(propriedades.id)) ?? null
      propsRef.current.onSelecionar(registro)
    }

    let timerViewport: number | null = null
    const aoMoverFim = () => {
      if (timerViewport) window.clearTimeout(timerViewport)
      timerViewport = window.setTimeout(() => {
        const b = map.getBounds()
        propsRef.current.onViewport({
          south: b.getSouth(),
          west: b.getWest(),
          north: b.getNorth(),
          east: b.getEast(),
        })
      }, 150)
    }

    map.on('mousemove', aoMover)
    map.on('mouseout', aoSair)
    map.on('click', aoClicar)
    map.on('moveend', aoMoverFim)

    return () => {
      if (timerFallbackRef.current) window.clearTimeout(timerFallbackRef.current)
      if (rafHover !== null) window.cancelAnimationFrame(rafHover)
      if (timerViewport) window.clearTimeout(timerViewport)
      tooltip.remove()
      map.off('mousemove', aoMover)
      map.off('mouseout', aoSair)
      map.off('click', aoClicar)
      map.off('moveend', aoMoverFim)
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dados filtrados
  useEffect(() => {
    if (!pronto) return
    aplicarEstado()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registros, pronto])

  // Camadas
  useEffect(() => {
    if (!pronto) return
    aplicarEstado()
  }, [camadas, pronto, aplicarEstado])

  // Perímetros oficiais (chegam de forma assíncrona)
  useEffect(() => {
    if (!pronto) return
    configurar()
    aplicarEstado()
  }, [perimetros, pronto, configurar, aplicarEstado])

  // Seleção
  useEffect(() => {
    const map = mapRef.current
    if (!map || !pronto) return
    aplicarSelecao()
    if (selecionado) {
      // Em telas largas o cartão abre à direita; no mobile, abaixo do mapa.
      const largura = containerRef.current?.clientWidth ?? 0
      map.easeTo({
        center: [selecionado.lng, selecionado.lat],
        duration: 420,
        padding:
          largura > 1024
            ? { top: 48, bottom: 48, left: 380, right: 48 }
            : { top: 56, bottom: 300, left: 24, right: 24 },
        zoom: Math.max(map.getZoom(), 15.4),
      })
    }
  }, [selecionado, pronto, aplicarSelecao])

  // Troca de base
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const alvo = BASES.find((b) => b.id === base)?.style
    if (!alvo || alvo === estiloAplicadoRef.current) return
    estiloAplicadoRef.current = alvo
    fallbackRef.current = false
    setBaseAlternativa(false)
    map.setStyle(alvo, { diff: false })
  }, [base])

  // Reenquadrar o recorte atual (botão "Ver tudo"/presets)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !pronto || !comandoEnquadrar) return
    const registrosAtuais = propsRef.current.registros
    if (!registrosAtuais.length) {
      const [[sul, oeste], [norte, leste]] = propsRef.current.boundsIniciais
      map.fitBounds(new LngLatBounds([oeste, sul], [leste, norte]), {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 14,
        duration: 500,
      })
      return
    }
    const bounds = new LngLatBounds()
    registrosAtuais.forEach((r) => bounds.extend([r.lng, r.lat]))
    map.fitBounds(bounds, {
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
      maxZoom: 15,
      duration: 600,
    })
  }, [comandoEnquadrar, pronto])

  return (
    <div className="radar-mapa-canvas relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {!pronto && !erro && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100 text-sm text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          Carregando mapa…
        </div>
      )}

      {erro && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 px-6 text-center text-sm text-slate-600">
          {erro}
        </div>
      )}

      {baseAlternativa && (
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-600 shadow">
          Base vetorial indisponível — usando base raster alternativa sem chave de API.
        </div>
      )}
    </div>
  )
}
