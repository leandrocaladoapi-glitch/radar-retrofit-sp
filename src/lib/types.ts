export type TipoDado = 'DADO_OFICIAL' | 'DADO_CALCULADO' | 'ESTIMATIVA_RADAR' | 'ANALISE_RADAR'

export interface Proveniencia {
  valor?: unknown
  tipo: TipoDado
  fonte: string
  url?: string
  camada?: string
  metodo?: string
  descricao?: string | null
  coletadoEm?: string
  detalhe?: unknown
}

export interface ComponenteScore {
  nome: string
  pontos: number
  max: number
  justificativa: string
}

export interface ItemConfianca {
  nome: string
  ok: boolean
  peso: number
}

export interface FatorCusto {
  nome: string
  fator: number
}

export interface EstimativaCusto {
  tipo: TipoDado
  valorMilhoes: number
  textoValor: string
  areaConsiderada: number
  custoM2: number
  multiplicadorTotal: number
  fatores: FatorCusto[]
  dataBase: string
  formula: string
  fonteMetodologia: string
}

export interface TetoSubvencao {
  tipo: TipoDado
  valorMilhoes: number
  textoValor: string
  percentual: string
  formula: string
  base: string
  aviso: string
}

export interface RegistroTombamento {
  situacao: string | null
  area: string | null
  nivel: string | null
  zepec: string | null
  resolucaoConpresp: string | null
  resolucaoCondephaat: string | null
  resolucaoIphan: string | null
  linkResolucao: string | null
  relacao: string
}

export interface Fonte {
  nome: string
  orgao: string
  url: string
  consulta?: string
}

export interface RelacaoPerimetro {
  relacao: 'dentro' | 'intersecta' | 'fora'
  perimetro: string | null
  lei?: string | null
  link?: string
}

export interface Oportunidade {
  id: string
  slug: string
  nome: string
  sql: string
  logradouro: string
  numero: string
  complementoCadastral: string | null
  distrito: string | null
  lat: number
  lng: number
  geometry: unknown
  areaConstruida: number
  areaTerreno: number
  usoCadastrado: string | null
  situacaoLote: string
  cib: string | null
  zoneamento: string | null
  zoneamentoDescricao: string | null
  perimetros: {
    requalificaCentro: RelacaoPerimetro
    aiuSetorCentral: RelacaoPerimetro
  }
  patrimonio: { protegido: boolean; registro: RegistroTombamento | null }
  score: number
  scoreComponentes: ComponenteScore[]
  confidence: number
  confidenceItens: ItemConfianca[]
  estimativas: { custoObra: EstimativaCusto | null; tetoSubvencao: TetoSubvencao | null }
  motivos: string[]
  riscos: string[]
  proveniencia: Record<string, Proveniencia | null>
  fontes: Fonte[]
  coletadoEm: string
  ultimaVerificacao: string
  regrasAplicadas: string[]
}

export interface OportunidadeIndex {
  id: string
  slug: string
  nome: string
  sql: string
  distrito: string | null
  lat: number
  lng: number
  areaConstruida: number
  areaTerreno: number
  usoCadastrado: string | null
  zoneamento: string | null
  score: number
  confidence: number
  requalificaCentro: string
  aiuSetorCentral: string
  protegido: boolean
  motivoPrincipal: string | null
  custoEstimadoMilhoes: number | null
  ultimaVerificacao: string
}
