import Link from 'next/link'
import indice from '../../data/oportunidades_index.json'
import status from '../../data/etl_status.json'
import type { OportunidadeIndex } from '../../lib/types'
import PageHeader from '../../components/ui/PageHeader'

export const metadata = {
  title: 'Radar de Oportunidades — imóveis reais da área central | Radar Retrofit SP',
  description:
    'Base de imóveis reais da área central de São Paulo identificados a partir do Cadastro Imobiliário Fiscal (GeoSampa) e cruzados por geometria com os perímetros oficiais do Requalifica Centro e da AIU Setor Central.',
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR')
}

function relacaoLabel(rel: string) {
  if (rel === 'dentro') return 'dentro'
  if (rel === 'intersecta') return 'intersecta'
  return 'fora'
}

function scoreTone(score: number) {
  if (score >= 85) return 'bg-success-muted text-success-fg border-success/20'
  if (score >= 70) return 'bg-info-muted text-info-fg border-info/20'
  return 'bg-warning-muted text-warning-fg border-warning/20'
}

export default function OportunidadesPage() {
  const ops = indice as OportunidadeIndex[]
  const verificacao = new Date(status.executadoEm)

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Radar de Oportunidades"
        description={
          <>
            {fmt(ops.length)} imóveis <strong>reais</strong> da área central de São Paulo, identificados no Cadastro
            Imobiliário Fiscal (camada Lote do GeoSampa) e cruzados por geometria com os perímetros oficiais.{' '}
            <strong className="text-accent">Os dados cadastrais são oficiais; as projeções financeiras são estimativas do Radar.</strong>
          </>
        }
        meta={
          <p className="text-xs text-fg-subtle">
            Última verificação das fontes oficiais:{' '}
            {verificacao.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {' • '}
            {status.candidatosRetidos} candidatos retidos internamente por confiança de dados insuficiente.
          </p>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ops.map((op) => (
          <Link href={`/oportunidades/${op.slug}`} key={op.id} className="group block">
            <div className="card card-interactive flex h-full flex-col p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className={`rounded border px-2 py-1 text-xs font-bold tabular ${scoreTone(op.score)}`}>
                  Score: {op.score}/100
                </div>
                <div className="font-mono text-xs tabular text-fg-subtle">Confiança: {op.confidence}%</div>
              </div>

              <h3 className="text-lg font-bold text-fg transition-colors duration-180 group-hover:text-accent">{op.nome}</h3>
              <p className="text-sm text-fg-muted">
                SQL {op.sql} • {op.usoCadastrado} • {fmt(op.areaConstruida)} m²
              </p>
              <p className="mb-4 text-[11px] text-fg-subtle">Dados cadastrais oficiais — GeoSampa / Cadastro Imobiliário Fiscal</p>

              <div className="mt-auto space-y-2">
                <div className="border-t border-line pt-3 text-sm">
                  <span className="font-semibold text-fg">Motivo:</span>{' '}
                  <span className="line-clamp-2 text-fg-muted">{op.motivoPrincipal}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {op.requalificaCentro !== 'fora' && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-fg-muted">
                      Requalifica Centro: {relacaoLabel(op.requalificaCentro)}
                    </span>
                  )}
                  {op.aiuSetorCentral !== 'fora' && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-fg-muted">
                      AIU Setor Central: {relacaoLabel(op.aiuSetorCentral)}
                    </span>
                  )}
                  {op.protegido && (
                    <span className="rounded bg-warning-muted px-2 py-0.5 text-[10px] uppercase text-warning-fg">
                      Imóvel protegido
                    </span>
                  )}
                  {op.zoneamento && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-fg-muted">{op.zoneamento}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
