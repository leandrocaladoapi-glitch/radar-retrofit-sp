import { Calculator, ExternalLink } from 'lucide-react'

export default function SimuladorPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Simulador Indicativo</h1>
        <p className="text-slate-600">Estime o potencial de subvenção com base nas regras gerais. Não substitui o simulador oficial da Prefeitura.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2"><Calculator size={20}/> Parâmetros do Projeto</h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Estimado da Obra (R$)</label>
              <input type="number" className="block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: 10000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria Habitacional Principal</label>
              <select className="block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
                <option>HIS-1 (Habitação de Interesse Social)</option>
                <option>HIS-2</option>
                <option>HMP (Habitação de Mercado Popular)</option>
                <option>Uso Misto / Não Residencial</option>
              </select>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition mt-4">
            Calcular Estimativa
          </button>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <div className="text-center text-slate-500 text-sm">
            Preencha os valores acima para ver a estimativa.
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border border-blue-100 text-center space-y-3">
        <h3 className="font-semibold text-blue-900">Simulador Oficial</h3>
        <p className="text-sm text-blue-800 max-w-lg">Para obter um cálculo oficial e detalhado com todas as variáveis do edital, acesse a ferramenta disponibilizada pela Prefeitura.</p>
        <a href="https://subvencao.prefeitura.sp.gov.br" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition text-sm">
          Acessar Simulador Oficial <ExternalLink size={16} />
        </a>
      </div>
    </div>
  )
}
