#!/usr/bin/env node
/*
 * Geometrias oficiais dos perímetros incentivados e das divisas distritais.
 *
 * Fonte: WFS oficial do GeoSampa (Prefeitura de São Paulo / PRODAM).
 *   geoportal:requalifica_centro_perimetro_geral — Lei 17.577/2021 e leis que
 *     acrescentaram setores ao Perímetro Área Central;
 *   geoportal:perimetro_aiu — Áreas de Intervenção Urbana (usamos a do Setor
 *     Central / Centro Metropolitano);
 *   geoportal:distrito_municipal — divisas distritais.
 *
 * Regras deste script:
 *  1. Roda no build. Se a fonte oficial não responder (rede, indisponibilidade),
 *     apenas registra aviso e NÃO falha o build — o mapa continua funcionando no
 *     modo "destaque territorial" (sem polígono desenhado).
 *  2. A geometria gravada é SIMPLIFICADA para visualização. A classificação de
 *     cada imóvel (dentro/intersecta/fora) é feita no ETL com a geometria
 *     completa — este arquivo não é fonte de cálculo, apenas de desenho.
 *  3. Tudo é declarado no próprio arquivo de saída (fonte, data, tolerância).
 *
 * Saída: public/data/perimetros.json (consumido em runtime pelo mapa).
 */

const fs = require('fs')
const path = require('path')

const WFS_BASE = 'http://wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/ows'
const ROOT = path.resolve(__dirname, '..')
const SAIDA = path.join(ROOT, 'public', 'data', 'perimetros.json')
const TOLERANCIA_PADRAO = 0.0003 // ~33 m
const TOLERANCIA_DISTRITOS = 0.001 // ~110 m (divisas só orientam leitura)
const TAMANHO_MAXIMO = 1_500_000 // bytes
const BBOX_CENTRAL = { sul: -23.605, oeste: -46.705, norte: -23.495, leste: -46.565 }

async function buscar(typeName, { cqlFilter, tolerancia, timeoutMs = 30000 } = {}) {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '1.0.0',
    request: 'GetFeature',
    typeName,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
  })
  if (tolerancia) params.set('format_options', `simplify:${tolerancia}`)
  if (cqlFilter) params.set('CQL_FILTER', cqlFilter)
  const url = `${WFS_BASE}?${params.toString()}`

  const controlador = new AbortController()
  const timer = setTimeout(() => controlador.abort(), timeoutMs)
  try {
    const resposta = await fetch(url, {
      headers: { 'User-Agent': 'RadarRetrofitSP-build/1.0 (+https://radar-retrofit-sp.vercel.app)' },
      signal: controlador.signal,
    })
    const texto = await resposta.text()
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    if (texto.trim().startsWith('<')) throw new Error('resposta XML/erro do WFS')
    const json = JSON.parse(texto)
    if (!json || !Array.isArray(json.features) || !json.features.length) throw new Error('sem feições')
    return { json, url }
  } finally {
    clearTimeout(timer)
  }
}

/** Douglas-Peucker em graus (tolerância aproximada). */
function simplificar(pontos, tolerancia) {
  if (pontos.length <= 4) return pontos
  const [primeiro] = pontos
  const ultimo = pontos[pontos.length - 1]
  let indiceMax = 0
  let distanciaMax = 0
  for (let i = 1; i < pontos.length - 1; i += 1) {
    const distancia = distanciaPontoSegmento(pontos[i], primeiro, ultimo)
    if (distancia > distanciaMax) {
      distanciaMax = distancia
      indiceMax = i
    }
  }
  if (distanciaMax <= tolerancia) return [primeiro, ultimo]
  const esquerda = simplificar(pontos.slice(0, indiceMax + 1), tolerancia)
  const direita = simplificar(pontos.slice(indiceMax), tolerancia)
  return esquerda.slice(0, -1).concat(direita)
}

function distanciaPontoSegmento(ponto, inicio, fim) {
  const [x, y] = ponto
  const [x1, y1] = inicio
  const [x2, y2] = fim
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}

