import type { Metadata } from 'next'
import type { MapaRaw } from '../../lib/mapa'
import raw from '../../data/mapa.json'
import MapExperience from '../../components/map/MapExperience'

export const metadata: Metadata = {
  title: 'Mapa de Oportunidades e Projetos',
  description:
    'Mapa interativo das oportunidades de retrofit no Centro de São Paulo: clusterização, filtros por perímetro incentivado, score, área, custo e subvenção teórica, além de painel de inteligência do recorte visível.',
}

export default function MapaPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mapa de Oportunidades e Projetos</h1>
        <p className="text-slate-600">
          Explore geograficamente as oportunidades identificadas na região central. Os pontos são agrupados por
          proximidade, filtrados por tipo, perímetro, patrimônio e potencial econômico, e o painel lateral resume o que
          está visível na área enquadrada.
        </p>
      </div>

      <MapExperience raw={raw as unknown as MapaRaw} />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 space-y-2">
        <p>
          <strong>Nota:</strong> As localizações são aproximadas, com base no centroide do lote do Cadastro Imobiliário
          Fiscal (GeoSampa). O enquadramento em Requalifica Centro e AIU Setor Central é verificado por geometria nas
          camadas oficiais. Oportunidade, score, custo e teto de subvenção são estimativas declaradas do Radar — não são
          valor concedido nem garantia de enquadramento.
        </p>
        <p>
          <strong>Projetos:</strong> os projetos habilitados e credenciados nos chamamentos não aparecem como pontos
          porque as listas oficiais não publicam endereço, SQL nem coordenadas do imóvel. A lista completa segue
          disponível em <a href="/projetos" className="underline decoration-slate-300 hover:text-slate-800">Projetos</a>.
        </p>
        <p className="text-xs text-slate-500">
          Base cartográfica: OpenFreeMap / OpenMapTiles / OpenStreetMap (sem chave de API). Dados territoriais: GeoSampa
          (Prefeitura de São Paulo).{' '}
          <a href="/metodologia" className="underline decoration-slate-300 hover:text-slate-800">
            Ver metodologia
          </a>
          .
        </p>
      </div>
    </div>
  )
}
