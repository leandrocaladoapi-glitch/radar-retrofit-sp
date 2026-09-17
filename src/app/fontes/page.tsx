import { ExternalLink } from 'lucide-react'

export default function FontesPage() {
  const fontes = [
    {
      nome: 'Portal da Subvenção Econômica',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://subvencao.prefeitura.sp.gov.br',
      desc: 'Editais, anexos, lista de credenciados e relatórios oficiais.'
    },
    {
      nome: 'GeoSampa — Cadastro Imobiliário Fiscal (camada Lote)',
      instituicao: 'Prefeitura de São Paulo / Secretaria Municipal da Fazenda (via PRODAM)',
      link: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/62c1113c-36a4-43d1-b763-81ec63b58116',
      desc: 'Origem do SQL, endereço cadastral, área construída, área de terreno, uso e situação do lote. Consumida via WFS oficial (geoportal:lote_cidadao).'
    },
    {
      nome: 'GeoSampa — Requalifica Centro (Perímetro Área Central)',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-17577-de-20-de-julho-de-2021',
      desc: 'Polígonos oficiais do programa (Lei 17.577/2021 e Lei 18.081/2023). O Radar cruza a geometria do lote com esses polígonos.'
    },
    {
      nome: 'GeoSampa — AIU Setor Central',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://gestaourbana.prefeitura.sp.gov.br/',
      desc: 'Perímetros da Área de Intervenção Urbana do Setor Central, usados por cruzamento geométrico (geoportal:perimetro_aiu).'
    },
    {
      nome: 'GeoSampa — Zoneamento vigente (LPUOS)',
      instituicao: 'Prefeitura de São Paulo / SMUL',
      link: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-18177-de-25-de-julho-de-2024',
      desc: 'Zona de uso de cada imóvel conforme a Lei nº 18.177/2024 (geoportal:perimetro_zona_lei_18177_24).'
    },
    {
      nome: 'GeoSampa — Bem Tombado e/ou em Processo de Tombamento',
      instituicao: 'CONPRESP / CONDEPHAAT / IPHAN — consolidado por DPH-SMC',
      link: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/f3522ff3-df73-4fc4-bff7-0344945f02f8',
      desc: 'Situação de proteção patrimonial, nível de tombamento, ZEPEC e resoluções aplicáveis.'
    },
    {
      nome: 'Diário Oficial da Cidade (DOC)',
      instituicao: 'Prefeitura de São Paulo',
      link: 'https://diariooficial.prefeitura.sp.gov.br',
      desc: 'Publicações de credenciamentos, resultados de análises e termos de outorga.'
    },
    {
      nome: 'Legislação Municipal',
      instituicao: 'Câmara Municipal / Prefeitura',
      link: 'https://legislacao.prefeitura.sp.gov.br',
      desc: 'Lei 17.844/2022, Decreto 62.878/2023 e normativas associadas ao Requalifica Centro e Subvenção.'
    }
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Fontes de Dados</h1>
      <p className="text-slate-600 mb-6">Todas as informações estruturadas pelo Radar são originadas destas fontes oficiais.</p>

      <div className="space-y-4">
        {fontes.map((fonte, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{fonte.nome}</h2>
                <span className="text-sm text-blue-600 font-medium">{fonte.instituicao}</span>
              </div>
              <a href={fonte.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition">
                <ExternalLink size={20} />
              </a>
            </div>
            <p className="text-slate-700 mt-3 text-sm">{fonte.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
