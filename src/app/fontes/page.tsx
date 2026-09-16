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
      nome: 'GeoSampa',
      instituicao: 'Prefeitura de São Paulo',
      link: 'http://geosampa.prefeitura.sp.gov.br',
      desc: 'Zoneamento, perímetros urbanísticos (AIU, Requalifica), dados cadastrais de lotes (SQL) e tombamentos.'
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
