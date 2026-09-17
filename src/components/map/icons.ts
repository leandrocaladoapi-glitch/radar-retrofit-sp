/*
 * Ícones dos marcadores.
 *
 * São desenhados em canvas no próprio navegador e registrados no mapa
 * (map.addImage). Isso evita dependência de sprite externo com chave de API,
 * mantém tudo offline e permite nitidez em telas retina.
 *
 * Quatro formas distintas — e não apenas cores diferentes — para que a
 * tipologia continue legível para pessoas com baixa visão de cores:
 *   círculo    → oportunidade
 *   losango    → oportunidade prioritária
 *   escudo     → imóvel protegido
 *   escudo+anel → protegido e prioritário
 */

import type { Map as MapLibreMap } from 'maplibre-gl'
import { TIPOS } from './theme'
import type { TipoRegistro } from '../../lib/mapa'

const PIXEL_RATIO = 2
const BASE = 40 // px de bitmap para o ícone de referência

type Forma = 'circulo' | 'losango' | 'escudo' | 'escudoAnel'

const FORMAS: Record<TipoRegistro, Forma> = {
  oportunidade: 'circulo',
  oportunidade_prioritaria: 'losango',
  tombado: 'escudo',
  tombado_prioritario: 'escudoAnel',
}

function caminhoCirculo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
}

function caminhoLosango(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const raio = r * 1.24
  ctx.beginPath()
  ctx.moveTo(cx, cy - raio)
  ctx.lineTo(cx + raio, cy)
  ctx.lineTo(cx, cy + raio)
  ctx.lineTo(cx - raio, cy)
  ctx.closePath()
}

function caminhoEscudo(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const meiaLargura = r * 1.02
  const topo = cy - r * 1.12
  const base = cy + r * 1.12
  const ombro = cy + r * 0.12
  ctx.beginPath()
  ctx.moveTo(cx - meiaLargura, topo)
  ctx.lineTo(cx + meiaLargura, topo)
  ctx.lineTo(cx + meiaLargura, ombro)
  ctx.quadraticCurveTo(cx + meiaLargura, base - r * 0.25, cx, base)
  ctx.quadraticCurveTo(cx - meiaLargura, base - r * 0.25, cx - meiaLargura, ombro)
  ctx.closePath()
}

function desenhar(forma: Forma, cor: string, corBorda: string): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = BASE
  canvas.height = BASE
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D indisponível para desenhar ícones do mapa.')
  }

  const centro = BASE / 2
  const raio = BASE * 0.3

  const tracar = () => {
    if (forma === 'circulo') caminhoCirculo(ctx, centro, centro, raio)
    else if (forma === 'losango') caminhoLosango(ctx, centro, centro, raio * 0.92)
    else caminhoEscudo(ctx, centro, centro, raio * 0.92)
  }

  // halo claro para separar o marcador do fundo do mapa
  tracar()
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(255,255,255,0.95)'
  ctx.stroke()

  tracar()
  ctx.fillStyle = cor
  ctx.fill()

  tracar()
  ctx.lineWidth = 2.6
  ctx.strokeStyle = corBorda
  ctx.stroke()

  if (forma === 'escudoAnel' || forma === 'losango') {
    // marca interna: reforça a leitura de "prioritário" / "protegido+prioritário"
    ctx.beginPath()
    ctx.arc(centro, centro, raio * (forma === 'escudoAnel' ? 0.3 : 0.26), 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.92)'
    ctx.fill()
  }

  return ctx.getImageData(0, 0, BASE, BASE)
}

/** Registra (uma única vez) todos os ícones da tipologia no mapa. */
export function registrarIcones(map: MapLibreMap) {
  ;(Object.keys(TIPOS) as TipoRegistro[]).forEach((tipo) => {
    const visual = TIPOS[tipo]
    if (map.hasImage(visual.icone)) return
    const dados = desenhar(FORMAS[tipo], visual.cor, visual.corBorda)
    map.addImage(visual.icone, dados, { pixelRatio: PIXEL_RATIO })
  })
}
