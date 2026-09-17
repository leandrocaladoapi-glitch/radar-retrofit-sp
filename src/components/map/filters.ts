/*
 * Estado e regras dos filtros do mapa.
 *
 * Regra de ouro: um filtro vazio significa "sem restrição" naquela dimensão.
 * Todos os filtros rodam em memória (~1.000 registros) e alimentam a mesma
 * fonte GeoJSON do mapa — o que mantém a renderização previsível e rápida.
 */

import type { RegistroMapa, TipoRegistro } from '../../lib/mapa'

export type TriEstado = 'todos' | 'sim' | 'nao'
export type PatrimonioFiltro = 'todos' | 'protegido' | 'livre'

export interface Faixa {
  id: string
  rotulo: string
  min: number
  max: number
}

export interface Filtros {
  tipos: TipoRegistro[]
  distritos: string[]
  scoreMin: number
  requalifica: 'todos' | 'dentro'
  aiu: 'todos' | 'dentro'
  patrimonio: PatrimonioFiltro
  usos: string[]
  areas: string[]
  custos: string[]
  tetos: string[]
  busca: string
}

export const FILTROS_PADRAO: Filtros = {
  tipos: [],
  distritos: [],
  scoreMin: 0,
  requalifica: 'todos',
  aiu: 'todos',
  patrimonio: 'todos',
  usos: [],
  areas: [],
  custos: [],
  tetos: [],
  busca: '',
}

export const FAIXAS_AREA: Faixa[] = [
  { id: 'a1', rotulo: '3.000–5.000 m²', min: 0, max: 5000 },
  { id: 'a2', rotulo: '5.000–10.000 m²', min: 5000, max: 10000 },
  { id: 'a3', rotulo: '10.000–20.000 m²', min: 10000, max: 20000 },
  { id: 'a4', rotulo: '20.000 m² ou mais', min: 20000, max: Infinity },
]

export const FAIXAS_CUSTO: Faixa[] = [
  { id: 'c1', rotulo: 'Até R$ 25 mi', min: 0, max: 25 },
  { id: 'c2', rotulo: 'R$ 25–50 mi', min: 25, max: 50 },
  { id: 'c3', rotulo: 'R$ 50–100 mi', min: 50, max: 100 },
  { id: 'c4', rotulo: 'R$ 100 mi ou mais', min: 100, max: Infinity },
]

export const FAIXAS_TETO: Faixa[] = [
  { id: 't1', rotulo: 'Até R$ 5 mi', min: 0, max: 5 },
  { id: 't2', rotulo: 'R$ 5–10 mi', min: 5, max: 10 },
  { id: 't3', rotulo: 'R$ 10–25 mi', min: 10, max: 25 },
  { id: 't4', rotulo: 'R$ 25 mi ou mais', min: 25, max: Infinity },
]

export const ROTULOS_TIPO: Record<TipoRegistro, string> = {
  oportunidade: 'Oportunidade',
  oportunidade_prioritaria: 'Prioritária (85+)',
  tombado: 'Protegido',
  tombado_prioritario: 'Protegido + 85+',
}

function dentroDeFaixas(valor: number | null, faixas: string[], lista: Faixa[]): boolean {
  if (!faixas.length) return true
  if (valor === null) return false
  return faixas.some((id) => {
    const faixa = lista.find((f) => f.id === id)
    if (!faixa) return false
    return valor >= faixa.min && valor < faixa.max
  })
}

export function aplicarFiltros(registros: RegistroMapa[], filtros: Filtros): RegistroMapa[] {
  const busca = filtros.busca.trim().toLowerCase()
  return registros.filter((r) => {
    if (filtros.tipos.length && !filtros.tipos.includes(r.tipo)) return false
    if (filtros.distritos.length && (!r.distrito || !filtros.distritos.includes(r.distrito))) return false
    if (r.score < filtros.scoreMin) return false
    if (filtros.requalifica === 'dentro' && r.requalificaCentro !== 'dentro') return false
    if (filtros.aiu === 'dentro' && r.aiuSetorCentral !== 'dentro') return false
    if (filtros.patrimonio === 'protegido' && !r.situacaoPatrimonial) return false
    if (filtros.patrimonio === 'livre' && !!r.situacaoPatrimonial) return false
    if (filtros.usos.length && (!r.usoCadastrado || !filtros.usos.includes(r.usoCadastrado))) return false
    if (!dentroDeFaixas(r.areaConstruida, filtros.areas, FAIXAS_AREA)) return false
    if (!dentroDeFaixas(r.custoMilhoes, filtros.custos, FAIXAS_CUSTO)) return false
    if (!dentroDeFaixas(r.tetoSubvencaoMilhoes, filtros.tetos, FAIXAS_TETO)) return false
    if (busca) {
      const alvo = `${r.nome} ${r.sql ?? ''} ${r.distrito ?? ''}`.toLowerCase()
      if (!alvo.includes(busca)) return false
    }
    return true
  })
}

export function contarFiltrosAtivos(filtros: Filtros): number {
  let total = 0
  if (filtros.tipos.length) total += 1
  if (filtros.distritos.length) total += 1
  if (filtros.scoreMin > 0) total += 1
  if (filtros.requalifica === 'dentro') total += 1
  if (filtros.aiu === 'dentro') total += 1
  if (filtros.patrimonio !== 'todos') total += 1
  if (filtros.usos.length) total += 1
  if (filtros.areas.length) total += 1
  if (filtros.custos.length) total += 1
  if (filtros.tetos.length) total += 1
  if (filtros.busca.trim()) total += 1
  return total
}

export interface Preset {
  id: string
  rotulo: string
  filtros: Partial<Filtros>
}

export const PRESETS: Preset[] = [
  {
    id: 'prioritarias',
    rotulo: 'Alto score (85+)',
    filtros: { scoreMin: 85 },
  },
  {
    id: 'requalifica',
    rotulo: 'Dentro do Requalifica Centro',
    filtros: { requalifica: 'dentro' },
  },
  {
    id: 'protegidos',
    rotulo: 'Imóveis protegidos',
    filtros: { patrimonio: 'protegido' },
  },
  {
    id: 'grandes',
    rotulo: 'Porte grande (10 mil m²+)',
    filtros: { areas: ['a3', 'a4'] },
  },
]

export function opcoesUnicas(registros: RegistroMapa[], campo: 'distrito' | 'usoCadastrado'): string[] {
  const set = new Set<string>()
  registros.forEach((r) => {
    const valor = r[campo]
    if (valor) set.add(valor)
  })
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function alternar<T>(lista: T[], valor: T): T[] {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
}
