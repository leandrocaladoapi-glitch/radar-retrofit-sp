import { ExternalLink } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function FontesPage() {
  const fontes = [
    {
      nome: 'Portal da Subvenção Econômica',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://subvencao.prefeitura.sp.gov.br',
      desc: 'Editais, anexos, lista de credenciados e relatórios oficiais.',
    },
    {
      nome: 'GeoSampa — Cadastro Imobiliário Fiscal (camada Lote)',
      instituicao: 'Prefeitura de São Paulo / Secretaria Municipal da Fazenda (via PRODAM)',
      link: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/62c1113c-36a4-43d1-b763-81ec63b58116',
      desc: 'Origem do SQL, endereço cadastral, área construída, área de terreno, uso e situação do lote. Consumida via WFS oficial (geoportal:lote_cidadao).',
    },
    {
      nome: 'GeoSampa — Requalifica Centro (Perímetro Área Central)',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-17577-de-20-de-julho-de-2021',
      desc: 'Polígonos oficiais do programa (Lei 17.577/2021 e Lei 18.081/2023). O Radar cruza a geometria do lote com esses polígonos.',
    },
    {
      nome: 'GeoSampa — AIU Setor Central',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://gestaourbana.prefeitura.sp.gov.br/',
      desc: 'Perímetros da Área de Intervenção Urbana do Setor Central, usados por cruzamento geométrico (geoportal:perimetro_aiu).',
    },
    {
      nome: 'GeoSampa — Zoneamento vigente (LPUOS)',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-18177-de-25-de-julho-de-2024',
      desc: 'Zona de uso de cada imóvel conforme a Lei nº 18.177/2024 (geoportal:perimetro_zona_lei_18177_24).',
    },
    {
      nome: 'GeoSampa — Bem Tombado e/ou em Processo de Tombamento',
      instituicao: 'CONPRESP / CONDEPHAAT / IPHAN — consolidado por DPH-SMC',
      link: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/f3522ff3-df73-4fc4-bff7-0344945f02f8',
      desc: 'Situação de proteção patrimonial, nível de tombamento, ZEPEC e resoluções aplicáveis.',
    },
    {
      nome: 'Diário Oficial da Cidade (DOC)',
      instituicao: 'Prefeitura de São Paulo',
      link: 'https://diariooficial.prefeitura.sp.gov.br',
      desc: 'Publicações de credenciamentos, resultados de análises e termos de outorga.',
    },
    {
      nome: 'Legislação Municipal',
      instituicao: 'Câmara Municipal / Prefeitura',
      link: 'https://legislacao.prefeitura.sp.gov.br',
      desc: 'Lei 17.844/2022, Decreto 62.878/2023 e normativas associadas ao Requalifica Centro e Subvenção.',
    },
  ]

  return (
    <div className="page-shell page-shell-narrow max-w-3xl space-y-6">
      <PageHeader
        title="Fontes de Dados"
        description="Todas as informações estruturadas pelo Radar são originadas destas fontes oficiais."
      />

      <ol className="space-y-4">
        {fontes.map((fonte, idx) => (
          <li key={idx} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-1 font-mono text-[11px] tabular text-fg-subtle">{String(idx + 1).padStart(2, '0')}</div>
                <h2 className="text-lg font-semibold text-fg">{fonte.nome}</h2>
                <span className="text-sm font-medium text-accent">{fonte.instituicao}</span>
              </div>
              <a
                href={fonte.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-fg-subtle transition duration-180 hover:bg-muted hover:text-accent"
                aria-label={`Abrir ${fonte.nome}`}
              >
                <ExternalLink size={20} />
              </a>
            </div>
            <p className="mt-3 text-sm text-fg-muted">{fonte.desc}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
