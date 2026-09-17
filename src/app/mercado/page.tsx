import projetosData from '../../data/projetos.json'
import { Users, Building2, TrendingUp } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import MetricCard from '../../components/ui/MetricCard'

export default function MercadoPage() {
  const empresasMap = new Map()
  projetosData.forEach((p) => {
    if (p.empresa && p.empresa !== 'Não divulgado') {
      if (!empresasMap.has(p.empresa)) {
        empresasMap.set(p.empresa, { nome: p.empresa, projetos: 0 })
      }
      const data = empresasMap.get(p.empresa)
      data.projetos += 1
    }
  })
  const empresas = Array.from(empresasMap.values()).sort(
    (a, b) => b.projetos - a.projetos || a.nome.localeCompare(b.nome)
  )

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Inteligência de Mercado"
        description="Mapeamento dos agentes identificáveis publicamente no ecossistema de retrofit subvencionado."
      />

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          icon={<Users size={16} />}
          label="Agentes Identificados"
          value={empresas.length}
        />
        <MetricCard
          icon={<Building2 size={16} />}
          label="Projetos Públicos"
          value={projetosData.length}
        />
        <MetricCard
          icon={<TrendingUp size={16} />}
          label="Chamamentos com listas publicadas (2023-2025)"
          value={3}
        />
      </div>

      <h2 className="mb-4 border-b border-line pb-2 text-xl font-semibold text-fg">
        Agentes com Projetos Aprovados/Credenciados
      </h2>

      <div className="space-y-3 md:hidden">
        {empresas.map((empresa, idx) => (
          <article key={idx} className="card p-4">
            <h3 className="text-sm font-medium text-fg">{empresa.nome}</h3>
            <p className="mt-1 text-sm text-fg-muted">
              Projetos Vinculados: <span className="font-mono tabular font-semibold text-fg">{empresa.projetos}</span>
            </p>
            <p className="mt-1 text-xs text-fg-subtle">Listas oficiais de habilitados/credenciados (SMUL)</p>
          </article>
        ))}
      </div>

      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Empresa / SPE / Condomínio</th>
              <th scope="col">Projetos Vinculados</th>
              <th scope="col">Fonte</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map((empresa, idx) => (
              <tr key={idx}>
                <td className="whitespace-nowrap text-sm font-medium text-fg">{empresa.nome}</td>
                <td className="whitespace-nowrap font-mono text-sm tabular text-fg-muted">{empresa.projetos}</td>
                <td className="whitespace-nowrap text-sm text-fg-muted">
                  Listas oficiais de habilitados/credenciados (SMUL)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="callout callout-neutral mt-4 text-xs">
        A associação entre empresas e projetos é feita exclusivamente com base em dados de domínio público (Diário Oficial, relatórios da SMUL, notícias da Prefeitura). Nomes protegidos por sigilo fiscal não são expostos.
      </div>
    </div>
  )
}
