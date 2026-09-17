#!/usr/bin/env node
/*
 * VERIFICAÇÃO DE INTEGRIDADE — Radar Retrofit SP (`npm run verify:data-integrity`)
 *
 * Falha (exit 1) se encontrar QUALQUER:
 *  - randomização, mock, fixture ou placeholder em código/dados de produção;
 *  - imóvel publicado sem SQL/endereço/geometria/fonte oficial com URL;
 *  - score não reproduzível pelos componentes ou estimativa sem rótulo;
 *  - registro de subvenção cujo conteúdo não exista VERBATIM no PDF oficial;
 *  - indicador incompatível com a base real (recalculado aqui e comparado);
 *  - artigo com afirmação sem evidência, sem fontes ou com link quebrado;
 *  - inconsistência entre oportunidades.json / index / mapa / etl_status.
 *
 * Roda antes do build (ver package.json). FAIL CLOSED.
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const ROOT = path.resolve(__dirname, '..');
const erros = [];
const avisos = [];

function fail(msg) {
  erros.push(msg);
}
function warn(msg) {
  avisos.push(msg);
}
function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function flat(s) {
  return String(s || '')
    .replace(/-\r?\n\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}
function brMoney(n) {
  return Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function brNum(n) {
  return String(n).replace('.', ',');
}
function listaArquivos(dir, exts, fora = []) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.next') continue;
    const p = path.join(dir, e.name);
    if (fora.includes(p)) continue;
    if (e.isDirectory()) out.push(...listaArquivos(p, exts, fora));
    else if (exts.some((x) => p.endsWith(x))) out.push(p);
  }
  return out;
}

/* ============ A. VARREDURA ESTÁTICA (código + dados) ============ */
function varreduraEstatica() {
  const codeFiles = [
    ...listaArquivos(path.join(ROOT, 'scripts'), ['.js']),
    ...listaArquivos(path.join(ROOT, 'src'), ['.ts', '.tsx']),
    ...listaArquivos(path.join(ROOT, '.github'), ['.yml', '.yaml']),
  ];
  // Padrões proibidos em produção. (Construídos dinamicamente para o próprio
  // verificador não se auto-detectar; este arquivo é excluído da varredura.)
  const proibidos = [
    { re: new RegExp('Math' + '\\.' + 'random'), msg: 'aleatoriedade em código de produção' },
    { re: new RegExp('faker|chance' + '\\.' + 'js|casual' + '\\.', 'i'), msg: 'biblioteca de dados falsos' },
  ];
  for (const f of codeFiles) {
    const rel = path.relative(ROOT, f);
    if (rel.includes('verify_data_integrity')) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const { re, msg } of proibidos) {
      if (re.test(txt)) fail(`${rel}: ${msg}`);
    }
  }

  // Termos de dados sintéticos: proibidos em dados publicados e no ETL de produção.
  const dadosEAetl = [
    ...listaArquivos(path.join(ROOT, 'src', 'data'), ['.json']),
    path.join(ROOT, 'scripts', 'fetch_subvencao.js'),
    path.join(ROOT, 'scripts', 'generate_articles.js'),
    path.join(ROOT, 'scripts', 'build_mapa_index.js'),
    path.join(ROOT, 'scripts', 'fetch_perimetros.js'),
  ];
  const termos = [
    /Imóvel Potencial/i,
    /Projeto Requalifica \d/i,
    /\/oportunidades\/op-\d/,
    /Blocos X e Y/,
    /SPE Edifício Martinelli/,
    /\(Projeto B\)/,
    /endereço cadastral \(sql/i,
    /lorem/i,
  ];
  for (const f of dadosEAetl) {
    if (!fs.existsSync(f)) continue;
    const rel = path.relative(ROOT, f);
    let txt = fs.readFileSync(f, 'utf8');
    // Exceções legítimas: documentação de REMOÇÕES (subvencao.json e o
    // orquestrador que a gera citam os nomes removidos como prova da limpeza).
    if (rel === path.join('src', 'data', 'subvencao.json')) {
      txt = txt.replace(/"removidos"\s*:\s*\[[\s\S]*?\n  \]/, '"removidos":[]');
    }
    if (rel === path.join('scripts', 'fetch_subvencao.js')) {
      txt = txt.replace(/const REMOVIDOS = \[[\s\S]*?\n\];/, 'const REMOVIDOS = [];');
    }
    for (const re of termos) {
      if (re.test(txt)) fail(`${rel}: padrão sintético/legado detectado (${re})`);
    }
  }

  // Frases fabricadas conhecidas: proibidas em páginas e dados.
  const frases = [
    /85 oportunidades pré-analisadas/,
    /4º Chamamento Público publicado/,
    /Lançamento estimado do 4º Chamamento/,
    /Inclusão de novos critérios de HIS no perímetro expandido/,
    /Edifício Martinelli teve credenciamento aprovado/,
    /avançou para "Em execução"/,
    /dezenas de fontes de dados/,
    /Consolidamos Diário Oficial, GeoSampa e Portal da Subvenção/,
  ];
  const paginas = listaArquivos(path.join(ROOT, 'src'), ['.tsx', '.ts', '.json']);
  for (const f of paginas) {
    const rel = path.relative(ROOT, f);
    if (rel.includes('verify_data_integrity')) continue;
    const txt = fs.readFileSync(f, 'utf8');
    for (const re of frases) {
      if (re.test(txt)) fail(`${rel}: frase não comprovada detectada (${re})`);
    }
  }

  // Workflow não pode referenciar branch de sessão antiga.
  const wfDir = path.join(ROOT, '.github', 'workflows');
  if (fs.existsSync(wfDir)) {
    for (const f of fs.readdirSync(wfDir)) {
      const txt = fs.readFileSync(path.join(wfDir, f), 'utf8');
      if (/arena\/01a0ad21/.test(txt)) fail(`.github/workflows/${f}: referência a branch de sessão antiga`);
    }
  }
}

