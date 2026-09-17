import { notFound } from 'next/navigation'
import oportunidades from '../../../data/oportunidades.json'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, Calculator, MapPin, Building, AlertTriangle, ShieldCheck, CheckCircle, Database } from 'lucide-react'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return oportunidades.map((op) => ({
    slug: op.id,
  }))
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const op = oportunidades.find(o => o.id === params.slug)
  if (!op) return {}

  const title = `Retrofit: ${op.nome || op.endereco} | Radar SP`
  const description = `Imóvel real cadastrado sob SQL ${op.sql} em ${op.regiao}. Análise de viabilidade para subvenção econômica de retrofit.`

  return { title, description }
}

export default function OportunidadeDossier({ params }: { params: { slug: string } }) {
  const op = oportunidades.find(o => o.id === params.slug)

  if (!op) {
    notFound()
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: `Oportunidade de Retrofit: ${op.nome || op.endereco}`,
    description: op.motivo,
    datePosted: op.ultimaVerificacao,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
      streetAddress: op.endereco
    },
    identifier: op.sql
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
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 border border-green-200 text-sm font-bold rounded-full mb-4">
              <CheckCircle size={14} /> Imóvel Real Verificado
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{op.nome || op.endereco}</h1>
            <p className="text-slate-600 font-medium text-lg mb-2">{op.endereco}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin size={16}/> {op.regiao}, São Paulo - SP</span>
              <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">SQL: {op.sql}</span>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[200px] text-center">
             <div className="text-sm font-semibold text-slate-500 mb-1">Opportunity Score</div>
             <div className="text-5xl font-extrabold text-blue-600">{op.score}<span className="text-xl text-slate-400">/100</span></div>
             <div className="text-xs text-slate-500 mt-2 font-semibold">Data Confidence: {op.confidence}%</div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 grid md:grid-cols-2 gap-12">
          {/* Coluna Esquerda: Dados Físicos e Perímetros (Fatos) */}
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Building size={20} className="text-blue-600"/> Dados Cadastrais</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">DADO OFICIAL</span>
              </div>
              <dl className="grid grid-cols-2 gap-y-6 gap-x-6 text-sm">
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <dt className="text-slate-500 text-xs uppercase font-semibold mb-1">Área Construída</dt>
                  <dd className="font-bold text-slate-900 text-lg">{op.area.toLocaleString('pt-BR')} m²</dd>
                  <dd className="text-[10px] text-slate-400 mt-1">Fonte: {op.fontes.area}</dd>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <dt className="text-slate-500 text-xs uppercase font-semibold mb-1">Zoneamento</dt>
                  <dd className="font-bold text-slate-900 text-lg">{op.zoneamento}</dd>
                  <dd className="text-[10px] text-slate-400 mt-1">Fonte: {op.fontes.zoneamento}</dd>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <dt className="text-slate-500 text-xs uppercase font-semibold mb-1">Uso Registrado</dt>
                  <dd className="font-bold text-slate-900">{op.usoConhecido}</dd>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-100">
                  <dt className="text-slate-500 text-xs uppercase font-semibold mb-1">Idade Aprox.</dt>
                  <dd className="font-bold text-slate-900">{op.idade} anos</dd>
                </div>
              </dl>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><ShieldCheck size={20} className="text-blue-600"/> Qualificação Regulatória</h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded">DADO OFICIAL</span>
              </div>
              <div className="space-y-4">
                <div className="border border-slate-200 p-4 rounded-lg">
                  <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Perímetros Oficiais de Incentivo</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {op.perimetros?.map((per, idx) => (
                      <span key={idx} className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1.5 rounded">{per}</span>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400">Fonte: {op.fontes.perimetros}</div>
                </div>
                <div className="border border-slate-200 p-4 rounded-lg">
                  <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Status de Patrimônio Histórico</div>
                  <div className={`text-sm font-bold px-3 py-2 rounded inline-block ${op.protecao === 'Nenhuma' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {op.protecao}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2">Fonte: {op.fontes.protecao}</div>
                </div>
              </div>
            </section>
          </div>

          {/* Coluna Direita: Financeiro e Riscos (Estimativas) */}
          <div className="space-y-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <section>
               <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Calculator size={20} className="text-purple-600"/> Projeção Financeira</h3>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded">ESTIMATIVA DO RADAR</span>
              </div>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Custo Indicativo de Obra (Retrofit)</div>
                  <div className="text-2xl font-bold text-slate-900">Aprox. {formatCurrency(op.financeiro?.estimativaCustoObra || 0)}</div>
                  <div className="text-[10px] text-slate-500 mt-2 p-2 bg-slate-50 rounded"><strong>Metodologia paramétrica:</strong> {op.financeiro?.metodologiaCusto}</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-purple-500"></div>
                  <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">Teto Teórico de Incentivo (Máx 25%)</div>
                  <div className="text-2xl font-bold text-purple-700">Até {formatCurrency(op.financeiro?.potencialMaximoSubvencao || 0)}</div>
                  <div className="text-[10px] font-semibold text-purple-900 mt-1 uppercase">* SUJEITO ÀS REGRAS DO EDITAL E APROVAÇÃO OFICIAL *</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Motivo e Riscos */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Por que entrou no Radar?</h3>
            <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded">ANÁLISE DO RADAR</span>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">{op.motivo}</p>

          <h4 className="font-bold mt-8 mb-4 text-blue-400">Próximos Passos Recomendados</h4>
          <ul className="space-y-3">
             {op.proximosPassos?.map((passo, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center shrink-0 text-xs">{idx + 1}</div>
                  {passo}
                </li>
             ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl flex flex-col">
          <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center gap-2"><AlertTriangle size={24}/> Matriz de Riscos</h3>
          <ul className="space-y-3 flex-grow">
            {op.riscos?.map((risco, idx) => (
              <li key={idx} className="flex gap-3 text-sm font-medium text-amber-900 bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
                • {risco}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Fontes Track Record */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4"><Database size={16}/> Proveniência dos Dados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-600">
          <div><strong>Endereço:</strong> {op.fontes.endereco}</div>
          <div><strong>SQL Cadastral:</strong> {op.fontes.sql}</div>
          <div><strong>Área / Geo:</strong> {op.fontes.area}</div>
          <div><strong>Última Verificação:</strong> {new Date(op.ultimaVerificacao).toLocaleString('pt-BR')}</div>
        </div>
      </div>
    </div>
  )
}
