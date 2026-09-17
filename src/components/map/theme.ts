/*
 * Tema visual do mapa: tipologia de pontos, bases de mapa e paleta.
 *
 * Bases de mapa: OpenFreeMap (vetorial, sem chave de API — ver README).
 * Não há chave, conta ou restrição de domínio: o que remove definitivamente o
 * watermark "API KEY REQUIRED" que o provedor anterior passou a aplicar.
 */

import type { TipoRegistro } from '../../lib/mapa'

export interface TipoVisual {
  rotulo: string
  descricao: string
  cor: string
  corBorda: string
  icone: string
  tamanho: number
}

export const TIPOS: Record<TipoRegistro, TipoVisual> = {
  oportunidade: {
    rotulo: 'Oportunidade identificada',
    descricao: 'Imóvel pontuado pelo Radar (score abaixo do corte de prioridade).',
    cor: '#F0A11A',
    corBorda: '#B26A05',
    icone: 'icone-oportunidade',
    tamanho: 1,
  },
  oportunidade_prioritaria: {
    rotulo: 'Oportunidade prioritária',
    descricao: 'Oportunidade de alto score (≥ 85), sem restrição patrimonial.',
    cor: '#0E9F6E',
    corBorda: '#046C4E',
    icone: 'icone-oportunidade-prioritaria',
    tamanho: 1.2,
  },
  tombado: {
    rotulo: 'Imóvel protegido',
    descricao: 'Tombado ou em processo de tombamento (CONPRESP/CONDEPHAAT/IPHAN).',
    cor: '#7C3AED',
    corBorda: '#4C1D95',
    icone: 'icone-tombado',
    tamanho: 1.1,
  },
  tombado_prioritario: {
    rotulo: 'Protegido + prioritário',
    descricao: 'Imóvel protegido com score ≥ 85: ganho incentivado e maior complexidade de obra.',
    cor: '#B01E7A',
    corBorda: '#6C1148',
    icone: 'icone-tombado-prioritario',
    tamanho: 1.3,
  },
}

export const CORES = {
  cluster: '#0F172A',
  clusterBorda: '#FFFFFF',
  clusterBaixo: '#64748B',
  clusterMedio: '#0369A1',
  clusterAlto: '#0E9F6E',
  haloRequalifica: '#0891B2',
  haloAiu: '#4F46E5',
  perimetroRequalifica: '#0891B2',
  perimetroAiu: '#4F46E5',
  distrito: '#334155',
  selecao: '#0F172A',
  tooltipFundo: '#0F172A',
}

export type BaseId = 'claro' | 'detalhado'

export interface BaseDef {
  id: BaseId
  rotulo: string
  descricao: string
  style: string
}

/*
 * OpenFreeMap: tiles vetoriais abertos, sem chave de API, sem watermark e sem
 * conta. Uso civil para visualização; atribuição obrigatória
 * (OpenStreetMap/OpenMapTiles/OpenFreeMap) e já declarada no controle de
 * atribuição do próprio mapa.
 */
export const BASES: BaseDef[] = [
  {
    id: 'claro',
    rotulo: 'Claro',
    descricao: 'Base clara e silenciosa — melhor contraste para leitura dos dados.',
    style: 'https://tiles.openfreemap.org/styles/positron',
  },
  {
    id: 'detalhado',
    rotulo: 'Detalhado',
    descricao: 'Base com relevo, verde e detalhamento viário.',
    style: 'https://tiles.openfreemap.org/styles/liberty',
  },
]

export const BASE_PADRAO: BaseId = 'claro'

export const ATRIBUICAO =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · ' +
  '© <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">OpenMapTiles</a> · ' +
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> · ' +
  'dados públicos GeoSampa/Prefeitura de São Paulo'

/*
 * Plano B automático: se o estilo vetorial não carregar (rede corporativa,
 * bloqueio do provedor), o mapa cai para raster sem chave e continua legível.
 * Nunca usa provedor com watermark.
 */
export const ESTILO_FALLBACK = {
  version: 8 as const,
  // glifos continuam vindo do provedor aberto: são arquivos estáticos de fonte,
  // usados pelos rótulos de contagem dos clusters.
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    'raster-base': {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 16,
      attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ · dados públicos GeoSampa',
    },
    'raster-ref': {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 16,
    },
  },
  layers: [
    { id: 'raster-base-layer', type: 'raster' as const, source: 'raster-base', minzoom: 0, maxzoom: 22 },
    { id: 'raster-ref-layer', type: 'raster' as const, source: 'raster-ref', minzoom: 0, maxzoom: 22 },
  ],
}

export const CENTRO_INICIAL: [number, number] = [-23.5455, -46.6355]
export const ZOOM_INICIAL = 13.2
export const ZOOM_MAX = 18
