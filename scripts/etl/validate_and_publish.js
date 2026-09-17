#!/usr/bin/env node
/*
 * VALIDAÇÃO AUTOMATIZADA + PUBLICAÇÃO — Radar Retrofit SP
 *
 * Requisitos ELIMINATÓRIOS (não compensáveis por score):
 *   1. endereço real (logradouro + número cadastral)
 *   2. identificação cadastral oficial (SQL)
 *   3. fonte oficial identificada com URL
 *   4. geometria/coordenadas verificáveis
 *   5. relação espacial verificada com perímetro relevante
 *   6. distrito oficial
 *   7. data de coleta
 *   8. justificativa objetiva de entrada
 *   9. sem contradição lógica
 *  10. Data Confidence >= 70
 *
 * Reprovado => NÃO PUBLICA (fica como candidato interno).
 * Publicado que deixa de cumprir => ARQUIVADO (nunca apagado silenciosamente).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'src/data');
const INTERNAL = path.join(ROOT, 'data-internal');

const CONFIDENCE_MINIMO = 70;

function readJSON(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

function validar(op) {
  const falhas = [];
  if (!op.logradouro || !op.numero || String(op.numero).trim() === '' || String(op.numero).toUpperCase() === 'S/N') {
    falhas.push('endereço cadastral incompleto (logradouro/número)');
  }
  if (!op.sql || !/^\d{3}\.\d{3}\.\d{4}-\d?$/.test(op.sql)) falhas.push('SQL cadastral ausente ou fora do padrão oficial');
  if (!Array.isArray(op.fontes) || !op.fontes.length || !op.fontes.every((f) => f.url)) falhas.push('fonte oficial ausente ou sem URL');
  if (typeof op.lat !== 'number' || typeof op.lng !== 'number' || !op.geometry) falhas.push('geometria/coordenadas ausentes');
  if (op.lat > -23.4 || op.lat < -23.8 || op.lng > -46.3 || op.lng < -46.9) falhas.push('coordenadas fora do município de São Paulo');
  const rel = op.perimetros || {};
  const dentroReq = rel.requalificaCentro && rel.requalificaCentro.relacao !== 'fora';
  const dentroAiu = rel.aiuSetorCentral && rel.aiuSetorCentral.relacao !== 'fora';
  if (!dentroReq && !dentroAiu) falhas.push('sem relação espacial verificada com perímetro incentivado');
  if (!op.distrito) falhas.push('distrito oficial ausente');
  if (!op.coletadoEm) falhas.push('data de coleta ausente');
  if (!Array.isArray(op.motivos) || !op.motivos.length) falhas.push('justificativa de entrada ausente');
  if (!(op.areaConstruida > 0)) falhas.push('área construída oficial ausente');
  if (!op.usoCadastrado) falhas.push('uso cadastrado oficial ausente');
  if (op.situacaoLote !== 'ATIVO') falhas.push('lote sem situação cadastral ATIVA');
  // contradições lógicas
  if (op.patrimonio && !op.patrimonio.protegido && /hist[óo]ric|tombad/i.test(JSON.stringify(op.motivos))) {
    falhas.push('contradição: linguagem de patrimônio sem proteção registrada');
  }
  if (op.areaTerreno > 0 && op.areaConstruida > 0 && op.areaConstruida / op.areaTerreno > 60) {
    falhas.push('contradição: coeficiente de aproveitamento cadastral implausível');
  }
  if (!(op.confidence >= CONFIDENCE_MINIMO)) falhas.push(`Data Confidence ${op.confidence}% abaixo do mínimo de ${CONFIDENCE_MINIMO}%`);
  return falhas;
}

function diffCampos(antes, depois) {
  const campos = ['sql', 'nome', 'areaConstruida', 'areaTerreno', 'usoCadastrado', 'zoneamento', 'distrito', 'score', 'confidence'];
  const mudancas = [];
  for (const c of campos) {
    if (JSON.stringify(antes[c]) !== JSON.stringify(depois[c])) {
      mudancas.push({ campo: c, antes: antes[c], depois: depois[c] });
    }
  }
  return mudancas;
}

(function main() {
  const bruto = readJSON(path.join(INTERNAL, 'candidatos_brutos.json'), null);
  if (!bruto || !Array.isArray(bruto.candidatos) || !bruto.candidatos.length) {
    console.error('Sem candidatos coletados das fontes oficiais. Publicação inalterada.');
    process.exit(1);
  }
  const executadoEm = bruto.executadoEm || new Date().toISOString();
  const publicadasAntes = readJSON(path.join(DATA, 'oportunidades.json'), []);
  const historico = readJSON(path.join(INTERNAL, 'historico.json'), { eventos: [] });
  const arquivadas = readJSON(path.join(INTERNAL, 'arquivadas.json'), []);

  const aprovadas = [];
  const retidas = [];

  for (const cand of bruto.candidatos) {
    const falhas = validar(cand);
    if (falhas.length) {
      retidas.push({ id: cand.id, nome: cand.nome, sql: cand.sql, confidence: cand.confidence, falhas });
    } else {
      aprovadas.push({ ...cand, status: 'publicada', validadoEm: executadoEm });
    }
  }

  // ordena por score e confiança (determinístico)
  aprovadas.sort((a, b) => b.score - a.score || b.confidence - a.confidence || a.sql.localeCompare(b.sql));

  // histórico: novas, alteradas, arquivadas
  const antesPorSql = new Map(publicadasAntes.filter((o) => o.sql).map((o) => [o.sql, o]));
  const depoisPorSql = new Map(aprovadas.map((o) => [o.sql, o]));

  for (const [sql, nova] of depoisPorSql) {
    const antiga = antesPorSql.get(sql);
    if (!antiga) {
      historico.eventos.push({ tipo: 'publicada', sql, nome: nova.nome, data: executadoEm, fonte: 'GeoSampa WFS — Cadastro Imobiliário Fiscal' });
    } else {
      const mudancas = diffCampos(antiga, nova);
      for (const m of mudancas) {
        historico.eventos.push({ tipo: 'alteracao', sql, campo: m.campo, antes: m.antes, depois: m.depois, data: executadoEm, fonte: 'GeoSampa WFS' });
      }
    }
  }
  for (const [sql, antiga] of antesPorSql) {
    if (!depoisPorSql.has(sql)) {
      historico.eventos.push({ tipo: 'arquivada', sql, nome: antiga.nome, data: executadoEm, motivo: 'deixou de atender aos critérios de publicação' });
      arquivadas.push({ ...antiga, status: 'arquivada', arquivadaEm: executadoEm, motivo: 'deixou de atender aos critérios de publicação' });
    }
  }

  // registros legados sem SQL oficial (base sintética anterior) -> arquivados
  const legados = publicadasAntes.filter((o) => !o.sql);
  for (const l of legados) {
    arquivadas.push({ ...l, status: 'arquivada', arquivadaEm: executadoEm, motivo: 'registro sintético/não verificável removido da produção' });
    historico.eventos.push({ tipo: 'removida_sintetica', id: l.id, nome: l.endereco || l.nome, data: executadoEm, motivo: 'registro sem vínculo documental com imóvel real' });
  }

  fs.mkdirSync(INTERNAL, { recursive: true });
  fs.writeFileSync(path.join(DATA, 'oportunidades.json'), JSON.stringify(aprovadas, null, 2));

  // Índice leve (sem geometria) usado pela listagem, mapa e pipeline.
  const indice = aprovadas.map((o) => ({
    id: o.id,
    slug: o.slug,
    nome: o.nome,
    sql: o.sql,
    distrito: o.distrito,
    lat: o.lat,
    lng: o.lng,
    areaConstruida: o.areaConstruida,
    areaTerreno: o.areaTerreno,
    usoCadastrado: o.usoCadastrado,
    zoneamento: o.zoneamento,
    score: o.score,
    confidence: o.confidence,
    requalificaCentro: o.perimetros.requalificaCentro.relacao,
    aiuSetorCentral: o.perimetros.aiuSetorCentral.relacao,
    protegido: !!(o.patrimonio && o.patrimonio.protegido),
    motivoPrincipal: o.motivos[0] || null,
    custoEstimadoMilhoes: o.estimativas.custoObra ? o.estimativas.custoObra.valorMilhoes : null,
    ultimaVerificacao: o.ultimaVerificacao,
  }));
  fs.writeFileSync(path.join(DATA, 'oportunidades_index.json'), JSON.stringify(indice, null, 2));
  fs.writeFileSync(path.join(INTERNAL, 'candidatos_retidos.json'), JSON.stringify({ executadoEm, total: retidas.length, criterio: `Data Confidence >= ${CONFIDENCE_MINIMO}% + requisitos eliminatórios`, retidas }, null, 2));
  fs.writeFileSync(path.join(INTERNAL, 'historico.json'), JSON.stringify(historico, null, 2));
  fs.writeFileSync(path.join(INTERNAL, 'arquivadas.json'), JSON.stringify(arquivadas, null, 2));

  const relatorio = {
    executadoEm,
    antes: publicadasAntes.length,
    coletados: bruto.candidatos.length,
    publicadas: aprovadas.length,
    retidasPorConfianca: retidas.length,
    arquivadasTotal: arquivadas.length,
    confidenceMinimo: CONFIDENCE_MINIMO,
  };
  fs.writeFileSync(path.join(INTERNAL, 'ultimo_relatorio_etl.json'), JSON.stringify(relatorio, null, 2));
  fs.writeFileSync(path.join(DATA, 'etl_status.json'), JSON.stringify({
    executadoEm,
    publicadas: aprovadas.length,
    candidatosRetidos: retidas.length,
    arquivadas: arquivadas.length,
    fontes: readJSON(path.join(INTERNAL, 'fontes_conectadas.json'), {}).fontes || {},
  }, null, 2));

  console.log(JSON.stringify(relatorio, null, 2));
})();
