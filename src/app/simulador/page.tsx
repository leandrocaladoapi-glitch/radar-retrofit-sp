import { Calculator, ExternalLink } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function SimuladorPage() {
  return (
    <div className="page-shell page-shell-narrow max-w-3xl space-y-8">
      <PageHeader
        title="Simulador Indicativo"
        description="Estime o potencial de subvenção com base nas regras gerais. Não substitui o simulador oficial da Prefeitura."
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
              <input id="valor-obra" type="number" className="field" placeholder="Ex: 10000000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-fg" htmlFor="categoria">
                Categoria Habitacional Principal
              </label>
              <select id="categoria" className="field">
                <option>HIS-1 (Habitação de Interesse Social)</option>
                <option>HIS-2</option>
                <option>HMP (Habitação de Mercado Popular)</option>
                <option>Uso Misto / Não Residencial</option>
              </select>
            </div>
          </div>

          <button type="button" className="btn btn-primary mt-4 w-full">
            Calcular Estimativa
          </button>
        </div>

        <div className="border-t border-line bg-muted p-6">
          <div className="text-center text-sm text-fg-muted">Preencha os valores acima para ver a estimativa.</div>
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
