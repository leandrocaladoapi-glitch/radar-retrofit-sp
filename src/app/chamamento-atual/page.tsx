import data from '../../data/subvencao.json'
import { Calendar, CheckCircle, MapPin, Building, AlertTriangle, ExternalLink, FileText } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

export default function ChamamentoAtual() {
  const { programa, chamamentos, indicadores } = data

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
  }

  return (
    <div className="page-shell page-shell-narrow max-w-4xl space-y-8">
      <PageHeader
        title="Painel dos Chamamentos"
        description="Os três chamamentos de subvenção econômica com listas oficiais extraídas pelo Radar. Para o edital vigente e inscrições abertas, consulte o Portal da Subvenção."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-line bg-muted p-5">
          <div className="mb-1 text-sm font-semibold text-fg">Teto previsto em lei</div>
          <div className="kpi-value text-2xl">{formatCurrency(programa.fatos.tetoPrevisto.valor)}</div>
          <div className="mt-2 text-xs text-fg-subtle">{programa.fatos.tetoPrevisto.aviso}</div>
        </div>
        <div className="rounded-xl border border-line bg-muted p-5">
          <div className="mb-1 text-sm font-semibold text-fg">Oferta dos 3 editais (2023–2025)</div>
          <div className="kpi-value text-2xl">{formatCurrency(programa.fatos.ofertaEditais2023a2025.valor)}</div>
          <div className="mt-2 text-xs text-fg-subtle">{programa.fatos.ofertaEditais2023a2025.aviso}</div>
        </div>
        <div className="rounded-xl border border-line bg-muted p-5">
          <div className="mb-1 text-sm font-semibold text-fg">Teto por projeto</div>
          <div className="kpi-value text-2xl">Até {programa.fatos.percentualMaximo.valor}%</div>
          <div className="mt-2 text-xs text-fg-subtle">{programa.fatos.percentualMaximo.aviso}</div>
        </div>
      </div>

      {chamamentos.map((c) => (
        <div key={c.numero} className="card overflow-hidden">
          <div className="border-b border-line bg-muted px-6 py-5">
            <h2 className="text-xl font-semibold text-fg">{c.numero}</h2>
            <p className="text-sm text-fg-subtle">
              {c.tituloDocumento} • {programa.orgao}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                  <Calendar size={18} aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-fg">Documento oficial</div>
                  <div className="text-sm text-fg-muted">
                    Data: {new Date(`${c.dataDocumento}T12:00:00`).toLocaleDateString('pt-BR')} <br />
                    {c.processo && <>Processo: {c.processo} <br /></>}
                    {c.portaria && <>Comissão: {c.portaria} <br /></>}
                    {c.lote && <>Abrangência: {c.lote}</>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                  <Building size={18} aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-fg">Fase documentada</div>
                  <div className="mt-1">
                    <span className="chip bg-info-muted text-info-fg">{c.fase}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
                  <MapPin size={18} aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-semibold text-fg">Perímetro</div>
                  <div className="text-sm text-fg-muted">Requalifica Centro / AIU Setor Central</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-muted p-4">
                <div className="mb-1 text-sm font-semibold text-fg">Registros extraídos</div>
                <div className="kpi-value text-2xl">{c.totalRegistros}</div>
                {c.somaValorMaximo != null && (
                  <div className="mt-2 text-sm text-fg-muted">
                    Soma dos valores máximos (Fase II): <strong>{formatCurrency(c.somaValorMaximo)}</strong>
                    <div className="text-xs text-fg-subtle">Não são valores concedidos nem pagos.</div>
                  </div>
                )}
                {c.protocolosSemNomeAtribuivel.length > 0 && (
                  <div className="mt-2 text-xs text-fg-subtle">
                    {c.protocolosSemNomeAtribuivel.length} protocolos sem nome atribuível no layout do PDF — descartados, sem invenção.
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-success-muted text-success">
                  <CheckCircle size={16} aria-hidden />
                </span>
                <div className="text-sm">
                  <div className="font-semibold text-fg">Verificação do documento</div>
                  {c.documento.sei ? (
                    <div className="text-fg-muted">
                      SEI {c.documento.sei} • verificador {c.documento.verificador} • CRC {c.documento.crc}
                      <br />
                      <a href={c.documento.verificacaoUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                        Conferir autenticidade <ExternalLink size={12} aria-hidden />
                      </a>
                    </div>
                  ) : (
                    <div className="text-fg-muted">Relação nominal publicada pela SMUL em {new Date(`${c.dataDocumento}T12:00:00`).toLocaleDateString('pt-BR')}.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-fg">
          <FileText size={18} aria-hidden /> Base legal
        </h3>
        <ul className="space-y-2 text-sm text-fg-muted">
          {programa.baseLegal.map((n) => (
            <li key={n.norma}>
              <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                {n.norma} <ExternalLink size={12} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-fg-subtle">
          {indicadores.totalRegistrosSubvencao} registros no total • extração reproduzível dos PDFs oficiais em data-oficial/subvencao/ • atualização: {new Date(indicadores.ultimaAtualizacao as string).toLocaleDateString('pt-BR')}
        </p>
      </div>

      <div className="callout callout-warning">
        <AlertTriangle className="mt-0.5 shrink-0" aria-hidden />
        <div className="text-sm">
          <p className="mb-1 font-semibold">Aviso de Isenção</p>
          <p>
            Esta página consolida documentos públicos. O resultado final do 3º chamamento (16 contemplados, DOC 08/10/2025) é etapa posterior à lista Fase II aqui detalhada. Leia o edital integral oficial para regras completas.
          </p>
        </div>
      </div>
    </div>
  )
}
