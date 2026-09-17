'use client'

import { useState } from 'react'
import { Calculator, ExternalLink } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

const PERCENTUAIS: Record<string, { teto: number; nota: string }> = {
  'HIS-1 (Habitação de Interesse Social)': { teto: 25, nota: 'Categoria com maior pontuação potencial nos editais.' },
  'HIS-2': { teto: 25, nota: 'Ex.: credenciados Fase II/2025 em HIS-2 atingiram 22,75%–24%.' },
  'HMP (Habitação de Mercado Popular)': { teto: 25, nota: 'Teto teórico; percentual efetivo depende de pontuação.' },
  'Uso Misto / Não Residencial': { teto: 25, nota: 'Ex.: credenciados Fase II/2025 em R2v/nR variaram de 5% a 22,45%.' },
}

export default function SimuladorPage() {
  const [valorObra, setValorObra] = useState('')
  const [categoria, setCategoria] = useState(Object.keys(PERCENTUAIS)[0])
  const [resultado, setResultado] = useState<number | null>(null)

  const fmtBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const calcular = () => {
    const v = Number(valorObra)
    if (!Number.isFinite(v) || v <= 0) {
      setResultado(null)
      return
    }
    setResultado(Math.round(v * (PERCENTUAIS[categoria].teto / 100)))
  }

  return (
    <div className="page-shell page-shell-narrow max-w-3xl space-y-8">
      <PageHeader
        title="Simulador Indicativo"
        description="Teto teórico de subvenção (até 25% do custo da obra). Estimativa do Radar — não substitui o simulador oficial da Prefeitura."
      />

      <div className="card overflow-hidden">
        <div className="border-b border-line bg-muted p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-fg">
            <Calculator size={20} aria-hidden /> Parâmetros do Projeto
          </h2>
        </div>

        <div className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-fg" htmlFor="valor-obra">
                Valor Estimado da Obra (R$)
              </label>
              <input
                id="valor-obra"
                type="number"
                min="0"
                className="field"
                placeholder="Ex: 10000000"
                value={valorObra}
                onChange={(e) => setValorObra(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-fg" htmlFor="categoria">
                Categoria Habitacional Principal
              </label>
              <select id="categoria" className="field" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                {Object.keys(PERCENTUAIS).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="button" onClick={calcular} className="btn btn-primary mt-4 w-full">
            Calcular Estimativa
          </button>
        </div>

        <div className="border-t border-line bg-muted p-6">
          {resultado != null ? (
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">Teto teórico preliminar (até 25%)</div>
              <div className="kpi-value mt-1 text-3xl">{fmtBRL(resultado)}</div>
              <p className="mx-auto mt-2 max-w-lg text-xs text-fg-muted">
                Estimativa do Radar. {PERCENTUAIS[categoria].nota} Não é valor concedido nem direito adquirido —
                depende de enquadramento, pontuação e análise oficial da Prefeitura.
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-fg-muted">Preencha um valor de obra válido para ver a estimativa.</div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-info/20 bg-info-muted p-6 text-center">
        <h3 className="font-semibold text-info-fg">Simulador Oficial</h3>
        <p className="max-w-lg text-sm text-info-fg">
          Para obter um cálculo oficial e detalhado com todas as variáveis do edital, acesse a ferramenta disponibilizada pela Prefeitura.
        </p>
        <a
          href="https://subvencao.prefeitura.sp.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary text-sm"
        >
          Acessar Simulador Oficial <ExternalLink size={16} aria-hidden />
        </a>
      </div>
    </div>
  )
}
