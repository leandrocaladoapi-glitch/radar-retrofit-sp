/*
 * Tipos e decodificação da base do Mapa de Oportunidades.
 *
 * A base (src/data/mapa.json) é gerada por scripts/build_mapa_index.js em
 * formato colunar (arrays alinhados ao vetor `campos`) para reduzir o payload
 * enviado ao navegador. Nada aqui inventa dado: é decodificação 1:1.
 */

export type TipoRegistro = 'oportunidade' | 'oportunidade_prioritaria' | 'tombado' | 'tombado_prioritario'

export type RelacaoTerritorial = 'dentro' | 'intersecta' | 'fora'

export interface RegistroMapa {
  id: string
  slug: string
  nome: string
  sql: string | null
  distrito: string | null
  lat: number
  lng: number
  areaConstruida: number
  areaTerreno: number
  usoCadastrado: string | null
  zoneamento: string | null
  score: number
  confidence: number | null
  tipo: TipoRegistro
  situacaoPatrimonial: string | null
  nivelPatrimonial: string | null
  relacaoPatrimonial: string | null
  zepec: string | null
  resolucaoPatrimonial: string | null
  requalificaCentro: RelacaoTerritorial
  perimetroRequalifica: string | null
  aiuSetorCentral: RelacaoTerritorial
  custoMilhoes: number | null
  tetoSubvencaoMilhoes: number | null
  ultimaVerificacao: string | null
}

export interface ProjetosInfo {
  total: number
  georreferenciados: number
  nota: string
  url: string
}

export interface BaseMapa {
  geradoEm: string
  fonte: string
  metodo: string
  cortePrioritario: number
  total: number
  bounds: [[number, number], [number, number]]
  projetos: ProjetosInfo
  registros: RegistroMapa[]
}

export interface MapaRaw {
  geradoEm: string
  fonte: string
  metodo: string
  cortePrioritario: number
  total: number
  bounds: [[number, number], [number, number]]
  projetos: ProjetosInfo
  campos: string[]
  registros: Array<Array<string | number | null>>
}

/** Decodifica o formato colunar em objetos tipados. */
export function decodificarMapa(raw: MapaRaw): BaseMapa {
  const idx: Record<string, number> = {}
  raw.campos.forEach((campo, i) => {
    idx[campo] = i
  })

  const registros: RegistroMapa[] = raw.registros.map((linha) => {
    const texto = (campo: string): string | null => {
      const v = linha[idx[campo]]
      return v === null || v === undefined || v === '' ? null : String(v)
    }
    const numero = (campo: string): number | null => {
      const v = linha[idx[campo]]
      return typeof v === 'number' && Number.isFinite(v) ? v : null
    }
    const relacao = (campo: string): RelacaoTerritorial => {
      const v = texto(campo)
      return v === 'dentro' || v === 'intersecta' ? v : 'fora'
    }
    return {
      id: String(texto('id') ?? ''),
      slug: String(texto('slug') ?? texto('id') ?? ''),
      nome: String(texto('nome') ?? ''),
      sql: texto('sql'),
      distrito: texto('distrito'),
      lat: numero('lat') ?? 0,
      lng: numero('lng') ?? 0,
      areaConstruida: numero('areaConstruida') ?? 0,
      areaTerreno: numero('areaTerreno') ?? 0,
      usoCadastrado: texto('usoCadastrado'),
      zoneamento: texto('zoneamento'),
      score: numero('score') ?? 0,
      confidence: numero('confidence'),
      tipo: (texto('tipo') as TipoRegistro) ?? 'oportunidade',
      situacaoPatrimonial: texto('situacaoPatrimonial'),
      nivelPatrimonial: texto('nivelPatrimonial'),
      relacaoPatrimonial: texto('relacaoPatrimonial'),
      zepec: texto('zepec'),
      resolucaoPatrimonial: texto('resolucaoPatrimonial'),
      requalificaCentro: relacao('requalificaCentro'),
      perimetroRequalifica: texto('perimetroRequalifica'),
      aiuSetorCentral: relacao('aiuSetorCentral'),
      custoMilhoes: numero('custoMilhoes'),
      tetoSubvencaoMilhoes: numero('tetoSubvencaoMilhoes'),
      ultimaVerificacao: texto('ultimaVerificacao'),
    }
  })

  return {
    geradoEm: raw.geradoEm,
    fonte: raw.fonte,
    metodo: raw.metodo,
    cortePrioritario: raw.cortePrioritario ?? 85,
    total: raw.total ?? registros.length,
    bounds: raw.bounds,
    projetos: raw.projetos,
    registros,
  }
}
