import { notFound } from 'next/navigation'
import oportunidades from '../../../data/oportunidades.json'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, Calculator, MapPin, Building, AlertTriangle, ShieldCheck, CheckCircle, ExternalLink, FileText, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import type { Oportunidade, TipoDado, Proveniencia, ComponenteScore, ItemConfianca, FatorCusto, Fonte } from '../../../lib/types'

const OPS = oportunidades as unknown as Oportunidade[]

export function generateStaticParams() {
  return OPS.map((op) => ({ slug: op.slug }))
}

function fmt(n: number) {
  return (n || 0).toLocaleString('pt-BR')
}

function Tag({ kind }: { kind: TipoDado }) {
  const map: Record<string, string> = {
    DADO_OFICIAL: 'bg-green-50 text-green-700 border-green-200',
    DADO_CALCULADO: 'bg-sky-50 text-sky-700 border-sky-200',
    ESTIMATIVA_RADAR: 'bg-amber-50 text-amber-800 border-amber-200',
    ANALISE_RADAR: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  const label: Record<string, string> = {
    DADO_OFICIAL: 'DADO OFICIAL',
    DADO_CALCULADO: 'DADO CALCULADO',
    ESTIMATIVA_RADAR: 'ESTIMATIVA DO RADAR',
    ANALISE_RADAR: 'ANÁLISE DO RADAR',
  }
  return (
    <span className={`inline-block text-[10px] font-bold tracking-wide px-1.5 py-0.5 rounded border ${map[kind]}`}>
      {label[kind]}
    </span>
  )
}

function Campo({ rotulo, valor, prov }: { rotulo: string; valor: React.ReactNode; prov?: Proveniencia | null }) {
  return (
    <div>
      <dt className="text-slate-500">{rotulo}</dt>
      <dd className="font-semibold text-slate-900">{valor ?? '—'}</dd>
      {prov && (
        <dd className="mt-1 space-y-0.5">
          <Tag kind={prov.tipo} />
          <div className="text-[11px] text-slate-500 leading-snug">Fonte: {prov.fonte}</div>
        </dd>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const op = OPS.find((o) => o.slug === params.slug)
  if (!op) return {}
  const title = `Oportunidade de Retrofit — ${op.logradouro}, ${op.numero}, ${op.distrito} | Radar Retrofit SP`
  const description = `Imóvel real na área central de São Paulo. SQL ${op.sql}, ${fmt(op.areaConstruida)} m² de área construída (Cadastro Imobiliário Fiscal / GeoSampa), zoneamento ${op.zoneamento || 'não identificado'}. Opportunity Score ${op.score}/100, Data Confidence ${op.confidence}%.`
  return {
    title,
    description,
    alternates: { canonical: `/oportunidades/${op.slug}` },
    openGraph: { title, description, type: 'article' },
    twitter: { card: 'summary', title, description },
  }
}

export default function OportunidadeDossier({ params }: { params: { slug: string } }) {
  const op = OPS.find((o) => o.slug === params.slug)
  if (!op) notFound()

  const p = op.proveniencia
  const verificacao = new Date(op.ultimaVerificacao)
  const custo = op.estimativas?.custoObra
  const subv = op.estimativas?.tetoSubvencao

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: op.nome,
    identifier: `SQL ${op.sql}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${op.logradouro}, ${op.numero}`,
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
      addressCountry: 'BR',
    },
    geo: { '@type': 'GeoCoordinates', latitude: op.lat, longitude: op.lng },
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Área construída (cadastro oficial)', value: op.areaConstruida, unitCode: 'MTK' },
      { '@type': 'PropertyValue', name: 'Uso cadastrado', value: op.usoCadastrado },
      { '@type': 'PropertyValue', name: 'Zoneamento', value: op.zoneamento },
    ],
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <Script id={`json-ld-opportunity-${op.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex justify-between items-center">
        <Link href="/oportunidades" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 text-sm font-medium">
          <ArrowLeft size={16} /> Voltar ao Radar
        </Link>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Clock size={14} /> Última verificação:{' '}
          {verificacao.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full mb-4">
              Imóvel real — cadastro municipal verificado
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{op.nome}</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <MapPin size={16} /> {op.distrito}, São Paulo — SP
            </p>
            <p className="text-slate-700 font-mono text-sm mt-2">SQL {op.sql}</p>
            {op.cib && <p className="text-slate-500 font-mono text-xs">CIB {op.cib}</p>}
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[200px] text-center">
            <div className="text-sm font-semibold text-slate-500 mb-1">Opportunity Score</div>
            <div className="text-5xl font-extrabold text-blue-600">
              {op.score}
              <span className="text-xl text-slate-400">/100</span>
            </div>
            <div className="mt-1"><Tag kind="ANALISE_RADAR" /></div>
            <div className="text-xs text-slate-500 mt-3">Data Confidence: <strong>{op.confidence}%</strong></div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building size={20} className="text-slate-400" /> Dados Cadastrais Oficiais
              </h3>
              <dl className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm">
                <Campo rotulo="Endereço" valor={`${op.logradouro}, ${op.numero}`} prov={p.endereco} />
                <Campo rotulo="SQL (cadastro fiscal)" valor={op.sql} prov={p.sql} />
                <Campo rotulo="Área construída" valor={`${fmt(op.areaConstruida)} m²`} prov={p.areaConstruida} />
                <Campo rotulo="Área do terreno" valor={`${fmt(op.areaTerreno)} m²`} prov={p.areaTerreno} />
                <Campo rotulo="Uso cadastrado" valor={op.usoCadastrado} prov={p.usoCadastrado} />
                <Campo rotulo="Zoneamento" valor={op.zoneamento ? `${op.zoneamento} — ${op.zoneamentoDescricao}` : null} prov={p.zoneamento} />
                <Campo rotulo="Distrito" valor={op.distrito} prov={p.distrito} />
                <Campo rotulo="Coordenadas" valor={`${op.lat.toFixed(6)}, ${op.lng.toFixed(6)}`} prov={p.coordenadas} />
                <Campo rotulo="Situação cadastral do lote" valor={op.situacaoLote} prov={p.sql} />
                {op.complementoCadastral && <Campo rotulo="Complemento cadastral" valor={op.complementoCadastral} prov={p.endereco} />}
              </dl>
              <p className="text-xs text-slate-500 mt-4">
                Número de pavimentos e ano de construção não constam da camada pública utilizada e, por isso, não são
                exibidos — o Radar não estima esses campos.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-slate-400" /> Qualificação Regulatória
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Requalifica Centro (perímetro oficial)</div>
                  <div className="font-semibold text-slate-900">
                    {op.perimetros.requalificaCentro.relacao.toUpperCase()}
                    {op.perimetros.requalificaCentro.perimetro ? ` — ${op.perimetros.requalificaCentro.perimetro.trim()}` : ''}
                  </div>
                  <Tag kind="DADO_CALCULADO" />
                  <div className="text-[11px] text-slate-500">
                    Cruzamento geométrico com a camada oficial. {op.perimetros.requalificaCentro.lei || ''}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">AIU Setor Central (perímetro oficial)</div>
                  <div className="font-semibold text-slate-900">
                    {op.perimetros.aiuSetorCentral.relacao.toUpperCase()}
                    {op.perimetros.aiuSetorCentral.perimetro ? ` — ${op.perimetros.aiuSetorCentral.perimetro}` : ''}
                  </div>
                  <Tag kind="DADO_CALCULADO" />
                  <div className="text-[11px] text-slate-500">Cruzamento geométrico com a camada oficial.</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Situação de patrimônio</div>
                  <div
                    className={`text-sm font-semibold px-3 py-2 rounded border inline-block ${
                      op.patrimonio.protegido ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {op.patrimonio.protegido
                      ? `Protegido — ${op.patrimonio.registro?.situacao}${op.patrimonio.registro?.nivel ? `, nível ${op.patrimonio.registro.nivel}` : ''}`
                      : op.patrimonio.registro
                      ? 'Relação espacial com área de tombamento / envoltória'
                      : 'Nenhuma proteção patrimonial identificada na base oficial'}
                  </div>
                  <div className="mt-1"><Tag kind="DADO_OFICIAL" /></div>
                  {op.patrimonio.registro?.area && (
                    <div className="text-[11px] text-slate-500 mt-1">
                      {op.patrimonio.registro.area}
                      {op.patrimonio.registro.zepec ? ` • ${op.patrimonio.registro.zepec}` : ''}
                      {op.patrimonio.registro.resolucaoConpresp && op.patrimonio.registro.resolucaoConpresp !== 'não consta'
                        ? ` • CONPRESP ${op.patrimonio.registro.resolucaoConpresp}`
                        : ''}
                    </div>
                  )}
                  {!op.patrimonio.protegido && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ausência de proteção não significa ausência de valor arquitetônico: o imóvel não é tratado como
                      &quot;histórico&quot; no sentido regulatório.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <section>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Calculator size={20} className="text-blue-600" /> Estimativas do Radar
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Os números abaixo <strong>não são dados da Prefeitura</strong>. São cálculos paramétricos do Radar, com
                metodologia aberta.
              </p>
              <div className="space-y-4">
                {custo && (
                  <div className="bg-white p-4 rounded-lg border border-amber-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Custo indicativo de retrofit</div>
                    <div className="text-2xl font-bold text-slate-900">{custo.textoValor}</div>
                    <div className="mt-1"><Tag kind="ESTIMATIVA_RADAR" /></div>
                    <ul className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                      <li>Área considerada: {fmt(custo.areaConsiderada)} m² (cadastro oficial)</li>
                      <li>Custo paramétrico: R$ {fmt(custo.custoM2)}/m² — data-base {custo.dataBase}</li>
                      <li>Multiplicador de complexidade: {custo.multiplicadorTotal}×</li>
                      {custo.fatores.map((f: FatorCusto, i: number) => (
                        <li key={i}>• {f.nome}: ×{f.fator}</li>
                      ))}
                      <li>Fórmula: {custo.formula}</li>
                    </ul>
                  </div>
                )}
                {subv && (
                  <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
                    <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                      Teto teórico preliminar de subvenção ({subv.percentual})
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{subv.textoValor}</div>
                    <div className="mt-1"><Tag kind="ESTIMATIVA_RADAR" /></div>
                    <p className="text-[11px] text-slate-600 mt-2">{subv.aviso}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{subv.formula} — {subv.base}</p>
                  </div>
                )}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">VGV potencial</div>
                  <p className="text-sm text-slate-600">
                    Não exibido. O Radar não dispõe de preço/m² de venda auditável por endereço nem de área vendável
                    confirmada para este imóvel — melhor não publicar número do que produzir falsa precisão.
                  </p>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 mb-2">Incentivos potencialmente aplicáveis:</div>
                  <ul className="space-y-1">
                    {['Subvenção econômica — até 25%, sujeita a chamamento e análise oficial', 'Isenções fiscais previstas no Requalifica Centro (Lei 17.577/2021), conforme enquadramento', 'Parâmetros urbanísticos específicos da AIU Setor Central, quando aplicável'].map((t, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-500 mt-1 shrink-0" /> {t}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Enquadramento sujeito às regras do edital vigente e à análise da Prefeitura. Nada aqui constitui
                    direito adquirido.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-900 text-white p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4">Por que entrou no Radar?</h3>
          <ul className="space-y-3">
            {op.motivos.map((m: string, i: number) => (
              <li key={i} className="text-blue-100 text-sm leading-relaxed flex gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-800 text-blue-300 flex items-center justify-center shrink-0 text-xs">{i + 1}</div>
                {m}
              </li>
            ))}
          </ul>

          <h4 className="font-bold mt-8 mb-4 text-blue-300">Composição do Opportunity Score</h4>
          <ul className="space-y-2">
            {op.scoreComponentes.map((c: ComponenteScore, i: number) => (
              <li key={i} className="text-sm text-blue-100">
                <span className="font-semibold">{c.nome}: {c.pontos}/{c.max}</span>
                <span className="block text-blue-300 text-xs">{c.justificativa}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-4 text-amber-900 flex items-center gap-2">
            <AlertTriangle size={24} /> Matriz de Riscos
          </h3>
          <ul className="space-y-3">
            {op.riscos.map((r: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-amber-800 bg-white p-3 rounded border border-amber-100">• {r}</li>
            ))}
          </ul>
          <div className="mt-8 text-xs text-amber-700/70 p-4 bg-amber-100/50 rounded-lg">
            <strong>Atenção:</strong> os dados cadastrais desta página vêm de bases oficiais; as projeções financeiras
            são estimativas paramétricas do Radar. Nada substitui estudo de viabilidade (EVTE), vistoria técnica e
            consulta oficial aos órgãos competentes.
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <FileText size={20} className="text-slate-400" /> Data Confidence: {op.confidence}%
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Requisitos eliminatórios (endereço real, identificação cadastral oficial e fonte oficial) foram atendidos;
          o índice abaixo detalha a completude documental. Publicação exige no mínimo 70%.
        </p>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {op.confidenceItens.map((i: ItemConfianca, idx: number) => (
            <li key={idx} className={i.ok ? 'text-slate-700' : 'text-slate-400'}>
              {i.ok ? '✓' : '—'} {i.nome} <span className="text-xs text-slate-400">({i.peso} pts)</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Fontes desta oportunidade</h3>
        <ul className="space-y-3">
          {op.fontes.map((f: Fonte, i: number) => (
            <li key={i} className="text-sm">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium hover:underline inline-flex items-center gap-1">
                {f.nome} <ExternalLink size={12} />
              </a>
              <div className="text-xs text-slate-500">{f.orgao}</div>
              {f.consulta && (
                <a href={f.consulta} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:underline break-all">
                  Consulta WFS reprodutível deste lote
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-1">
          <div className="font-semibold text-slate-700">Metodologia</div>
          <p>Regras de entrada aplicadas nesta coleta:</p>
          <ul className="list-disc pl-5">
            {op.regrasAplicadas.map((r: string, i: number) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="pt-2">
            Coleta em {new Date(op.coletadoEm).toLocaleString('pt-BR')} • Última verificação em{' '}
            {verificacao.toLocaleString('pt-BR')}.
          </p>
        </div>
      </div>
    </div>
  )
}