function arredondar(pontos) {
  return pontos.map(([lng, lat]) => [Number(lng.toFixed(5)), Number(lat.toFixed(5))])
}

function simplificarGeometria(geometria, tolerancia) {
  if (!geometria) return null
  const tipo = geometria.type
  if (tipo === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: geometria.coordinates.map((anel) => arredondar(simplificar(anel, tolerancia))),
    }
  }
  if (tipo === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geometria.coordinates.map((poligono) =>
        poligono.map((anel) => arredondar(simplificar(anel, tolerancia)))
      ),
    }
  }
  return null
}

function bboxDaGeometria(geometria) {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity
  const aneis =
    geometria.type === 'Polygon'
      ? geometria.coordinates
      : geometria.type === 'MultiPolygon'
        ? geometria.coordinates.flat()
        : []
  aneis.forEach((anel) =>
    anel.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng
      if (lat < minLat) minLat = lat
      if (lng > maxLng) maxLng = lng
      if (lat > maxLat) maxLat = lat
    })
  )
  return { minLng, minLat, maxLng, maxLat }
}

function interessaBbox(geometria) {
  const b = bboxDaGeometria(geometria)
  return !(
    b.maxLng < BBOX_CENTRAL.oeste ||
    b.minLng > BBOX_CENTRAL.leste ||
    b.maxLat < BBOX_CENTRAL.sul ||
    b.minLat > BBOX_CENTRAL.norte
  )
}

function montarCamada(features, { id, nome, descricao, fonte, tolerancia, filtroPropriedades }) {
  const colecao = { type: 'FeatureCollection', features }
  return {
    id,
    nome,
    descricao,
    fonte,
    toleranciaGraus: tolerancia,
    propriedadesOriginais: filtroPropriedades,
    data: colecao,
  }
}

/** Falha de rede na primeira tentativa: não insiste nas demais camadas. */
function ehFalhaDeRede(mensagem) {
  return /fetch failed|aborted|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|abort/i.test(String(mensagem))
}

