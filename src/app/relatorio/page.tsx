import Link from 'next/link'
import data from '../../data/subvencao.json'
import feed from '../../data/atualizacoes.json'
import { Download } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function RelatorioPage() {
  const { indicadores, programa, chamamentos } = data
  const num = (v: unknown) => (typeof v === 'number' ? v : 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
  }

  const trintaDiasAtras = Date.now() - 30 * 86400000
  const recentes = ((feed.itens || []) as Array<{ data: string; rotulo: string; sql: string | null; campo: string | null }>)
    .filter((e) => new Date(e.data).getTime() >= trintaDiasAtras)
    .slice(0, 5)

  return (
    <div className="page-shell max-w-4xl space-y-6">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-line pb-4 sm:flex-row sm:items-end">
        <PageHeader
          className="mb-0"
          title="Relatório Executivo"
          description="Estado do Retrofit no Centro de São Paulo — apenas dados comprovados"
        />
        <button type="button" className="btn btn-inverted shrink-0">
          <Download size={18} aria-hidden /> Gerar PDF
        </button>
      </div>

      <div className="card space-y-8 p-6 md:p-8">
        <section>
          <h2 className="mb-3 border-b border-line pb-1 text-xl font-semibold text-fg">Em uma frase</h2>
          <p className="text-lg italic text-fg-muted">
            &quot;O Radar monitora {num(indicadores.imoveisMonitorados).toLocaleString('pt-BR')} imóveis reais no Centro, e as listas oficiais da SMUL registram {num(indicadores.totalRegistrosSubvencao)} interessados, habilitados e credenciados em {num(indicadores.chamamentosComListas)} chamamentos.&quot;
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-muted p-5">
            <h2 className="mb-2 text-lg font-semibold text-fg">Recursos do programa</h2>
            <p className="text-fg-muted">
              Teto previsto em lei: <strong>{formatCurrency(programa.fatos.tetoPrevisto.valor)}</strong> (Lei nº 17.844/2022).
              Oferta somada dos três editais 2023–2025: <strong>{formatCurrency(programa.fatos.ofertaEditais2023a2025.valor)}</strong>,
              sendo {formatCurrency(programa.fatos.ofertaTerceiroChamamento.valor)} no 3º chamamento.
            </p>
            <p className="mt-2 text-xs text-fg-subtle">
              Valores previstos/ofertados segundo a SMUL — não são valores concedidos ou pagos. A soma dos valores máximos da lista Fase II/2025 é {formatCurrency(num(indicadores.valorMaximoCredenciado2025FaseII))}.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-muted p-5">
            <h2 className="mb-2 text-lg font-semibold text-fg">Chamamentos documentados</h2>
            <ul className="space-y-1 text-fg-muted">
              {chamamentos.map((c) => (
                <li key={c.numero}>
                  <strong>{c.numero}</strong> — {c.fase} • {c.totalRegistros} registros
                </li>
              ))}
            </ul>
            <Link href="/chamamento-atual" className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
              Ver painel dos chamamentos
            </Link>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-fg">O que mudou (Últimos 30 dias)</h2>
          {recentes.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-fg-muted">
              {recentes.map((e, i) => (
                <li key={i}>
                  {e.rotulo}
                  {e.sql ? ` — SQL ${e.sql}` : ''}
                  {e.campo ? ` (${e.campo})` : ''} • {new Date(e.data).toLocaleDateString('pt-BR')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-fg-muted">
              Nenhum evento registrado nos últimos 30 dias. O histórico completo está em{' '}
              <Link href="/atualizacoes" className="font-medium text-accent hover:underline">Atualizações</Link>.
            </p>
          )}
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
            <strong>Fontes:</strong> Cadastro Imobiliário Fiscal (GeoSampa), listas oficiais da SMUL (SEI 6068.2024/0005871-1 e 6068.2025/0004742-8) e páginas oficiais da Prefeitura.{' '}
            <strong>Data do relatório:</strong> {new Date().toLocaleDateString('pt-BR')}.
          </p>
        </section>
      </div>
    </div>
  )
}
