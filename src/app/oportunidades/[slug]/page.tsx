import { notFound } from 'next/navigation'
import oportunidades from '../../../data/oportunidades.json'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, Download, Calculator, MapPin, Building, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return oportunidades.map((op) => ({
    slug: op.id,
  }))
}

// Dynamically generate metadata for each opportunity for Google/AI bots
export async function generateMetadata(
  { params }: { params: { slug: string } }

): Promise<Metadata> {
  const op = oportunidades.find(o => o.id === params.slug)
  if (!op) return {}

  const title = `Oportunidade de Retrofit em SP: ${op.endereco}`
  const description = `Análise de viabilidade para subvenção econômica de retrofit no Centro de São Paulo. Imóvel em ${op.regiao} com ${op.area}m² e score de viabilidade ${op.score}/100. ${op.motivo}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    }
  }
}

export default function OportunidadeDossier({ params }: { params: { slug: string } }) {
  const op = oportunidades.find(o => o.id === params.slug)

  if (!op) {
    notFound()
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  // Inject RealEstateListing Schema for AI bots to parse the financial data structuredly
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `Oportunidade de Retrofit: ${op.endereco}`,
    description: op.motivo,
    datePosted: new Date().toISOString(),
    offers: {
      '@type': 'Offer',
      price: op.financeiro?.estimativaCustoObra || 0,
      priceCurrency: 'BRL',
      description: 'Estimativa de custo de obra para retrofit'
    },
    accommodationCategory: op.usoConhecido,
    floorSize: {
      '@type': 'QuantitativeValue',
      value: op.area,
      unitCode: 'MTK' // Square meters
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
      streetAddress: op.endereco
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Script
        id={`json-ld-opportunity-${op.id}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex justify-between items-center">
        <Link href="/oportunidades" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Voltar ao Radar
        </Link>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-bold rounded-full mb-4">
              Oportunidade Indicativa
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{op.endereco}</h1>
            <p className="text-slate-500 flex items-center gap-2"><MapPin size={16}/> {op.regiao}, São Paulo - SP</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[200px] text-center">
             <div className="text-sm font-semibold text-slate-500 mb-1">Opportunity Score</div>
             <div className="text-5xl font-extrabold text-blue-600">{op.score}<span className="text-xl text-slate-400">/100</span></div>
             <div className="text-xs text-slate-500 mt-2">Confiança dos dados: {op.confidence}%</div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 grid md:grid-cols-2 gap-12">
          {/* Coluna Esquerda: Dados Físicos e Perímetros */}
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Building size={20} className="text-slate-400"/> Dados Cadastrais Estimados</h3>
              <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <dt className="text-slate-500">Área Construída</dt>
                  <dd className="font-semibold text-slate-900">{op.area} m²</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Uso Atual Conhecido</dt>
                  <dd className="font-semibold text-slate-900">{op.usoConhecido}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Idade Aproximada</dt>
                  <dd className="font-semibold text-slate-900">{op.idade} anos</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Zoneamento</dt>
                  <dd className="font-semibold text-slate-900">{op.zoneamento}</dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-slate-400"/> Qualificação Regulatória</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Perímetros Oficiais de Incentivo</div>
                  <div className="flex flex-wrap gap-2">
                    {op.perimetros?.map((per, idx) => (
                      <span key={idx} className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded border border-blue-100">{per}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Status de Patrimônio Histórico</div>
                  <div className={`text-sm font-semibold px-3 py-2 rounded border inline-block ${op.protecao === 'Nenhuma' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {op.protecao}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Coluna Direita: Financeiro e Riscos */}
          <div className="space-y-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Calculator size={20} className="text-blue-600"/> Projeção Financeira Preliminar</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Estimativa de Custo de Obra (Retrofit)</div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(op.financeiro?.estimativaCustoObra || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Teto de Subvenção Econômica (Máx 25%)</div>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(op.financeiro?.potencialMaximoSubvencao || 0)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">VGV Potencial Estimado (Pós-Obra)</div>
                  <div className="text-xl font-bold text-slate-700">{formatCurrency(op.financeiro?.vgvPotencialEstimado || 0)}</div>
                </div>
                <div>
                   <div className="text-sm font-semibold text-slate-700 mb-2">Isenções Fiscais Aplicáveis (Requalifica):</div>
                   <ul className="space-y-1">
                     {op.financeiro?.isencoesFiscais.map((isencao, idx) => (
                       <li key={idx} className="text-sm text-slate-600 flex items-center gap-2"><CheckCircle size={14} className="text-green-500"/> {isencao}</li>
                     ))}
                   </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Motivo e Riscos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-900 text-white p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4">Por que entrou no Radar?</h3>
          <p className="text-blue-100 text-lg leading-relaxed">{op.motivo}</p>

          <h4 className="font-bold mt-8 mb-4 text-blue-300">Próximos Passos Recomendados</h4>
          <ul className="space-y-3">
             {op.proximosPassos?.map((passo, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-blue-100">
                  <div className="w-5 h-5 rounded-full bg-blue-800 text-blue-300 flex items-center justify-center shrink-0 text-xs">{idx + 1}</div>
                  {passo}
                </li>
             ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center gap-2"><AlertTriangle size={24}/> Matriz de Riscos</h3>
          <ul className="space-y-3">
            {op.riscos?.map((risco, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-amber-800 bg-white p-3 rounded border border-amber-100">
                • {risco}
              </li>
            ))}
          </ul>
          <div className="mt-8 text-xs text-amber-700/70 p-4 bg-amber-100/50 rounded-lg">
            <strong>Atenção:</strong> Os dados deste dossiê são estimativas automatizadas baseadas em regras heurísticas e valores paramétricos médios do mercado paulistano. Eles não substituem, em hipótese alguma, a elaboração de um estudo de viabilidade (EVTE) por arquitetos e engenheiros, nem garantem o enquadramento no programa de subvenção da Prefeitura.
          </div>
        </div>
      </div>
    </div>
  )
}
