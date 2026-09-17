import projetosData from '../../data/projetos.json'
import { Users, Building2, TrendingUp } from 'lucide-react'

export default function MercadoPage() {
  // Aggregate companies (simplified logic for demonstration)
  const empresasMap = new Map();
  projetosData.forEach(p => {
    if (p.empresa && p.empresa !== "Não divulgado") {
      if (!empresasMap.has(p.empresa)) {
        empresasMap.set(p.empresa, { nome: p.empresa, projetos: 0 });
      }
      const data = empresasMap.get(p.empresa);
      data.projetos += 1;
    }
  });
  const empresas = Array.from(empresasMap.values()).sort((a, b) => b.projetos - a.projetos || a.nome.localeCompare(b.nome));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Inteligência de Mercado</h1>
        <p className="text-slate-600">Mapeamento dos agentes identificáveis publicamente no ecossistema de retrofit subvencionado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{empresas.length}</div>
            <div className="text-sm text-slate-500">Agentes Identificados</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><Building2 size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{projetosData.length}</div>
            <div className="text-sm text-slate-500">Projetos Públicos</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><TrendingUp size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-slate-900">3</div>
            <div className="text-sm text-slate-500">Chamamentos com listas publicadas (2023-2025)</div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-800 mb-4 border-b pb-2">Agentes com Projetos Aprovados/Credenciados</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa / SPE / Condomínio</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projetos Vinculados</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fonte</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empresas.map((empresa, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.nome}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{empresa.projetos}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Listas oficiais de habilitados/credenciados (SMUL)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-500 mt-4">
        A associação entre empresas e projetos é feita exclusivamente com base em dados de domínio público (Diário Oficial, relatórios da SMUL, notícias da Prefeitura). Nomes protegidos por sigilo fiscal não são expostos.
      </div>
    </div>
  )
}
