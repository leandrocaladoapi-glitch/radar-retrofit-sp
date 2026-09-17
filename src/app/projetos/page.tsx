import projetosData from '../../data/projetos.json'
import { Search, Filter } from 'lucide-react'

export default function ProjetosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Base de Projetos Históricos</h1>
        <p className="text-slate-600">Interessados habilitados e credenciados nos chamamentos de subvenção econômica, conforme listas publicadas pela Prefeitura. Endereço, SQL e valores por projeto não constam de forma estruturada nessas listas e por isso não são exibidos.</p>
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interessado / Credenciado</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chamamento</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projetosData.map((projeto) => (
              <tr key={projeto.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{projeto.nome}</div>
                  <div className="text-xs text-gray-400 mt-1">{projeto.observacao}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{projeto.chamamento}</td>
                <td className="px-6 py-4 text-sm">
                  <a href={projeto.fonteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Portal da Subvenção Econômica
                  </a>
                  <div className="text-xs text-gray-400">{projeto.fonte}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
