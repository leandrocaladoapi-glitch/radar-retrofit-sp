/*
 * Métricas do recorte visível (viewport ∩ filtros) e formatadores pt-BR.
 * Tudo é calculado em memória sobre ~1.000 registros: custo desprezível.
 */

import type { RegistroMapa, TipoRegistro } from '../../lib/mapa'
import { TIPOS } from './theme'

export interface Bounds {
  south: number
  west: number
  north: number
  east: number
}

export interface Contagem {
  chave: string
  rotulo: string
  total: number
}

export interface EstatisticasViewport {
  imoveis: number
  prioritarias: number
  protegidos: number
  scoreMedio: number | null
  areaMedia: number | null
  areaTotal: number
  custoMedio: number | null
  custoTotal: number
  tetoTotal: number
  distritos: Contagem[]
  tipos: Contagem[]
  top: RegistroMapa[]
}

export const BOUNDS_MUNDO: Bounds = { south: -90, west: -180, north: 90, east: 180 }

export function dentroDoViewport(r: RegistroMapa, b: Bounds): boolean {
  return r.lat >= b.south && r.lat <= b.north && r.lng >= b.west && r.lng <= b.east
}

export function calcularEstatisticas(
  registros: RegistroMapa[],
  bounds: Bounds,
  cortePrioritario = 85,
  limiteTop = 5
): EstatisticasViewport {
  const noViewport = registros.filter((r) => dentroDoViewport(r, bounds))

  const soma = (fn: (r: RegistroMapa) => number) => noViewport.reduce((acc, r) => acc + fn(r), 0)
  const custos = noViewport.map((r) => r.custoMilhoes).filter((v): v is number => typeof v === 'number')
  const tetos = noViewport.map((r) => r.tetoSubvencaoMilhoes).filter((v): v is number => typeof v === 'number')

  const distritosMapa = new Map<string, number>()
  const tiposMapa = new Map<TipoRegistro, number>()
  noViewport.forEach((r) => {
    const d = r.distrito ?? 'Não informado'
    distritosMapa.set(d, (distritosMapa.get(d) ?? 0) + 1)
    tiposMapa.set(r.tipo, (tiposMapa.get(r.tipo) ?? 0) + 1)
  })

  const distritos: Contagem[] = Array.from(distritosMapa.entries())
    .map(([chave, total]) => ({ chave, rotulo: chave, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  const tipos: Contagem[] = Array.from(tiposMapa.entries())
    .map(([chave, total]) => ({ chave, rotulo: TIPOS[chave].rotulo, total }))
    .sort((a, b) => b.total - a.total)

  const top = [...noViewport].sort((a, b) => b.score - a.score || b.areaConstruida - a.areaConstruida).slice(0, limiteTop)

  return {
    imoveis: noViewport.length,
    prioritarias: noViewport.filter((r) => r.score >= cortePrioritario).length,
    protegidos: noViewport.filter((r) => !!r.situacaoPatrimonial).length,
    scoreMedio: noViewport.length ? soma((r) => r.score) / noViewport.length : null,
    areaMedia: noViewport.length ? soma((r) => r.areaConstruida) / noViewport.length : null,
    areaTotal: soma((r) => r.areaConstruida),
    custoMedio: custos.length ? custos.reduce((a, b) => a + b, 0) / custos.length : null,
    custoTotal: custos.reduce((a, b) => a + b, 0),
    tetoTotal: tetos.reduce((a, b) => a + b, 0),
    distritos,
    tipos,
    top,
  }
}

const numero = new Intl.NumberFormat('pt-BR')

export function formatarNumero(valor: number | null | undefined, decimais = 0): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor)
}

export function formatarArea(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—'
  return `${numero.format(Math.round(valor))} m²`
}

export function formatarMilhoes(valor: number | null | undefined, decimais = 1): string {
  if (valor === null || valor === undefined || !Number.isFinite(valor)) return '—'
  const casas = valor >= 100 ? 0 : decimais
  return `R$ ${formatarNumero(valor, casas)} mi`
}

export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—'
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return '—'
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatarScore(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '—'
  return formatarNumero(valor, 0)
}

export function rotuloRelacao(relacao: string | null | undefined): string {
  switch (relacao) {
    case 'dentro':
      return 'dentro do perímetro'
    case 'intersecta':
      return 'intersecta o perímetro'
    default:
      return 'fora do perímetro'
  }
}
