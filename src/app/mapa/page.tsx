import type { Metadata } from 'next'
import type { MapaRaw } from '../../lib/mapa'
import raw from '../../data/mapa.json'
import MapExperience from '../../components/map/MapExperience'
import PageHeader from '../../components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Mapa de Oportunidades e Projetos',
  description:
    'Mapa interativo das oportunidades de retrofit no Centro de São Paulo: clusterização, filtros por perímetro incentivado, score, área, custo e subvenção teórica, além de painel de inteligência do recorte visível.',
}

export default function MapaPage() {
  return (
    <div className="page-shell page-shell-wide space-y-5">
      <PageHeader
        title="Mapa de Oportunidades e Projetos"
        description="Explore geograficamente as oportunidades identificadas na região central. Os pontos são agrupados por proximidade, filtrados por tipo, perímetro, patrimônio e potencial econômico, e o painel lateral resume o que está visível na área enquadrada."
      />

      <MapExperience raw={raw as unknown as MapaRaw} />

      <div className="callout callout-neutral space-y-2 text-sm">
        <p>
          <strong>Nota:</strong> As localizações são aproximadas, com base no centroide do lote do Cadastro Imobiliário
          Fiscal (GeoSampa). O enquadramento em Requalifica Centro e AIU Setor Central é verificado por geometria nas
          camadas oficiais. Oportunidade, score, custo e teto de subvenção são estimativas declaradas do Radar — não são
          valor concedido nem garantia de enquadramento.
        </p>
        <p>
          <strong>Projetos:</strong> os projetos habilitados e credenciados nos chamamentos não aparecem como pontos
          porque as listas oficiais não publicam endereço, SQL nem coordenadas do imóvel. A lista completa segue
          disponível em <a href="/projetos" className="underline decoration-line hover:text-fg">Projetos</a>.
        </p>
        <p className="text-xs text-fg-subtle">
          Base cartográfica: OpenFreeMap / OpenMapTiles / OpenStreetMap (sem chave de API). Dados territoriais: GeoSampa
          (Prefeitura de São Paulo).{' '}
          <a href="/metodologia" className="underline decoration-line hover:text-fg">
            Ver metodologia
          </a>
          .
        </p>
      </div>
    </div>
  )
}
