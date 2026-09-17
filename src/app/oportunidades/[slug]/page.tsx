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
    DADO_OFICIAL: 'tag-oficial',
    DADO_CALCULADO: 'tag-calculado',
    ESTIMATIVA_RADAR: 'tag-estimativa',
    ANALISE_RADAR: 'tag-analise',
  }
  const label: Record<string, string> = {
    DADO_OFICIAL: 'DADO OFICIAL',
    DADO_CALCULADO: 'DADO CALCULADO',
    ESTIMATIVA_RADAR: 'ESTIMATIVA DO RADAR',
    ANALISE_RADAR: 'ANÁLISE DO RADAR',
  }
  return (
    <span className={`tag ${map[kind]}`}>
      {label[kind]}
    </span>
  )
}

function Campo({ rotulo, valor, prov }: { rotulo: string; valor: React.ReactNode; prov?: Proveniencia | null }) {
  return (
    <div>
      <dt className="text-fg-subtle">{rotulo}</dt>
      <dd className="font-semibold text-fg">{valor ?? '—'}</dd>
      {prov && (
        <dd className="mt-1 space-y-0.5">
          <Tag kind={prov.tipo} />
          <div className="text-[11px] leading-snug text-fg-subtle">Fonte: {prov.fonte}</div>
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
    <div className="page-shell mx-auto max-w-5xl space-y-8 pb-12">
      <Script id={`json-ld-opportunity-${op.id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/oportunidades" className="inline-flex min-h-tap items-center gap-2 text-sm font-medium text-accent hover:underline">
          <ArrowLeft size={16} aria-hidden /> Voltar ao Radar
        </Link>
        <div className="flex items-center gap-2 text-xs text-fg-subtle">
          <Clock size={14} aria-hidden /> Última verificação:{' '}
          {verificacao.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="card p-6 shadow-sm md:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="mb-4 inline-block rounded-full bg-success-muted px-3 py-1 text-sm font-bold text-success-fg">
              Imóvel real — cadastro municipal verificado
            </div>
            <h1 className="mb-2 font-display text-3xl font-semibold text-fg">{op.nome}</h1>
            <p className="flex items-center gap-2 text-fg-muted">
              <MapPin size={16} aria-hidden /> {op.distrito}, São Paulo — SP
            </p>
            <p className="mt-2 font-mono text-sm text-fg">SQL {op.sql}</p>
            {op.cib && <p className="font-mono text-xs text-fg-muted">CIB {op.cib}</p>}
          </div>
          <div className="min-w-[200px] rounded-xl border border-line bg-muted p-6 text-center">
            <div className="mb-1 text-sm font-semibold text-fg-muted">Opportunity Score</div>
            <div className="kpi-value text-5xl text-accent">
              {op.score}
              <span className="text-xl font-normal text-fg-subtle">/100</span>
            </div>
            <div className="mt-1"><Tag kind="ANALISE_RADAR" /></div>
            <div className="mt-3 text-xs text-fg-subtle">Data Confidence: <strong className="text-fg">{op.confidence}%</strong></div>
          </div>
        </div>

        <div className="mt-8 grid gap-12 border-t border-line pt-8 md:grid-cols-2">
          <div className="space-y-8">
            <section>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-fg">
                <Building size={20} className="text-fg-subtle" aria-hidden /> Dados Cadastrais Oficiais
              </h3>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
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
              <p className="mt-4 text-xs text-fg-subtle">
                Número de pavimentos e ano de construção não constam da camada pública utilizada e, por isso, não são
                exibidos — o Radar não estima esses campos.
              </p>
            </section>

            <section>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-fg">
                <ShieldCheck size={20} className="text-fg-subtle" aria-hidden /> Qualificação Regulatória
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="mb-1 text-fg-subtle">Requalifica Centro (perímetro oficial)</div>
                  <div className="font-semibold text-fg">
                    {op.perimetros.requalificaCentro.relacao.toUpperCase()}
                    {op.perimetros.requalificaCentro.perimetro ? ` — ${op.perimetros.requalificaCentro.perimetro.trim()}` : ''}
                  </div>
                  <Tag kind="DADO_CALCULADO" />
                  <div className="text-[11px] text-fg-subtle">
                    Cruzamento geométrico com a camada oficial. {op.perimetros.requalificaCentro.lei || ''}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-fg-subtle">AIU Setor Central (perímetro oficial)</div>
                  <div className="font-semibold text-fg">
                    {op.perimetros.aiuSetorCentral.relacao.toUpperCase()}
                    {op.perimetros.aiuSetorCentral.perimetro ? ` — ${op.perimetros.aiuSetorCentral.perimetro}` : ''}
                  </div>
                  <Tag kind="DADO_CALCULADO" />
                  <div className="text-[11px] text-fg-subtle">Cruzamento geométrico com a camada oficial.</div>
                </div>
                <div>
                  <div className="mb-1 text-fg-subtle">Situação de patrimônio</div>
                  <div
                    className={`inline-block rounded border px-3 py-2 text-sm font-semibold ${
                      op.patrimonio.protegido
                        ? 'border-warning/30 bg-warning-muted text-warning-fg'
                        : 'border-line bg-muted text-fg'
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
                    <div className="mt-1 text-[11px] text-fg-subtle">
                      {op.patrimonio.registro.area}
                      {op.patrimonio.registro.zepec ? ` • ${op.patrimonio.registro.zepec}` : ''}
                      {op.patrimonio.registro.resolucaoConpresp && op.patrimonio.registro.resolucaoConpresp !== 'não consta'
                        ? ` • CONPRESP ${op.patrimonio.registro.resolucaoConpresp}`
                        : ''}
                    </div>
                  )}
                  {!op.patrimonio.protegido && (
                    <p className="mt-1 text-[11px] text-fg-subtle">
                      Ausência de proteção não significa ausência de valor arquitetônico: o imóvel não é tratado como
                      &quot;histórico&quot; no sentido regulatório.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8 rounded-xl border border-line bg-muted p-6">
            <section>
              <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-fg">
                <Calculator size={20} className="text-accent" aria-hidden /> Estimativas do Radar
              </h3>
              <p className="mb-4 text-xs text-fg-subtle">
                Os números abaixo <strong>não são dados da Prefeitura</strong>. São cálculos paramétricos do Radar, com
                metodologia aberta.
              </p>
              <div className="space-y-4">
                {custo && (
                  <div className="card border-warning/40 p-4 shadow-sm">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">Custo indicativo de retrofit</div>
                    <div className="kpi-value text-2xl">{custo.textoValor}</div>
                    <div className="mt-1"><Tag kind="ESTIMATIVA_RADAR" /></div>
                    <ul className="mt-2 space-y-0.5 text-[11px] text-fg-muted">
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
                  <div className="card border-accent/40 p-4 shadow-sm">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent">
                      Teto teórico preliminar de subvenção ({subv.percentual})
                    </div>
                    <div className="kpi-value text-2xl text-accent">{subv.textoValor}</div>
                    <div className="mt-1"><Tag kind="ESTIMATIVA_RADAR" /></div>
                    <p className="mt-2 text-[11px] text-fg-muted">{subv.aviso}</p>
                    <p className="mt-1 text-[11px] text-fg-subtle">{subv.formula} — {subv.base}</p>
                  </div>
                )}
                <div className="card p-4 shadow-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-fg-subtle">VGV potencial</div>
                  <p className="text-sm text-fg-muted">
                    Não exibido. O Radar não dispõe de preço/m² de venda auditável por endereço nem de área vendável
                    confirmada para este imóvel — melhor não publicar número do que produzir falsa precisão.
                  </p>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-fg">Incentivos potencialmente aplicáveis:</div>
                  <ul className="space-y-1">
                    {['Subvenção econômica — até 25%, sujeita a chamamento e análise oficial', 'Isenções fiscais previstas no Requalifica Centro (Lei 17.577/2021), conforme enquadramento', 'Parâmetros urbanísticos específicos da AIU Setor Central, quando aplicável'].map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-fg-muted">
                        <CheckCircle size={14} className="mt-1 shrink-0 text-success" aria-hidden /> {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-fg-subtle">
                    Enquadramento sujeito às regras do edital vigente e à análise da Prefeitura. Nada aqui constitui
                    direito adquirido.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-[#0c4d86] p-8 text-white">
          <h3 className="mb-4 text-xl font-bold">Por que entrou no Radar?</h3>
          <ul className="space-y-3">
            {op.motivos.map((m: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-white/80">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/80">{i + 1}</div>
                {m}
              </li>
            ))}
          </ul>

          <h4 className="mb-4 mt-8 font-bold text-[#8cc8ea]">Composição do Opportunity Score</h4>
          <ul className="space-y-2">
            {op.scoreComponentes.map((c: ComponenteScore, i: number) => (
              <li key={i} className="text-sm text-white/80">
                <span className="font-semibold">{c.nome}: {c.pontos}/{c.max}</span>
                <span className="block text-xs text-[#8cc8ea]">{c.justificativa}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-warning/30 bg-warning-muted p-8">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-warning-fg">
            <AlertTriangle size={24} aria-hidden /> Matriz de Riscos
          </h3>
          <ul className="space-y-3">
            {op.riscos.map((r: string, i: number) => (
              <li key={i} className="rounded border border-warning/20 bg-surface p-3 text-sm text-warning-fg">• {r}</li>
            ))}
          </ul>
          <div className="mt-8 rounded-lg bg-warning/10 p-4 text-xs text-warning-fg/80">
            <strong>Atenção:</strong> os dados cadastrais desta página vêm de bases oficiais; as projeções financeiras
            são estimativas paramétricas do Radar. Nada substitui estudo de viabilidade (EVTE), vistoria técnica e
            consulta oficial aos órgãos competentes.
          </div>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-fg">
          <FileText size={20} className="text-fg-subtle" aria-hidden /> Data Confidence: {op.confidence}%
        </h3>
        <p className="mb-4 text-xs text-fg-subtle">
          Requisitos eliminatórios (endereço real, identificação cadastral oficial e fonte oficial) foram atendidos;
          o índice abaixo detalha a completude documental. Publicação exige no mínimo 70%.
        </p>
        <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {op.confidenceItens.map((i: ItemConfianca, idx: number) => (
            <li key={idx} className={i.ok ? 'text-fg' : 'text-fg-subtle'}>
              {i.ok ? '✓' : '—'} {i.nome} <span className="text-xs text-fg-subtle">({i.peso} pts)</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-6 md:p-8">
        <h3 className="mb-4 text-lg font-bold text-fg">Fontes desta oportunidade</h3>
        <ul className="space-y-3">
          {op.fontes.map((f: Fonte, i: number) => (
            <li key={i} className="text-sm">
              <a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                {f.nome} <ExternalLink size={12} aria-hidden />
              </a>
              <div className="text-xs text-fg-subtle">{f.orgao}</div>
              {f.consulta && (
                <a href={f.consulta} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-fg-subtle hover:underline">
                  Consulta WFS reprodutível deste lote
                </a>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-1 border-t border-line pt-6 text-xs text-fg-subtle">
          <div className="font-semibold text-fg">Metodologia</div>
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
