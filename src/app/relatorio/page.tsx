import data from '../../data/subvencao.json'
import { Download } from 'lucide-react'

export default function RelatorioPage() {
  const { indicadores, chamamentoAtual } = data

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Relatório Executivo</h1>
          <p className="text-slate-600">Estado do Retrofit no Centro de São Paulo</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded font-medium hover:bg-slate-800 transition">
          <Download size={18}/> Gerar PDF
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">

        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3 border-b pb-1">Em uma frase</h2>
          <p className="text-lg text-slate-700 italic">&quot;O programa conta com {formatCurrency(indicadores.orcamentoDisponivel)} no chamamento vigente, com {indicadores.projetosConhecidos} projetos já conhecidos buscando requalificar o centro de São Paulo.&quot;</p>
        </section>

        <section className="grid grid-cols-2 gap-6">
          <div>
             <h2 className="text-lg font-semibold text-slate-800 mb-2">Dinheiro Disponível</h2>
             <p className="text-slate-700">{formatCurrency(indicadores.orcamentoDisponivel)} previstos no edital atual, permitindo subvenção de até {chamamentoAtual.percentualMaximo}% por projeto.</p>
          </div>
          <div>
             <h2 className="text-lg font-semibold text-slate-800 mb-2">Chamamento Vigente</h2>
             <p className="text-slate-700">{chamamentoAtual.nome} ({chamamentoAtual.numero}), com foco nos perímetros {chamamentoAtual.perimetro}.</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">O que mudou (Últimos 30 dias)</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Lançamento estimado do 4º Chamamento Público.</li>
            <li>Inclusão de novos critérios de HIS no perímetro expandido.</li>
          </ul>
        </section>

        <section>
           <h2 className="text-lg font-semibold text-slate-800 mb-2">Principais Riscos e Pontos de Atenção</h2>
           <p className="text-slate-700 mb-2">Investidores e incorporadores devem atentar-se a:</p>
           <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Necessidade de regularização dominial rígida.</li>
            <li>Prazos de aprovação em órgãos de patrimônio (Conpresp/Condephaat) para imóveis tombados.</li>
            <li>Cumprimento das cotas de Habitação de Interesse Social (HIS) para atingir pontuação máxima.</li>
          </ul>
        </section>

        <section className="bg-slate-50 p-4 border border-slate-200 rounded text-sm text-slate-600">
          <p><strong>Fontes:</strong> Dados extraídos do Portal da Subvenção Econômica e Diário Oficial. <strong>Data do relatório:</strong> {new Date().toLocaleDateString('pt-BR')}.</p>
        </section>

      </div>
    </div>
  )
}
