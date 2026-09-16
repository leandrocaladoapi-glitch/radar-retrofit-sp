import Link from 'next/link'
import { Activity, Building2, Map, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import data from '../data/subvencao.json'

export default function Home() {
  const { indicadores, chamamentoAtual } = data;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-12">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          Radar Retrofit São Paulo
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Inteligência sobre requalificação imobiliária, incentivos públicos e oportunidades no Centro de São Paulo.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/oportunidades" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2">
            <Activity size={20} /> Explorar oportunidades
          </Link>
          <Link href="/mapa" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2">
            <Map size={20} /> Ver mapa
          </Link>
        </div>
      </section>

      {/* Main Indicators */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <TrendingUp size={18} /> Orçamento Chamamento
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(indicadores.orcamentoDisponivel)}</div>
          <div className="text-sm text-green-600 mt-2 font-medium">Até {chamamentoAtual.percentualMaximo}% por projeto</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <Building2 size={18} /> Projetos e Imóveis
          </div>
          <div className="text-3xl font-bold text-slate-900">{indicadores.projetosConhecidos} <span className="text-xl font-normal text-slate-500">projetos</span></div>
          <div className="text-sm text-slate-600 mt-2">{indicadores.imoveisMonitorados} imóveis monitorados</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <CheckCircle2 size={18} /> Recursos Liberados
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(indicadores.recursosConcedidos)}</div>
          <div className="text-sm text-slate-600 mt-2">Pagos: {formatCurrency(indicadores.recursosPagos)}</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="text-slate-500 mb-2 font-medium flex items-center gap-2">
            <AlertCircle size={18} /> Oportunidades
          </div>
          <div className="text-3xl font-bold text-blue-600">{indicadores.oportunidadesIdentificadas}</div>
          <div className="text-sm text-slate-600 mt-2">Identificadas pelo Radar</div>
        </div>
      </section>

      {/* Info Notice */}
      <section className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-4">
        <Clock className="text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold">Última atualização dos dados: {new Date(indicadores.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
          <p className="mt-1">Os dados apresentados são indicativos, extraídos de fontes públicas (Diário Oficial, GeoSampa, Portal da Subvenção) e não constituem garantia de elegibilidade.</p>
        </div>
      </section>
    </div>
  )
}
