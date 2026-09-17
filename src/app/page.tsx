import Link from 'next/link'
import {
  Activity,
  Building2,
  Map,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  BarChart,
  ShieldCheck,
  Database,
  FileText,
} from 'lucide-react'
import data from '../data/subvencao.json'
import artigosData from '../data/artigos.json'
import MetricCard from '../components/ui/MetricCard'

export default function Home() {
  const { indicadores, chamamentoAtual } = data
  const recentArticles = [...artigosData]
    .sort((a, b) => new Date(b.dataPublicacao).getTime() - new Date(a.dataPublicacao).getTime())
    .slice(0, 3)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="pb-16">
      <section className="radar-hero">
        <div className="radar-grid" aria-hidden />
        <div className="radar-rings" aria-hidden />
        <div className="page-shell pb-12 pt-12 text-center md:pb-16 md:pt-20">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="chip mx-auto border-accent/20 bg-accent-muted text-accent">
              Inteligência independente LCF Consulting
            </div>
            <h1 className="font-display text-display text-fg">
              Destrave o potencial do{' '}
              <span className="text-accent">Retrofit no Centro de São Paulo</span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-fg-muted md:text-xl">
              O <b>Radar Retrofit SP</b> é uma plataforma de inteligência que mapeia oportunidades, cruza dados oficiais e analisa a viabilidade de subvenção econômica para requalificação imobiliária.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 pt-4 sm:flex-row sm:items-center">
              <Link href="/oportunidades" className="btn btn-primary btn-lg">
                Explorar oportunidades <Activity size={20} aria-hidden />
              </Link>
              <Link href="/mapa" className="btn btn-secondary btn-lg">
                Ver mapa interativo <Map size={20} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-0">
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-line bg-muted/70 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-4">
          <MetricCard
            icon={<TrendingUp size={16} />}
            label="Orçamento Disponível"
            value={formatCurrency(indicadores.orcamentoDisponivel)}
            detail={
              <span className="chip border-success/20 bg-success-muted text-success-fg">
                Até {chamamentoAtual.percentualMaximo}% por projeto
              </span>
            }
          />
          <MetricCard
            icon={<CheckCircle2 size={16} />}
            label="Recursos Concedidos"
            value={formatCurrency(indicadores.recursosConcedidos)}
            detail={<>Pagos: {formatCurrency(indicadores.recursosPagos)}</>}
          />
          <MetricCard
            icon={<Building2 size={16} />}
            label="Histórico Público"
            value={
              <>
                {indicadores.projetosConhecidos}{' '}
                <span className="text-xl font-normal text-fg-subtle">projetos</span>
              </>
            }
            detail={<>{indicadores.imoveisMonitorados} imóveis em monitoramento contínuo</>}
          />
          <MetricCard
            icon={<AlertCircle size={16} />}
            label="Radar de Oportunidades"
            value={
              <>
                {indicadores.oportunidadesIdentificadas}{' '}
                <span className="text-xl font-normal text-fg-subtle">imóveis</span>
              </>
            }
            detail="Identificados para análise preliminar"
          />
        </div>
      </section>

      <section className="page-shell">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="rule-title">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-semibold text-fg md:text-3xl">
                <FileText className="text-accent" aria-hidden /> Últimas atualizações do Radar
              </h2>
              <p className="mt-2 text-fg-muted">Monitoramento contínuo de novas oportunidades, projetos e editais.</p>
            </div>
            <Link
              href="/artigos"
              className="hidden min-h-tap items-center gap-1 text-sm font-semibold text-accent hover:underline md:inline-flex"
            >
              Ver todas análises <ChevronRight size={18} aria-hidden />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentArticles.length > 0 ? (
              recentArticles.map((art) => (
                <Link key={art.slug} href={`/artigos/${art.slug}`} className="card card-interactive flex h-full flex-col p-6 group">
                  <div className="mb-2 text-xs font-bold text-accent">{art.categoria}</div>
                  <h3 className="mb-3 line-clamp-3 text-lg font-bold text-fg transition-colors duration-180 group-hover:text-accent">
                    {art.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 flex-grow text-sm text-fg-muted">{art.descricao}</p>
                  <div className="mt-auto flex items-center gap-1.5 border-t border-line pt-4 text-xs text-fg-subtle">
                    <Clock size={12} aria-hidden /> {new Date(art.dataPublicacao).toLocaleDateString('pt-BR')}
                  </div>
                </Link>
              ))
            ) : (
              <div className="card col-span-3 p-8 text-center text-fg-muted">
                O radar está processando as primeiras análises.
              </div>
            )}
          </div>
          <div className="mt-4 text-center md:hidden">
            <Link href="/artigos" className="inline-flex min-h-tap items-center gap-1 font-semibold text-accent">
              Ver todas análises <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-fg md:text-3xl">Como o Radar funciona</h2>
            <p className="mx-auto max-w-2xl text-lg text-fg-muted">
              Nós cruzamos dezenas de fontes de dados espaciais, financeiros e regulatórios para criar um pipeline claro de investimento em Retrofit.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="card space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-accent">
                <Database size={24} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-fg">1. Agregação de Dados</h3>
              <p className="leading-relaxed text-fg-muted">
                Consolidamos Diário Oficial, GeoSampa e Portal da Subvenção em uma única base de dados estruturada e auditável.
              </p>
            </div>
            <div className="card space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-accent">
                <BarChart size={24} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-fg">2. Opportunity Score</h3>
              <p className="leading-relaxed text-fg-muted">
                Atribuímos uma nota matemática a cada imóvel com base em zoneamento, perímetros de incentivo, área e características físicas.
              </p>
            </div>
            <div className="card space-y-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-muted text-accent">
                <ShieldCheck size={24} aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-fg">3. Análise Regulamentar</h3>
              <p className="leading-relaxed text-fg-muted">
                Evidenciamos riscos jurídicos e de tombamento de antemão, separando o que é viável daquilo que é armadilha.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#121a22] p-10 text-white md:p-16">
          <div className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-accent opacity-20 blur-3xl" aria-hidden />
          <div className="relative z-10 grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold leading-tight md:text-4xl">Para quem é o Radar?</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#8cc8ea]" size={20} aria-hidden />
                  <span className="text-white/75">
                    <strong className="text-white">Incorporadoras e Construtoras:</strong> Identifique imóveis com maior potencial de enquadramento HIS/HMP.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#8cc8ea]" size={20} aria-hidden />
                  <span className="text-white/75">
                    <strong className="text-white">Fundos Imobiliários e Investidores:</strong> Acesse inteligência comercial para justificar teses de investimento com subvenção.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#8cc8ea]" size={20} aria-hidden />
                  <span className="text-white/75">
                    <strong className="text-white">Proprietários e Gestores:</strong> Descubra se o seu edifício no Centro é elegível para recursos do Requalifica.
                  </span>
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <h3 className="mb-4 text-xl font-bold">Pronto para começar?</h3>
              <p className="mb-6 text-white/60">Acesse agora as 85 oportunidades pré-analisadas pela nossa engine de dados.</p>
              <Link href="/oportunidades" className="btn btn-primary w-full">
                Acessar Pipeline <ChevronRight size={20} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell pt-0">
        <div className="callout callout-warning mx-auto max-w-5xl">
          <Clock className="mt-0.5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="mb-1 text-base font-semibold">
              Última atualização dos dados: {new Date(indicadores.ultimaAtualizacao).toLocaleDateString('pt-BR')}
            </p>
            <p>
              <b>Aviso de Transparência:</b> O Radar Retrofit é uma ferramenta <strong>independente</strong> desenvolvida pela LCF Consulting.
              Nós não somos associados à Prefeitura de São Paulo ou à SP Negócios. Os dados apresentados são estritamente
              indicativos e algorítmicos. O deferimento da subvenção econômica é de competência exclusiva do poder público municipal.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
