import data from '../../data/subvencao.json'
import { Download } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function RelatorioPage() {
  const { indicadores, chamamentoAtual } = data

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="page-shell max-w-4xl space-y-6">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-end">
        <PageHeader
          className="mb-0"
          title="Relatório Executivo"
          description="Estado do Retrofit no Centro de São Paulo"
        />
        <button type="button" className="btn btn-inverted shrink-0">
          <Download size={18} aria-hidden /> Gerar PDF
        </button>
      </div>

      <div className="card space-y-8 p-6 md:p-8">
        <section>
          <h2 className="mb-3 border-b border-line pb-1 text-xl font-semibold text-fg">Em uma frase</h2>
          <p className="text-lg italic text-fg-muted">
            &quot;O programa conta com {formatCurrency(indicadores.orcamentoDisponivel)} no chamamento vigente, com {indicadores.projetosConhecidos} projetos já conhecidos buscando requalificar o centro de São Paulo.&quot;
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-muted p-5">
            <h2 className="mb-2 text-lg font-semibold text-fg">Dinheiro Disponível</h2>
            <p className="text-fg-muted">
              {formatCurrency(indicadores.orcamentoDisponivel)} previstos no edital atual, permitindo subvenção de até {chamamentoAtual.percentualMaximo}% por projeto.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-muted p-5">
            <h2 className="mb-2 text-lg font-semibold text-fg">Chamamento Vigente</h2>
            <p className="text-fg-muted">
              {chamamentoAtual.nome} ({chamamentoAtual.numero}), com foco nos perímetros {chamamentoAtual.perimetro}.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">O que mudou (Últimos 30 dias)</h2>
          <ul className="list-disc space-y-1 pl-5 text-fg-muted">
            <li>Lançamento estimado do 4º Chamamento Público.</li>
            <li>Inclusão de novos critérios de HIS no perímetro expandido.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">Principais Riscos e Pontos de Atenção</h2>
          <p className="mb-2 text-fg-muted">Investidores e incorporadores devem atentar-se a:</p>
          <ul className="list-disc space-y-1 pl-5 text-fg-muted">
            <li>Necessidade de regularização dominial rígida.</li>
            <li>Prazos de aprovação em órgãos de patrimônio (Conpresp/Condephaat) para imóveis tombados.</li>
            <li>Cumprimento das cotas de Habitação de Interesse Social (HIS) para atingir pontuação máxima.</li>
          </ul>
        </section>

        <section className="callout callout-neutral text-sm">
          <p>
            <strong>Fontes:</strong> Dados extraídos do Portal da Subvenção Econômica e Diário Oficial. <strong>Data do relatório:</strong> {new Date().toLocaleDateString('pt-BR')}.
          </p>
        </section>
      </div>
    </div>
  )
}