/* ============ B. BASE IMOBILIÁRIA ============ */
function baseImobiliaria() {
  const ops = readJSON(path.join(ROOT, 'src', 'data', 'oportunidades.json'));
  if (!Array.isArray(ops) || !ops.length) {
    fail('oportunidades.json vazio — nada a publicar (fail closed)');
    return { ops: [] };
  }
  const sqls = new Set();
  const slugs = new Set();
  const sint = [/im[óo]vel potencial/i, /endere[çc]o cadastral \(sql/i, /projeto requalifica \d+$/i, /lorem/i];
  for (const op of ops) {
    const id = op.sql || op.id;
    if (!op.sql || !/^\d{3}\.\d{3}\.\d{4}-\d?$/.test(op.sql)) fail(`${id}: SQL inválido`);
    if (sqls.has(op.sql)) fail(`${id}: SQL duplicado`);
    sqls.add(op.sql);
    if (!op.slug || slugs.has(op.slug)) fail(`${id}: slug ausente/duplicado`);
    slugs.add(op.slug);
    if (!op.logradouro || !op.numero) fail(`${id}: endereço incompleto`);
    if (sint.some((r) => r.test(op.nome || ''))) fail(`${id}: nome sintético`);
    if (typeof op.lat !== 'number' || typeof op.lng !== 'number' || !op.geometry) fail(`${id}: geometria ausente`);
    if (op.lat > -23.4 || op.lat < -23.8 || op.lng > -46.3 || op.lng < -46.9) fail(`${id}: coordenadas fora de SP`);
    if (!(op.areaConstruida > 0)) fail(`${id}: área construída ausente`);
    if (op.proveniencia?.areaConstruida?.tipo !== 'DADO_OFICIAL') fail(`${id}: área sem proveniência oficial`);
    if (!op.proveniencia?.areaConstruida?.url) fail(`${id}: área sem URL de fonte`);
    if (!op.usoCadastrado || op.proveniencia?.usoCadastrado?.tipo !== 'DADO_OFICIAL') fail(`${id}: uso sem proveniência oficial`);
    if (!op.zoneamento || op.proveniencia?.zoneamento?.tipo !== 'DADO_OFICIAL') fail(`${id}: zoneamento sem proveniência oficial`);
    if (!op.distrito) fail(`${id}: distrito ausente`);
    if (!Array.isArray(op.fontes) || !op.fontes.length || !op.fontes.every((f) => f.url)) fail(`${id}: fonte sem URL`);
    if (!op.fontes[0]?.consulta || !/wfs\.geosampa/.test(op.fontes[0].consulta)) fail(`${id}: sem consulta WFS reprodutível`);
    if (!(op.confidence >= 70)) fail(`${id}: confidence ${op.confidence} < 70`);
    const soma = (op.scoreComponentes || []).reduce((s, c) => s + c.pontos, 0);
    if (Math.abs(Math.min(100, Math.round(soma)) - op.score) > 0) fail(`${id}: score não reproduzível`);
    if (op.estimativas?.custoObra?.tipo !== 'ESTIMATIVA_RADAR') fail(`${id}: custo sem rótulo ESTIMATIVA_RADAR`);
    if (op.estimativas?.tetoSubvencao?.tipo !== 'ESTIMATIVA_RADAR') fail(`${id}: subvenção sem rótulo ESTIMATIVA_RADAR`);
    if (op.estimativas?.tetoSubvencao && !/at[ée]/i.test(op.estimativas.tetoSubvencao.percentual || '')) {
      fail(`${id}: subvenção apresentada como direito adquirido`);
    }
    const rel = op.perimetros || {};
    const okPer = ['dentro', 'intersecta'].includes(rel.requalificaCentro?.relacao) || ['dentro', 'intersecta'].includes(rel.aiuSetorCentral?.relacao);
    if (!okPer) fail(`${id}: sem relação espacial com perímetro incentivado`);
    if (!op.coletadoEm || !op.ultimaVerificacao) fail(`${id}: sem data de coleta/verificação`);
    if (!Array.isArray(op.motivos) || !op.motivos.length) fail(`${id}: sem justificativa de entrada`);
  }

  // Consistência entre arquivos derivados.
  const index = readJSON(path.join(ROOT, 'src', 'data', 'oportunidades_index.json'));
  if (index.length !== ops.length) fail(`oportunidades_index.json (${index.length}) diverge de oportunidades.json (${ops.length})`);
  const sqlsIndex = new Set(index.map((o) => o.sql));
  if (sqlsIndex.size !== ops.length || ![...sqls].every((s) => sqlsIndex.has(s))) fail('index contém SQLs divergentes da base');
  const status = readJSON(path.join(ROOT, 'src', 'data', 'etl_status.json'));
  if (status.publicadas !== ops.length) fail(`etl_status.publicadas (${status.publicadas}) diverge da base (${ops.length})`);
  const mapaPath = path.join(ROOT, 'src', 'data', 'mapa.json');
  if (fs.existsSync(mapaPath) && fs.statSync(mapaPath).size > 10) {
    const mapa = readJSON(mapaPath);
    if (mapa.total !== ops.length) fail(`mapa.json total (${mapa.total}) diverge da base (${ops.length})`);
  } else {
    warn('mapa.json ausente/vazio — será gerado no build (ordem: build_mapa_index antes de verify)');
  }
  return { ops };
}

/* ============ C. SUBVENÇÃO (verbatim nos PDFs) ============ */
async function subvencao(ops) {
  const { DOCS } = require('./etl/subvencao_docs');
  const textos = {};
  for (const ano of [2023, 2024, 2025]) {
    const buf = fs.readFileSync(path.join(ROOT, 'data-oficial', 'subvencao', DOCS[ano].arquivo));
    textos[ano] = flat((await pdfParse(buf)).text);
  }
  // Metadados do documento precisam existir no próprio PDF.
  const checaDoc = (ano, valores) => {
    for (const v of valores) {
      if (v && !textos[ano].includes(flat(v))) fail(`DOCS[${ano}]: "${v}" não encontrado no PDF oficial`);
    }
  };
  checaDoc(2023, ['01/2023/SMUL', '07/12/2023', '1.1.29']);
  checaDoc(2024, ['02/2024/SMUL', '6011.2024/0000706-7', 'Lote 2', '55/2024', '6068.2024/0005871-1', '106440352', '9534D549', '10/07/2024']);
  checaDoc(2025, ['01/2025/SMUL', '6068.2024/0005871-1', 'Lote 3', '34/2025', '6068.2025/0004742-8', '142837382', '3EB6DE09']);

  const projetos = readJSON(path.join(ROOT, 'src', 'data', 'projetos.json'));
  if (!Array.isArray(projetos) || !projetos.length) fail('projetos.json vazio');
  const ids = new Set();
  const porAno = { 2023: 0, 2024: 0, 2025: 0 };
  for (const p of projetos) {
    if (!p.id || ids.has(p.id)) fail(`projeto sem id ou duplicado: ${p.id}`);
    ids.add(p.id);
    porAno[p.ano] = (porAno[p.ano] || 0) + 1;
    if (!p.interessado) fail(`${p.id}: interessado ausente`);
    if (!p.chamamento || !p.documento || !p.fonteUrl) fail(`${p.id}: proveniência incompleta`);
    if (!fs.existsSync(path.join(ROOT, p.documento.arquivo || ''))) fail(`${p.id}: arquivo de origem não existe`);
    const T = textos[p.ano];
    if (!T) {
      fail(`${p.id}: ano ${p.ano} sem documento oficial`);
      continue;
    }
    // PROVA VERBATIM: cada campo precisa existir no texto do PDF.
    if (!T.includes(flat(p.interessado))) fail(`${p.id}: interessado não encontrado verbatim no PDF ${p.ano}`);
    if (p.endereco && !T.includes(flat(p.endereco))) fail(`${p.id}: endereço não encontrado verbatim no PDF`);
    if (p.processoSei && !T.includes(flat(p.processoSei))) fail(`${p.id}: SEI não encontrado verbatim no PDF`);
    if (p.protocolo) {
      if (!/^SUBVENCAO2024\.\d{10}$/.test(p.protocolo)) fail(`${p.id}: protocolo fora do padrão`);
      if (!T.includes(flat(p.protocolo))) fail(`${p.id}: protocolo não encontrado verbatim no PDF`);
    }
    if (p.ano === 2024 && !p.protocolo && !p.notaProtocolo) fail(`${p.id}: protocolo nulo sem nota explicativa`);
    if (p.valorMaximoSubvencao != null) {
      if (!(p.valorMaximoSubvencao > 0)) fail(`${p.id}: valor inválido`);
      if (!T.includes(flat(brMoney(p.valorMaximoSubvencao)))) fail(`${p.id}: valor ${brMoney(p.valorMaximoSubvencao)} não encontrado verbatim no PDF`);
    }
    if (p.percentualSubvencao != null) {
      if (!(p.percentualSubvencao > 0 && p.percentualSubvencao <= 25)) fail(`${p.id}: percentual fora de 0–25`);
      if (!T.includes(`${brNum(p.percentualSubvencao)}%`)) fail(`${p.id}: percentual ${brNum(p.percentualSubvencao)}% não encontrado verbatim`);
    }
    if (/Blocos X e Y|SPE Edifício Martinelli|\(Projeto B\)/.test(JSON.stringify(p))) fail(`${p.id}: nome fabricado legado`);
  }

  // subvencao.json: sem campos proibidos + indicadores recalculados.
  const subv = readJSON(path.join(ROOT, 'src', 'data', 'subvencao.json'));
  const proibidas = ['orcamentoDisponivel', 'recursosConcedidos', 'recursosPagos'];
  const serialInd = JSON.stringify(subv.indicadores || {});
  for (const k of proibidas) {
    if (k in (subv.indicadores || {})) fail(`subvencao.json: campo não comprovado presente (${k})`);
  }
  if ('chamamentoAtual' in subv) fail('subvencao.json: objeto chamamentoAtual legado presente');
  if (serialInd.includes('undefined')) fail('subvencao.json contém undefined');
  const ind = subv.indicadores || {};
  const esperado = {
    imoveisMonitorados: ops.length,
    oportunidadesScore85: ops.filter((o) => o.score >= 85).length,
    chamamentosComListas: 3,
    interessadosHabilitados2023: porAno[2023],
    interessadosHabilitadosFaseI2024: porAno[2024],
    credenciadosFaseII2025: porAno[2025],
    totalRegistrosSubvencao: projetos.length,
  };
  for (const [k, v] of Object.entries(esperado)) {
    if (ind[k] !== v) fail(`indicador ${k}: publicado=${ind[k]} recalculado=${v}`);
  }
  const soma = Math.round(projetos.filter((p) => p.ano === 2025).reduce((s, p) => s + (p.valorMaximoSubvencao || 0), 0) * 100) / 100;
  if (ind.valorMaximoCredenciado2025FaseII !== soma) {
    fail(`indicador valorMaximoCredenciado2025FaseII: publicado=${ind.valorMaximoCredenciado2025FaseII} recalculado=${soma}`);
  }
  for (const [nome, fato] of Object.entries(subv.programa?.fatos || {})) {
    if (!fato.fontes || !fato.fontes.length || !fato.fontes.every((f) => f.url && f.nome)) {
      fail(`fatos.${nome}: fonte sem nome/URL`);
    }
    if (!fato.verificadoEm) fail(`fatos.${nome}: sem data de verificação`);
  }
  if (!ind.ultimaAtualizacao || Number.isNaN(Date.parse(ind.ultimaAtualizacao))) fail('indicadores.ultimaAtualizacao inválida');
}

/* ============ D. ARTIGOS ============ */
function artigos(ops) {
  const arts = readJSON(path.join(ROOT, 'src', 'data', 'artigos.json'));
  if (!Array.isArray(arts)) {
    fail('artigos.json inválido');
    return;
  }
  const slugs = new Set(ops.map((o) => o.slug));
  const slugsArt = new Set();
  for (const a of arts) {
    if (!a.slug || slugsArt.has(a.slug)) fail(`artigo sem slug ou duplicado: ${a.slug}`);
    slugsArt.add(a.slug);
    if (!a.fontes || !a.fontes.length || !a.fontes.every((f) => f.url && f.nome)) fail(`${a.slug}: artigo sem fontes com nome/URL`);
    if (/undefined/.test(JSON.stringify(a))) fail(`${a.slug}: contém "undefined"`);
    if (/Imóvel Potencial|Projeto Requalifica \d|4º Chamamento|Blocos X e Y/i.test(JSON.stringify(a))) {
      fail(`${a.slug}: conteúdo fabricado legado`);
    }
    const links = [...String(a.conteudo || '').matchAll(/\/oportunidades\/([a-z0-9-]+)/g)].map((m) => m[1]);
    for (const s of links) {
      if (!slugs.has(s)) fail(`${a.slug}: link para oportunidade inexistente (${s})`);
    }
    if (a.evidencias && a.evidencias.totalImoveis != null && a.evidencias.totalImoveis !== ops.length) {
      fail(`${a.slug}: evidencias.totalImoveis (${a.evidencias.totalImoveis}) diverge da base (${ops.length})`);
    }
  }
}

/* ============ E. ATUALIZAÇÕES (se existir) ============ */
function atualizacoes(ops) {
  const p = path.join(ROOT, 'src', 'data', 'atualizacoes.json');
  if (!fs.existsSync(p)) {
    warn('atualizacoes.json ausente — página mostrará estado vazio honesto');
    return;
  }
  const dados = readJSON(p);
  const itens = dados.itens || dados;
  if (!Array.isArray(itens)) {
    fail('atualizacoes.json inválido');
    return;
  }
  const sqls = new Set(ops.map((o) => o.sql));
  for (const it of itens) {
    if (/4º Chamamento|Martinelli teve credenciamento|Em execução/i.test(JSON.stringify(it))) {
      fail('atualizacoes.json: conteúdo fabricado legado');
    }
    if (it.sql && !sqls.has(it.sql)) fail(`atualizacao referencia SQL inexistente (${it.sql})`);
  }
}

(async function main() {
  console.log('== Verificação de integridade do Radar Retrofit SP ==');
  varreduraEstatica();
  const { ops } = baseImobiliaria();
  await subvencao(ops);
  artigos(ops);
  atualizacoes(ops);
  for (const a of avisos) console.log(`AVISO: ${a}`);
  if (erros.length) {
    console.error(`\nFALHA: ${erros.length} problema(s) de integridade:`);
    for (const e of erros.slice(0, 60)) console.error(` - ${e}`);
    if (erros.length > 60) console.error(` ... e mais ${erros.length - 60}`);
    process.exit(1);
  }
  console.log(`\nOK: base íntegra (${ops.length} imóveis verificados, 0 problemas).`);
})().catch((err) => {
  console.error('FALHA NA VERIFICAÇÃO:', err && err.stack ? err.stack : err);
  process.exit(1);
});
