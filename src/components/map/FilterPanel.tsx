'use client'

/*
 * Painel de filtros — mesmo componente no desktop (coluna lateral) e no mobile
 * (folha sobre o mapa). Cada seção é independente e o estado vive no
 * MapExperience, então filtrar não recria o mapa: só recalcula a fonte GeoJSON.
 */

import { Filter, RotateCcw, Search } from 'lucide-react'
import type { TipoRegistro } from '../../lib/mapa'
import { TIPOS } from './theme'
import {
  FAIXAS_AREA,
  FAIXAS_CUSTO,
  FAIXAS_TETO,
  ROTULOS_TIPO,
  contarFiltrosAtivos,
  alternar,
  type Filtros,
} from './filters'
import { formatarNumero } from './stats'

interface FilterPanelProps {
  filtros: Filtros
  aoMudar: (filtros: Filtros) => void
  distritos: string[]
  usos: string[]
  visiveis: number
  total: number
}

function Chip({
  ativo,
  rotulo,
  cor,
  contagem,
  aoClicar,
}: {
  ativo: boolean
  rotulo: string
  cor?: string
  contagem?: number
  aoClicar: () => void
}) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-pressed={ativo}
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition duration-180 ${
        ativo
          ? 'border-fg bg-fg text-bg'
          : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
      }`}
    >
      {cor && (
        <span
          className="h-2.5 w-2.5 rounded-full ring-1 ring-surface/70"
          style={{ backgroundColor: cor }}
          aria-hidden
        />
      )}
      {rotulo}
      {typeof contagem === 'number' && (
        <span className={ativo ? 'text-bg/70' : 'text-fg-subtle'}>{contagem}</span>
      )}
    </button>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-line pt-3 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">{titulo}</p>
      {children}
    </div>
  )
}

export default function FilterPanel({ filtros, aoMudar, distritos, usos, visiveis, total }: FilterPanelProps) {
  const ativos = contarFiltrosAtivos(filtros)
  const atualizar = (parcial: Partial<Filtros>) => aoMudar({ ...filtros, ...parcial })

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-fg">
            <Filter size={15} /> Filtros
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            <strong className="font-semibold text-fg">{formatarNumero(visiveis)}</strong> de{' '}
            {formatarNumero(total)} imóveis no recorte
          </p>
        </div>
        {ativos > 0 && (
          <button
            type="button"
            onClick={() =>
              aoMudar({
                tipos: [],
                distritos: [],
                scoreMin: 0,
                requalifica: 'todos',
                aiu: 'todos',
                patrimonio: 'todos',
                usos: [],
                areas: [],
                custos: [],
                tetos: [],
                busca: '',
              })
            }
            className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-fg-muted hover:border-line-strong hover:text-fg"
          >
            <RotateCcw size={12} /> Limpar ({ativos})
          </button>
        )}
      </div>

      <div className="space-y-4">
        <Secao titulo="Busca livre">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-2.5 text-fg-subtle" />
            <input
              type="search"
              value={filtros.busca}
              onChange={(evento) => atualizar({ busca: evento.target.value })}
              placeholder="Endereço, SQL ou distrito"
              className="field pl-8"
            />
          </div>
        </Secao>

        <Secao titulo="Tipo de registro">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TIPOS) as TipoRegistro[]).map((tipo) => (
              <Chip
                key={tipo}
                ativo={filtros.tipos.includes(tipo)}
                rotulo={ROTULOS_TIPO[tipo]}
                cor={TIPOS[tipo].cor}
                aoClicar={() => atualizar({ tipos: alternar(filtros.tipos, tipo) })}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Opportunity Score mínimo">
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filtros.scoreMin}
              onChange={(evento) => atualizar({ scoreMin: Number(evento.target.value) })}
              className="w-full accent-accent"
              aria-label="Opportunity Score mínimo"
            />
            <div className="flex items-center justify-between text-xs text-fg-muted">
              <span>0</span>
              <span className="rounded bg-muted px-2 py-0.5 font-semibold text-fg">
                {filtros.scoreMin === 0 ? 'todos' : `≥ ${filtros.scoreMin}`}
              </span>
              <span>100</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[70, 80, 85, 90].map((valor) => (
                <Chip
                  key={valor}
                  ativo={filtros.scoreMin === valor}
                  rotulo={`≥ ${valor}`}
                  aoClicar={() => atualizar({ scoreMin: filtros.scoreMin === valor ? 0 : valor })}
                />
              ))}
            </div>
          </div>
        </Secao>

        <Secao titulo="Enquadramento territorial">
          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={filtros.requalifica === 'dentro'}
                onChange={(evento) => atualizar({ requalifica: evento.target.checked ? 'dentro' : 'todos' })}
                className="mt-0.5 accent-accent"
              />
              <span>
                Somente dentro do <strong className="font-semibold">Requalifica Centro</strong>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-fg">
              <input
                type="checkbox"
                checked={filtros.aiu === 'dentro'}
                onChange={(evento) => atualizar({ aiu: evento.target.checked ? 'dentro' : 'todos' })}
                className="mt-0.5 accent-accent"
              />
              <span>
                Somente dentro da <strong className="font-semibold">AIU Setor Central</strong>
              </span>
            </label>
          </div>
        </Secao>

        <Secao titulo="Status patrimonial">
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'todos', rotulo: 'Todos' },
                { id: 'protegido', rotulo: 'Tombado / protegido' },
                { id: 'livre', rotulo: 'Sem proteção' },
              ] as const
            ).map((opcao) => (
              <Chip
                key={opcao.id}
                ativo={filtros.patrimonio === opcao.id}
                rotulo={opcao.rotulo}
                cor={opcao.id === 'protegido' ? TIPOS.tombado.cor : undefined}
                aoClicar={() => atualizar({ patrimonio: opcao.id })}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Distrito">
          <div className="flex flex-wrap gap-1.5">
            <Chip
              ativo={filtros.distritos.length === 0}
              rotulo="Todos"
              aoClicar={() => atualizar({ distritos: [] })}
            />
            {distritos.map((distrito) => (
              <Chip
                key={distrito}
                ativo={filtros.distritos.includes(distrito)}
                rotulo={distrito}
                aoClicar={() => atualizar({ distritos: alternar(filtros.distritos, distrito) })}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Uso cadastrado">
          <div className="flex flex-wrap gap-1.5">
            <Chip ativo={filtros.usos.length === 0} rotulo="Todos" aoClicar={() => atualizar({ usos: [] })} />
            {usos.map((uso) => (
              <Chip
                key={uso}
                ativo={filtros.usos.includes(uso)}
                rotulo={uso}
                aoClicar={() => atualizar({ usos: alternar(filtros.usos, uso) })}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Área construída">
          <div className="flex flex-wrap gap-1.5">
            <Chip ativo={filtros.areas.length === 0} rotulo="Todas" aoClicar={() => atualizar({ areas: [] })} />
            {FAIXAS_AREA.map((faixa) => (
              <Chip
                key={faixa.id}
                ativo={filtros.areas.includes(faixa.id)}
                rotulo={faixa.rotulo}
                aoClicar={() => atualizar({ areas: alternar(filtros.areas, faixa.id) })}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Custo estimado de obra">
          <div className="flex flex-wrap gap-1.5">
            <Chip ativo={filtros.custos.length === 0} rotulo="Todos" aoClicar={() => atualizar({ custos: [] })} />
            {FAIXAS_CUSTO.map((faixa) => (
              <Chip
                key={faixa.id}
                ativo={filtros.custos.includes(faixa.id)}
                rotulo={faixa.rotulo}
                aoClicar={() => atualizar({ custos: alternar(filtros.custos, faixa.id) })}
              />
            ))}
          </div>
        </Secao>

        <Secao titulo="Subvenção teórica (teto estimado)">
          <div className="flex flex-wrap gap-1.5">
            <Chip ativo={filtros.tetos.length === 0} rotulo="Todas" aoClicar={() => atualizar({ tetos: [] })} />
            {FAIXAS_TETO.map((faixa) => (
              <Chip
                key={faixa.id}
                ativo={filtros.tetos.includes(faixa.id)}
                rotulo={faixa.rotulo}
                aoClicar={() => atualizar({ tetos: alternar(filtros.tetos, faixa.id) })}
              />
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-fg-subtle">
            Teto teórico = custo estimado × 25%. Não é valor concedido nem direito adquirido.
          </p>
        </Secao>
      </div>
    </div>
  )
}
