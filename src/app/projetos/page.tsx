'use client'

import { useMemo, useState } from 'react'
import projetosData from '../../data/projetos.json'
import { Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

interface Documento {
  titulo: string
  data: string
  sei: string | null
  verificador: string | null
  crc: string | null
  verificacaoUrl: string | null
}

interface Projeto {
  id: string
  nome: string
  endereco: string | null
  chamamento: string
  ano: number
  fase: string
  situacao: string
  ordem: number
  processoSei: string | null
  protocolo: string | null
  notaProtocolo: string | null
  categoria: string | null
  pontuacao: number | null
  bonificacao: string | null
  percentualSubvencao: number | null
  valorMaximoSubvencao: number | null
  observacao: string
  documento: Documento
  fonte: string
  fonteUrl: string
}

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export default function ProjetosPage() {
  const [busca, setBusca] = useState('')
  const projetos = projetosData as unknown as Projeto[]

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return projetos
    return projetos.filter((p) =>
      [p.nome, p.endereco, p.chamamento, p.situacao, p.processoSei, p.protocolo, p.categoria]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }, [busca, projetos])

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Base de Projetos Históricos"
        description={`${projetos.length} registros extraídos das listas oficiais da SMUL (relação 2023, Fase I 2024, Fase II 2025). Endereço, categoria e valores máximos constam apenas da lista Fase II/2025; campos ausentes nos documentos não são exibidos.`}
      />

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-fg-subtle" aria-hidden />
          </div>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="field pl-10"
            placeholder="Buscar por nome, endereço, protocolo, SEI ou categoria..."
            aria-label="Buscar por nome, endereço, protocolo, SEI ou categoria"
          />
        </div>
      </div>
      <p className="-mt-3 text-xs text-fg-subtle">
        Exibindo {filtrados.length} de {projetos.length} registros.
      </p>

      <div className="space-y-3 md:hidden">
        {filtrados.map((projeto) => (
          <article key={projeto.id} className="card p-4">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="chip bg-info-muted text-info-fg">{projeto.situacao}</span>
              <span className="text-xs text-fg-subtle">{projeto.chamamento}</span>
            </div>
            <h2 className="text-sm font-semibold text-fg">{projeto.nome}</h2>
            {projeto.endereco && <p className="mt-1 text-sm text-fg-muted">{projeto.endereco}</p>}
            {projeto.valorMaximoSubvencao != null && (
              <p className="mt-1 text-sm text-fg-muted">
                Valor máximo: <strong className="text-fg">{fmtBRL(projeto.valorMaximoSubvencao)}</strong>
                {projeto.percentualSubvencao != null && ` (${String(projeto.percentualSubvencao).replace('.', ',')}%)`}
                {projeto.categoria && ` • ${projeto.categoria}`}
              </p>
            )}
            {(projeto.processoSei || projeto.protocolo) && (
              <p className="mt-1 font-mono text-xs tabular text-fg-subtle">
                {projeto.processoSei || projeto.protocolo}
              </p>
            )}
            {projeto.notaProtocolo && <p className="mt-1 text-xs text-fg-subtle">{projeto.notaProtocolo}</p>}
            <p className="mt-2 text-xs text-fg-subtle">{projeto.observacao}</p>
            <p className="mt-2 text-xs text-fg-subtle">
              {projeto.documento.titulo} ({new Date(`${projeto.documento.data}T12:00:00`).toLocaleDateString('pt-BR')})
              {projeto.documento.sei && ` • SEI ${projeto.documento.sei}`}
            </p>
          </article>
        ))}
      </div>

      <div className="table-wrap hidden md:block">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Interessado</th>
              <th scope="col">Situação</th>
              <th scope="col">Endereço / Valor máx. (2025)</th>
              <th scope="col">Processo / Protocolo</th>
              <th scope="col">Documento</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((projeto) => (
              <tr key={projeto.id}>
                <td>
                  <div className="text-sm font-medium text-fg">{projeto.nome}</div>
                  <div className="mt-1 text-xs text-fg-subtle">{projeto.chamamento}</div>
                </td>
                <td className="whitespace-nowrap">
                  <span className="chip bg-info-muted text-info-fg">{projeto.situacao}</span>
                </td>
                <td className="text-sm text-fg-muted">
                  {projeto.endereco ? (
                    <>
                      <div>{projeto.endereco}</div>
                      {projeto.valorMaximoSubvencao != null && (
                        <div className="mt-1 font-semibold text-fg">
                          {fmtBRL(projeto.valorMaximoSubvencao)}
                          {projeto.percentualSubvencao != null && (
                            <span className="font-normal text-fg-muted"> ({String(projeto.percentualSubvencao).replace('.', ',')}%)</span>
                          )}
                        </div>
                      )}
                      {projeto.categoria && <div className="text-xs text-fg-subtle">{projeto.categoria}</div>}
                    </>
                  ) : (
                    <span className="text-xs text-fg-subtle">Não consta do documento</span>
                  )}
                </td>
                <td className="whitespace-nowrap font-mono text-xs tabular text-fg-muted">
                  {projeto.processoSei || projeto.protocolo || '—'}
                  {projeto.notaProtocolo && <div className="mt-1 max-w-[220px] whitespace-normal font-sans text-[11px] text-fg-subtle">{projeto.notaProtocolo}</div>}
                </td>
                <td className="text-xs text-fg-muted">
                  <div>{projeto.documento.titulo}</div>
                  <div className="text-fg-subtle">
                    {new Date(`${projeto.documento.data}T12:00:00`).toLocaleDateString('pt-BR')}
                    {projeto.documento.sei && ` • SEI ${projeto.documento.sei}`}
                  </div>
                  {projeto.documento.verificacaoUrl && (
                    <a href={projeto.documento.verificacaoUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                      Conferir autenticidade
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="callout callout-neutral mt-4 text-xs">
        Valores exibidos são o &quot;VALOR MÁXIMO DE SUBVENÇÃO&quot; da lista Fase II (19/09/2025, SEI 6068.2025/0004742-8)
        — serão ajustados antes dos Termos de Outorga e não representam valores pagos. Nomes e protocolos transcritos
        exatamente como publicados nos documentos oficiais.
      </div>
    </div>
  )
}
