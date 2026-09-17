import projetosData from '../../data/projetos.json'
import { Search, Filter } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function ProjetosPage() {
  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Base de Projetos Históricos"
        description="Interessados habilitados e credenciados nos chamamentos de subvenção econômica, conforme listas publicadas pela Prefeitura. Endereço, SQL e valores por projeto não constam de forma estruturada nessas listas e por isso não são exibidos."
      />

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-fg-subtle" aria-hidden />
          </div>
          <input
            type="text"
            className="field pl-10"
            placeholder="Buscar por nome, endereço ou empresa..."
            aria-label="Buscar por nome, endereço ou empresa..."
          />
        </div>
        <button type="button" className="btn btn-secondary">
          <Filter size={18} aria-hidden /> Filtros
        </button>
      </div>

      <div className="space-y-3 md:hidden">
        {projetosData.map((projeto) => (
          <article key={projeto.id} className="card p-4">
            <h2 className="text-sm font-semibold text-fg">{projeto.nome}</h2>
            <p className="mt-1 text-xs text-fg-subtle">{projeto.observacao}</p>
            <p className="mt-3 text-sm text-fg-muted">{projeto.chamamento}</p>
            <a
              href={projeto.fonteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-tap items-center text-sm font-medium text-accent hover:underline"
            >
              Portal da Subvenção Econômica
            </a>
            <div className="text-xs text-fg-subtle">{projeto.fonte}</div>
          </article>
        ))}
      </div>

      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Interessado / Credenciado</th>
              <th scope="col">Chamamento</th>
              <th scope="col">Fonte</th>
            </tr>
          </thead>
          <tbody>
            {projetosData.map((projeto) => (
              <tr key={projeto.id}>
                <td>
                  <div className="text-sm font-medium text-fg">{projeto.nome}</div>
                  <div className="mt-1 text-xs text-fg-subtle">{projeto.observacao}</div>
                </td>
                <td className="whitespace-nowrap text-sm text-fg-muted">{projeto.chamamento}</td>
                <td className="text-sm">
                  <a
                    href={projeto.fonteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-accent hover:underline"
                  >
                    Portal da Subvenção Econômica
                  </a>
                  <div className="text-xs text-fg-subtle">{projeto.fonte}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
