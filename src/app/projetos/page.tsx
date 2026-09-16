import projetosData from '../../data/projetos.json'
import { Search, Filter } from 'lucide-react'

export default function ProjetosPage() {
  const formatCurrency = (val: number | null) => {
    if (val === null) return 'N/D';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Base de Projetos Históricos</h1>
        <p className="text-slate-600">Histórico de edifícios inscritos, credenciados e contemplados nos chamamentos anteriores.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Buscar por nome, endereço ou empresa..."
          />
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition">
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projeto / Endereço</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chamamento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Aprovado</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projetosData.map((projeto) => (
              <tr key={projeto.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{projeto.nome}</div>
                  <div className="text-sm text-gray-500">{projeto.endereco} • {projeto.distrito}</div>
                  <div className="text-xs text-gray-400 mt-1">{projeto.empresa}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${projeto.situacao === 'Em execução' ? 'bg-green-100 text-green-800' :
                      projeto.situacao === 'Credenciado' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {projeto.situacao}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {projeto.uso}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {projeto.chamamento}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {formatCurrency(projeto.valorAprovado)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