async function main() {
  const executadoEm = new Date().toISOString()
  const camadas = {}
  let redeIndisponivel = false

  try {
    const { json, url } = await buscar('geoportal:requalifica_centro_perimetro_geral', { tolerancia: TOLERANCIA_PADRAO })
    const features = json.features
      .map((f) => {
        const geometria = simplificarGeometria(f.geometry, TOLERANCIA_PADRAO)
        if (!geometria) return null
        const p = f.properties || {}
        return {
          type: 'Feature',
          geometry: geometria,
          properties: {
            nome: p.nm_perimetro || 'Perímetro Área Central',
            lei: p.dc_lei || null,
            link: p.tx_link_site || null,
            areaM2: p.qt_area_metro || null,
          },
        }
      })
      .filter(Boolean)
    if (features.length) {
      camadas.requalifica = montarCamada(features, {
        id: 'requalifica',
        nome: 'Requalifica Centro (Lei nº 17.577/2021)',
        descricao: 'Perímetro Área Central e setores acrescidos por leis posteriores.',
        fonte: url,
        tolerancia: TOLERANCIA_PADRAO,
        filtroPropriedades: 'nm_perimetro, dc_lei, tx_link_site, qt_area_metro',
      })
      console.log(`  [perimetros] Requalifica Centro: ${features.length} feição(ões)`)
    }
  } catch (erro) {
    console.warn(`  [perimetros] Requalifica Centro indisponível: ${String(erro.message).slice(0, 160)}`)
    if (ehFalhaDeRede(erro.message)) redeIndisponivel = true
  }

  try {
    if (redeIndisponivel) throw new Error('rede indisponível — camada não consultada')
    const { json, url } = await buscar('geoportal:perimetro_aiu', { tolerancia: TOLERANCIA_PADRAO })
    const normalizados = json.features
      .map((f) => {
        const geometria = simplificarGeometria(f.geometry, TOLERANCIA_PADRAO)
        if (!geometria) return null
        const p = f.properties || {}
        return {
          type: 'Feature',
          geometry: geometria,
          properties: {
            nome: p.nm_perimetro || 'Perímetro AIU',
            tipo: p.tx_tipo_perimetro || null,
            lei: p.nm_lei || null,
            numeroLei: p.cd_numero_lei || null,
            areaHectare: p.qt_area_hectare || null,
          },
        }
      })
      .filter(Boolean)

    const doSetorCentral = normalizados.filter((f) => /central|centro metropolitano/i.test(`${f.properties.nome} ${f.properties.tipo ?? ''}`))
    const escolhidas = doSetorCentral.length ? doSetorCentral : normalizados

    if (escolhidas.length) {
      camadas.aiu = montarCamada(escolhidas, {
        id: 'aiu',
        nome: 'AIU Setor Central',
        descricao: doSetorCentral.length
          ? 'Área de Intervenção Urbana do Setor Central (Centro Metropolitano).'
          : 'Perímetros de AIU publicados na camada oficial (sem recorte nominal do Setor Central).',
        fonte: url,
        tolerancia: TOLERANCIA_PADRAO,
        filtroPropriedades: 'nm_perimetro, tx_tipo_perimetro, nm_lei',
      })
      console.log(`  [perimetros] AIU: ${escolhidas.length} feição(ões) (${normalizados.length} na camada)`)
    }
  } catch (erro) {
    console.warn(`  [perimetros] AIU indisponível: ${String(erro.message).slice(0, 160)}`)
    if (ehFalhaDeRede(erro.message)) redeIndisponivel = true
  }

  try {
    if (redeIndisponivel) throw new Error('rede indisponível — camada não consultada')
    const { json, url } = await buscar('geoportal:distrito_municipal', { tolerancia: TOLERANCIA_DISTRITOS })
    const features = json.features
      .map((f) => {
        const geometria = simplificarGeometria(f.geometry, TOLERANCIA_DISTRITOS)
        if (!geometria) return null
        if (!interessaBbox(geometria)) return null
        const p = f.properties || {}
        return {
          type: 'Feature',
          geometry: geometria,
          properties: {
            nome: p.nm_distrito_municipal || null,
            sigla: p.sg_distrito_municipal || null,
            areaM2: p.qt_area_metro || null,
          },
        }
      })
      .filter(Boolean)
    if (features.length) {
      camadas.distritos = montarCamada(features, {
        id: 'distritos',
        nome: 'Limites distritais (área central)',
        descricao: 'Divisas dos distritos municipais que interceptam a área de interesse do Radar.',
        fonte: url,
        tolerancia: TOLERANCIA_DISTRITOS,
        filtroPropriedades: 'nm_distrito_municipal, sg_distrito_municipal, qt_area_metro',
      })
      console.log(`  [perimetros] Distritos: ${features.length} feição(ões)`)
    }
  } catch (erro) {
    console.warn(`  [perimetros] Distritos indisponíveis: ${String(erro.message).slice(0, 160)}`)
  }

  if (!Object.keys(camadas).length) {
    console.warn('  [perimetros] nenhuma geometria obtida — mapa seguirá em modo destaque (sem polígonos).')
    return
  }

  let saida = {
    geradoEm: executadoEm,
    fonte: 'WFS oficial GeoSampa (Prefeitura de São Paulo)',
    aviso:
      'Geometria simplificada apenas para desenho no mapa. A classificação de perímetro de cada imóvel é feita no ETL com a geometria oficial completa.',
    camadas,
  }

  let serializado = JSON.stringify(saida)
  if (serializado.length > TAMANHO_MAXIMO && saida.camadas.distritos) {
    delete saida.camadas.distritos
    serializado = JSON.stringify(saida)
    console.warn('  [perimetros] divisas distritais removidas: arquivo acima do limite de tamanho.')
  }

  fs.mkdirSync(path.dirname(SAIDA), { recursive: true })
  fs.writeFileSync(SAIDA, serializado)
  console.log(`  [perimetros] gravado ${path.relative(ROOT, SAIDA)} (${(serializado.length / 1024).toFixed(0)} KB)`)
}

main().catch((erro) => {
  console.warn(`  [perimetros] falha inesperada (build segue sem geometria): ${erro.message}`)
})
