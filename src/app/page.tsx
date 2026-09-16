import Link from 'next/link'
import { Activity, Building2, Map, TrendingUp, AlertCircle, Clock, CheckCircle2, ChevronRight, BarChart, ShieldCheck, Database } from 'lucide-react'
import data from '../data/subvencao.json'

export default function Home() {
  const { indicadores, chamamentoAtual } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="text-center max-w-5xl mx-auto space-y-6 pt-16">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-2 border border-blue-100">
          Inteligência independente LCF Consulting
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Destrave o potencial do <span className="text-blue-600">Retrofit no Centro de São Paulo</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
          O <b>Radar Retrofit SP</b> é uma plataforma de inteligência que mapeia oportunidades, cruza dados oficiais e analisa a viabilidade de subvenção econômica para requalificação imobiliária.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <Link href="/oportunidades" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
            Explorar oportunidades <Activity size={22} />
          </Link>
          <Link href="/mapa" className="bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2">
            Ver mapa interativo <Map size={22} />
          </Link>
        </div>
      </section>

      {/* Main Indicators (Social Proof & Scale) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600" /> Orçamento Disponível
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(indicadores.orcamentoDisponivel)}</div>
          <div className="text-sm text-green-600 mt-2 font-medium bg-green-50 px-2 py-1 rounded inline-block w-fit">Até {chamamentoAtual.percentualMaximo}% por projeto</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-600" /> Recursos Concedidos
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(indicadores.recursosConcedidos)}</div>
          <div className="text-sm text-slate-600 mt-2">Pagos: {formatCurrency(indicadores.recursosPagos)}</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <Building2 size={18} className="text-blue-600" /> Histórico Público
          </div>
          <div className="text-3xl font-bold text-slate-900">{indicadores.projetosConhecidos} <span className="text-xl font-normal text-slate-500">projetos</span></div>
          <div className="text-sm text-slate-600 mt-2">{indicadores.imoveisMonitorados} imóveis em monitoramento contínuo</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" /> Radar de Oportunidades
          </div>
          <div className="text-3xl font-bold text-slate-900">{indicadores.oportunidadesIdentificadas} <span className="text-xl font-normal text-slate-500">imóveis</span></div>
          <div className="text-sm text-slate-600 mt-2">Identificados para análise preliminar</div>
        </div>
      </section>

      {/* How It Works / Value Proposition */}
      <section className="max-w-5xl mx-auto space-y-10 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-900">Como o Radar funciona</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Nós cruzamos dezenas de fontes de dados espaciais, financeiros e regulatórios para criar um pipeline claro de investimento em Retrofit.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">1. Agregação de Dados</h3>
            <p className="text-slate-600 leading-relaxed">
              Consolidamos Diário Oficial, GeoSampa e Portal da Subvenção em uma única base de dados estruturada e auditável.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <BarChart size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">2. Opportunity Score</h3>
            <p className="text-slate-600 leading-relaxed">
              Atribuímos uma nota matemática a cada imóvel com base em zoneamento, perímetros de incentivo, área e características físicas.
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">3. Análise Regulamentar</h3>
            <p className="text-slate-600 leading-relaxed">
              Evidenciamos riscos jurídicos e de tombamento de antemão, separando o que é viável daquilo que é armadilha.
            </p>
          </div>
        </div>
      </section>

      {/* Target Audience / Problem Solving */}
      <section className="bg-slate-900 text-white rounded-3xl p-10 md:p-16 max-w-5xl mx-auto overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-600 opacity-20 blur-3xl rounded-full"></div>
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">Para quem é o Radar?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 mt-1 shrink-0" size={20} />
                <span className="text-slate-300"><strong className="text-white">Incorporadoras e Construtoras:</strong> Identifique imóveis com maior potencial de enquadramento HIS/HMP.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 mt-1 shrink-0" size={20} />
                <span className="text-slate-300"><strong className="text-white">Fundos Imobiliários e Investidores:</strong> Acesse inteligência comercial para justificar teses de investimento com subvenção.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-blue-400 mt-1 shrink-0" size={20} />
                <span className="text-slate-300"><strong className="text-white">Proprietários e Gestores:</strong> Descubra se o seu edifício no Centro é elegível para recursos do Requalifica.</span>
              </li>
            </ul>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
            <h3 className="text-xl font-bold mb-4">Pronto para começar?</h3>
            <p className="text-slate-400 mb-6">Acesse agora as 85 oportunidades pré-analisadas pela nossa engine de dados.</p>
            <Link href="/oportunidades" className="bg-blue-600 hover:bg-blue-500 text-white w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2">
              Acessar Pipeline <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Info Notice */}
      <section className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 max-w-5xl mx-auto">
        <Clock className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold text-base mb-1">Última atualização dos dados: {new Date(indicadores.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
          <p>
            <b>Aviso de Transparência:</b> O Radar Retrofit é uma ferramenta <strong>independente</strong> desenvolvida pela LCF Consulting.
            Nós não somos associados à Prefeitura de São Paulo ou à SP Negócios. Os dados apresentados são estritamente
            indicativos e algorítmicos. O deferimento da subvenção econômica é de competência exclusiva do poder público municipal.
          </p>
        </div>
      </section>
    </div>
  )
}
