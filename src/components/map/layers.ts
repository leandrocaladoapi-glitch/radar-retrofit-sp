/*
 * Camadas do mapa.
 *
 * Conceito: as camadas controlam o que é EXIBIDO e como; os filtros controlam
 * o que entra no recorte analítico. Nada é inventado: quando a geometria
 * oficial não está disponível, a camada de perímetro trabalha em modo
 * "destaque" (marca os imóveis classificados como dentro do perímetro pela
 * análise geométrica do ETL), sem desenhar nenhum polígono.
 */

import type { FeatureCollection } from 'geojson'

export interface Camadas {
  imoveis: boolean
  prioritarias: boolean
  protegidos: boolean
  requalificaCentro: boolean
  aiuSetorCentral: boolean
  distritos: boolean
}

export const CAMADAS_PADRAO: Camadas = {
  imoveis: true,
  prioritarias: true,
  protegidos: true,
  requalificaCentro: true,
  aiuSetorCentral: false,
  distritos: false,
}

export interface CamadaGeometria {
  id: string
  nome: string
  descricao: string
  fonte: string
  data: FeatureCollection
}

export interface PerimetrosGeo {
  requalifica?: CamadaGeometria
  aiu?: CamadaGeometria
  distritos?: CamadaGeometria
}

export const PERIMETROS_URL = '/data/perimetros.json'

export const CAMADAS_INFO = {
  requalificaCentro: {
    rotulo: 'Requalifica Centro',
    descricao:
      'Lei nº 17.577/2021 — perímetro central e setores acrescidos. Sem geometria oficial carregada, destaca os imóveis classificados como dentro do perímetro pelo ETL.',
  },
  aiuSetorCentral: {
    rotulo: 'AIU Setor Central',
    descricao:
      'Área de Intervenção Urbana do Setor Central. Sem geometria oficial carregada, destaca os imóveis classificados como dentro da AIU pelo ETL.',
  },
  distritos: {
    rotulo: 'Limites distritais',
    descricao: 'Divisas dos distritos municipais publicadas pelo GeoSampa (área de interesse central).',
  },
} as const
