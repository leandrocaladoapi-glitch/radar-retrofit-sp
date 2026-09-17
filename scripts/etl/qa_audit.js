#!/usr/bin/env node
/*
 * AUDITORIA DE INTEGRIDADE — 100% da base publicada + amostra de 10 registros.
 * Falha (exit 1) se qualquer oportunidade publicada violar os requisitos.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'src/data');
const INTERNAL = path.join(ROOT, 'data-internal');

const ops = JSON.parse(fs.readFileSync(path.join(DATA, 'oportunidades.json'), 'utf8'));

const PADROES_SINTETICOS = [/im[óo]vel potencial/i, /endere[çc]o cadastral \(sql/i, /projeto requalifica \d+$/i, /lorem/i, /exemplo/i];

const problemas = [];

function check(op, cond, msg) { if (!cond) problemas.push(`${op.sql || op.id}: ${msg}`); }

for (const op of ops) {
  check(op, op.sql && /^\d{3}\.\d{3}\.\d{4}-\d?$/.test(op.sql), 'SQL cadastral inválido');
  check(op, op.logradouro && op.numero, 'endereço incompleto');
  check(op, !PADROES_SINTETICOS.some((r) => r.test(op.nome || '')), 'nome sintético detectado');
  check(op, op.areaConstruida > 0 && op.proveniencia?.areaConstruida?.tipo === 'DADO_OFICIAL', 'área construída sem proveniência oficial');
  check(op, op.usoCadastrado && op.proveniencia?.usoCadastrado?.tipo === 'DADO_OFICIAL', 'uso sem proveniência oficial');
  check(op, op.zoneamento && op.proveniencia?.zoneamento?.tipo === 'DADO_OFICIAL', 'zoneamento sem proveniência oficial');
  check(op, op.distrito, 'distrito ausente');
  check(op, op.geometry && typeof op.lat === 'number', 'geometria ausente');
  check(op, ['dentro', 'intersecta'].includes(op.perimetros?.requalificaCentro?.relacao) || ['dentro', 'intersecta'].includes(op.perimetros?.aiuSetorCentral?.relacao), 'sem relação espacial com perímetro incentivado');
  check(op, op.confidence >= 70, 'Data Confidence abaixo de 70%');
  check(op, Array.isArray(op.fontes) && op.fontes.every((f) => f.url), 'fonte sem URL');
  check(op, op.estimativas?.custoObra?.tipo === 'ESTIMATIVA_RADAR', 'custo não marcado como estimativa');
  check(op, op.estimativas?.tetoSubvencao?.tipo === 'ESTIMATIVA_RADAR', 'subvenção não marcada como estimativa');
  check(op, !op.estimativas?.tetoSubvencao || /at[ée]/i.test(op.estimativas.tetoSubvencao.percentual), 'subvenção apresentada como direito adquirido');
  // score reprodutível
  const soma = (op.scoreComponentes || []).reduce((s, c) => s + c.pontos, 0);
  check(op, Math.abs(Math.min(100, Math.round(soma)) - op.score) < 1, 'score não reproduzível pelos componentes');
  // patrimônio coerente
  if (op.patrimonio && !op.patrimonio.protegido) {
    check(op, !/pr[ée]dio hist[óo]rico/i.test(JSON.stringify(op.motivos || [])), 'linguagem histórica sem proteção registrada');
  }
}

// amostra determinística de 10
const amostra = [];
if (ops.length) {
  const passo = Math.max(1, Math.floor(ops.length / 10));
  for (let i = 0; i < ops.length && amostra.length < 10; i += passo) amostra.push(ops[i]);
}

const relatorio = {
  executadoEm: new Date().toISOString(),
  totalPublicadas: ops.length,
  problemas,
  aprovado: problemas.length === 0,
  amostraQA: amostra.map((o) => ({
    nome: o.nome,
    sql: o.sql,
    distrito: o.distrito,
    areaConstruida: o.areaConstruida,
    uso: o.usoCadastrado,
    zoneamento: o.zoneamento,
    requalificaCentro: o.perimetros?.requalificaCentro?.relacao,
    aiuSetorCentral: o.perimetros?.aiuSetorCentral?.relacao,
    score: o.score,
    confidence: o.confidence,
    consultaFonte: o.fontes?.[0]?.consulta,
  })),
};

fs.mkdirSync(INTERNAL, { recursive: true });
fs.writeFileSync(path.join(INTERNAL, 'qa_report.json'), JSON.stringify(relatorio, null, 2));
console.log(JSON.stringify({ totalPublicadas: ops.length, problemas: problemas.length, aprovado: relatorio.aprovado }, null, 2));
if (problemas.length) {
  console.error(problemas.slice(0, 40).join('\n'));
  process.exit(1);
}
