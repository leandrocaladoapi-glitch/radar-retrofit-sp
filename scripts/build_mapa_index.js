#!/usr/bin/env node
/*
 * Gera src/data/mapa.json — base usada exclusivamente pelo Mapa de Oportunidades.
 *
 * Fontes (arquivos já publicados pelo ETL oficial):
 *  - src/data/oportunidades.json (registry completo, com proveniência por campo)
 *  - src/data/projetos.json (lista de interessados habilitados / credenciados)
 *
 * Este script é PURO: não acessa rede e não inventa dado algum — apenas projeta,
 * a partir da base publicada, os campos necessários para o mapa.
 *
 * FORMATO: registros em colunas (arrays alinhados ao vetor `campos`).
 * Isso mantém o payload enviado ao navegador ~3x menor que o JSON escrito por
 * extenso, sem perder rastreabilidade — o significado de cada coluna está em
 * `campos` e o decodificador vive em src/lib/mapa.ts.
 *
 * A tipologia do ponto é derivada de atributos oficiais:
 *   - score calculado pelo Radar (0–100)
 *   - situação patrimonial da camada oficial de bens tombados (GeoSampa)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

const CAMPOS = [
  'id',
  'slug',
  'nome',
  'sql',
  'distrito',
  'lat',
  'lng',
  'areaConstruida',
  'areaTerreno',
  'usoCadastrado',
  'zoneamento',
  'score',
  'confidence',
  'tipo',
  'situacaoPatrimonial',
  'nivelPatrimonial',
  'relacaoPatrimonial',
  'zepec',
  'resolucaoPatrimonial',
  'requalificaCentro',
  'perimetroRequalifica',
  'aiuSetorCentral',
  'custoMilhoes',
  'tetoSubvencaoMilhoes',
  'ultimaVerificacao',
];

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf8'));
  } catch (err) {
    return fallback;
  }
}

function round(value, decimals) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

/** Situação patrimonial normalizada (fonte oficial: camada de bens tombados). */
function situacaoPatrimonial(op) {
  const reg = op.patrimonio && op.patrimonio.registro ? op.patrimonio.registro : null;
  if (!reg) return { protegido: false, situacao: null, nivel: null, relacao: null, zepec: null, resolucao: null };
  const situacao = reg.situacao ? String(reg.situacao).trim() : null;
  const emProcesso = /APT|ESTUDO|PROCESSO/i.test(situacao || '');
  const tombado = /TOMBAD/i.test(situacao || '');
  return {
    // "protegido" = tombado ou em processo de tombamento reconhecido na fonte oficial
    protegido: tombado || emProcesso,
    situacao,
    nivel: reg.nivel || null,
    relacao: reg.relacao || null,
    zepec: reg.zepec || null,
    resolucao: reg.resolucaoConpresp || reg.resolucaoCondephaat || reg.resolucaoIphan || null,
  };
}

/*
 * Tipologia do ponto no mapa (hierarquia explícita, sem sobreposição):
 *  tombado_prioritario > tombado > oportunidade_prioritaria > oportunidade
 * O corte de "prioritário" é o mesmo em toda a plataforma: Opportunity Score >= 85.
 */
const CORTE_PRIORITARIO = 85;

function tipologia(score, patrimonio) {
  const prioritario = score >= CORTE_PRIORITARIO;
  if (patrimonio.protegido) return prioritario ? 'tombado_prioritario' : 'tombado';
  return prioritario ? 'oportunidade_prioritaria' : 'oportunidade';
}

function main() {
  const oportunidades = readJSON('oportunidades.json', []);
  const projetos = readJSON('projetos.json', []);

  if (!Array.isArray(oportunidades) || !oportunidades.length) {
    console.error('build_mapa_index: src/data/oportunidades.json vazio ou inexistente — mapa.json preservado.');
    process.exit(1);
  }

  const registros = oportunidades
    .filter((op) => typeof op.lat === 'number' && typeof op.lng === 'number')
    .map((op) => {
      const patrimonio = situacaoPatrimonial(op);
      const score = typeof op.score === 'number' ? op.score : 0;
      const custo = op.estimativas && op.estimativas.custoObra ? op.estimativas.custoObra.valorMilhoes : null;
      const teto = op.estimativas && op.estimativas.tetoSubvencao ? op.estimativas.tetoSubvencao.valorMilhoes : null;
      const perimetros = op.perimetros || {};
      return [
        op.id,
        op.slug,
        op.nome,
        op.sql || null,
        op.distrito || null,
        round(op.lat, 5),
        round(op.lng, 5),
        round(op.areaConstruida, 0),
        round(op.areaTerreno, 0),
        op.usoCadastrado || null,
        op.zoneamento || null,
        score,
        op.confidence || null,
        tipologia(score, patrimonio),
        patrimonio.situacao,
        patrimonio.nivel,
        patrimonio.relacao,
        patrimonio.zepec,
        patrimonio.resolucao,
        perimetros.requalificaCentro ? perimetros.requalificaCentro.relacao : 'fora',
        perimetros.requalificaCentro ? perimetros.requalificaCentro.perimetro : null,
        perimetros.aiuSetorCentral ? perimetros.aiuSetorCentral.relacao : 'fora',
        round(custo, 1),
        round(teto, 1),
        op.ultimaVerificacao || op.coletadoEm || null,
      ];
    });

  const lats = registros.map((r) => r[CAMPOS.indexOf('lat')]);
  const lngs = registros.map((r) => r[CAMPOS.indexOf('lng')]);

  const saida = {
    geradoEm: new Date().toISOString(),
    fonte:
      'src/data/oportunidades.json — ETL GeoSampa (cadastro imobiliário fiscal, Requalifica Centro, AIU Setor Central, zoneamento LPUOS, bens tombados).',
    metodo:
      'Projeção 1:1 da base publicada. Nenhum registro é criado, removido ou reinterpretado aqui além da tipologia derivada de score + situação patrimonial.',
    cortePrioritario: CORTE_PRIORITARIO,
    total: registros.length,
    bounds: [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ],
    projetos: {
      total: Array.isArray(projetos) ? projetos.length : 0,
      georreferenciados: 0,
      nota:
        'As listas oficiais de interessados habilitados / credenciados (Portal da Subvenção Econômica) não publicam endereço, SQL ou coordenadas do imóvel. Sem localização oficial, nenhum projeto é plotado no mapa.',
      url: '/projetos',
    },
    campos: CAMPOS,
    registros,
  };

  fs.writeFileSync(path.join(DATA, 'mapa.json'), JSON.stringify(saida));

  const porTipo = registros.reduce((acc, r) => {
    const tipo = r[CAMPOS.indexOf('tipo')];
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});
  const kb = (fs.statSync(path.join(DATA, 'mapa.json')).size / 1024).toFixed(0);
  console.log(`mapa.json gerado: ${registros.length} imóveis · ${kb} KB · ${JSON.stringify(porTipo)}`);
}

main();
