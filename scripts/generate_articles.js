#!/usr/bin/env node
/*
 * GERADOR DE ARTIGOS DO RADAR — à prova de invenção.
 *
 * REGRAS RÍGIDAS:
 *  - Nenhum artigo afirma mudança (novo imóvel, status, valor, aprovação) sem
 *    evento correspondente em data-internal/historico.json.
 *  - Todo número do texto é agregado da base real (array.length, soma, contagem).
 *  - Todo artigo carrega `fontes[]` (nome + URL) e seção "Fontes e evidências".
 *  - Sem aleatoriedade, sem relógio no conteúdo, sem templates com campos de
 *    outro schema. O texto é validado contra "undefined" antes de salvar.
 *  - Sem novidade real => nenhum artigo é gerado (exit 0).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const INTERNAL = path.join(ROOT, 'data-internal');

function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

function fmt(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

function fmtBRL(n) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n || 0);
}

function fmtData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function montaSnapshot({ ops, subv, status, historico, agora }) {
  const total = ops.length;
  const prioritarias = ops.filter((o) => o.score >= 85);
  const tombadas = ops.filter((o) => o.patrimonio && o.patrimonio.protegido);
  const confMedia = total ? Math.round(ops.reduce((s, o) => s + o.confidence, 0) / total) : 0;
  const top3 = [...ops].sort((a, b) => b.score - a.score || b.confidence - a.confidence).slice(0, 3);
  const eventos = historico.eventos || [];
  const porTipo = eventos.reduce((acc, e) => {
    acc[e.tipo] = (acc[e.tipo] || 0) + 1;
    return acc;
  }, {});
  const ind = subv.indicadores || {};

  const fontes = [
    { nome: 'Cadastro Imobiliário Fiscal — camada Lote (GeoSampa)', url: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/62c1113c-36a4-43d1-b763-81ec63b58116' },
    { nome: 'Requalifica Centro — Lei nº 17.577/2021', url: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-17577-de-20-de-julho-de-2021' },
    { nome: 'Zoneamento — LPUOS Lei nº 18.177/2024', url: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-18177-de-25-de-julho-de-2024' },
    { nome: 'Portal da Subvenção Econômica (SMUL)', url: 'https://subvencao.prefeitura.sp.gov.br' },
    { nome: 'Metodologia do Radar', url: '/metodologia' },
  ];

  const titulo = `Base do Radar: ${fmt(total)} imóveis reais monitorados no Centro — ${fmtData(agora)}`;
  const slug = `base-do-radar-${fmt(total)}-imoveis-${agora.slice(0, 10)}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const conteudo = `
<p class="lead text-lg text-slate-600 mb-6">Retrato verificável da base do Radar Retrofit SP em ${fmtData(agora)}: ${fmt(total)} imóveis reais da área central, extraídos do Cadastro Imobiliário Fiscal (GeoSampa) e cruzados por geometria com os perímetros oficiais de incentivo. Nenhum número abaixo é estimativa editorial — todos são agregados da base publicada.</p>

<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">O que a base contém</h2>
<ul class="list-disc pl-5 space-y-1 mb-4">
  <li><strong>${fmt(total)} imóveis publicados</strong>, cada um com SQL cadastral, endereço oficial, geometria do lote e proveniência por campo.</li>
  <li><strong>${fmt(prioritarias.length)} com Opportunity Score ≥ 85</strong> (análise do Radar sobre dados oficiais — ver metodologia).</li>
  <li><strong>${fmt(tombadas.length)} com proteção patrimonial registrada</strong> na camada oficial de bens tombados (CONPRESP/CONDEPHAAT/IPHAN).</li>
  <li><strong>Data Confidence médio de ${confMedia}%</strong> (mínimo de publicação: 70%; ${fmt(status.candidatosRetidos || 0)} candidatos retidos internamente por não atingir os critérios).</li>
  <li><strong>${fmt(ind.totalRegistrosSubvencao || 0)} registros de subvenção</strong> extraídos das listas oficiais da SMUL (${fmt(ind.interessadosHabilitados2023 || 0)} habilitados em 2023, ${fmt(ind.interessadosHabilitadosFaseI2024 || 0)} na Fase I de 2024, ${fmt(ind.credenciadosFaseII2025 || 0)} credenciados na Fase II de 2025).</li>
</ul>

<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Maiores Opportunity Scores da base atual</h2>
<p class="mb-4">Classificação determinística (score, desempate por confiança e SQL). O score é análise do Radar, não dado da Prefeitura:</p>
<ul class="space-y-4 mb-6">
  ${top3.map((op) => `
  <li class="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
    <a href="/oportunidades/${esc(op.slug)}" class="font-bold text-blue-700 hover:underline text-lg block mb-1">${esc(op.nome)}</a>
    <span class="text-sm text-slate-500 block mb-2">SQL ${esc(op.sql)} • ${fmt(op.areaConstruida)} m² • Score <strong class="text-slate-800">${op.score}/100</strong> • Confiança ${op.confidence}%</span>
    <p class="text-sm text-slate-600">${esc(op.motivos && op.motivos[0])}</p>
  </li>`).join('')}
</ul>

<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Movimentações registradas pelo ETL</h2>
<p class="mb-4">Histórico auditável de execuções do pipeline (antes/depois por campo): ${fmt(porTipo.publicada || 0)} publicações, ${fmt(porTipo.alteracao || 0)} alterações de campo e ${fmt(porTipo.removida_sintetica || 0)} remoções de registros sintéticos legados. Última execução: ${fmtData(status.executadoEm || agora)}.</p>

<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Limites do que afirmamos</h2>
<p class="mb-4">Custos de obra e tetos de subvenção por imóvel são <strong>estimativas paramétricas do Radar</strong>, nunca valores oficiais. Ocupação, vacância, situação dominial e condições estruturais não constam das fontes públicas e não são afirmadas. A lista completa de fontes e a metodologia estão linkadas abaixo.</p>

<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Fontes e evidências</h2>
<ul class="list-disc pl-5 space-y-1 mb-4">
  ${fontes.map((f) => `<li><a href="${esc(f.url)}" class="text-blue-700 hover:underline"${f.url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(f.nome)}</a></li>`).join('')}
</ul>
`;

  return {
    id: `art-${slug}`,
    title: titulo,
    slug,
    dataPublicacao: agora,
    dataAtualizacao: agora,
    descricao: `Retrato auditável da base em ${fmtData(agora)}: ${fmt(total)} imóveis reais, ${fmt(prioritarias.length)} com score ≥ 85 e ${fmt(ind.totalRegistrosSubvencao || 0)} registros de subvenção das listas SMUL.`,
    categoria: 'Radar',
    tags: ['Base de dados', 'Transparência', 'GeoSampa', 'SMUL'],
    conteudo,
    fontes,
    evidencias: {
      tipo: 'snapshot-base',
      executadoEm: agora,
      totalImoveis: total,
      score85: prioritarias.length,
      protegidos: tombadas.length,
      confiancaMedia: confMedia,
      eventosPorTipo: porTipo,
      etlExecutadoEm: status.executadoEm || null,
    },
  };
}

function montaAtualizacao({ novos, alteracoes, arquivadas, ops, agora }) {
  const total = ops.length;
  const exemplos = novos.slice(0, 3)
    .map((e) => ops.find((o) => o.sql === e.sql))
    .filter(Boolean);
  const fontes = [
    { nome: 'Cadastro Imobiliário Fiscal — camada Lote (GeoSampa)', url: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/62c1113c-36a4-43d1-b763-81ec63b58116' },
    { nome: 'Metodologia do Radar', url: '/metodologia' },
  ];
  const slug = `atualizacao-etl-${agora.slice(0, 10)}-${novos.length}n-${alteracoes.length}a-${arquivadas.length}r`;
  const titulo = `Atualização da base: ${novos.length} ${novos.length === 1 ? 'novo imóvel' : 'novos imóveis'} publicados — ${fmtData(agora)}`;
  const conteudo = `
<p class="lead text-lg text-slate-600 mb-6">O pipeline do Radar publicou ${fmt(novos.length)} ${novos.length === 1 ? 'novo imóvel' : 'novos imóveis'}, registrou ${fmt(alteracoes.length)} ${alteracoes.length === 1 ? 'alteração' : 'alterações'} de campo e arquivou ${fmt(arquivadas.length)} ${arquivadas.length === 1 ? 'registro' : 'registros'} desde a última atualização. A base soma agora ${fmt(total)} imóveis reais.</p>
${exemplos.length ? `
<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Novos imóveis publicados</h2>
<ul class="space-y-4 mb-6">
  ${exemplos.map((op) => `
  <li class="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
    <a href="/oportunidades/${esc(op.slug)}" class="font-bold text-blue-700 hover:underline text-lg block mb-1">${esc(op.nome)}</a>
    <span class="text-sm text-slate-500 block mb-2">SQL ${esc(op.sql)} • ${fmt(op.areaConstruida)} m² • Score <strong class="text-slate-800">${op.score}/100</strong></span>
  </li>`).join('')}
</ul>` : ''}
<p class="mb-4">Cada imóvel acima possui página com proveniência por campo e links para as consultas oficiais. Registros arquivados deixaram de atender aos critérios de publicação e permanecem no histórico interno para auditoria.</p>
<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Fontes e evidências</h2>
<ul class="list-disc pl-5 space-y-1 mb-4">
  ${fontes.map((f) => `<li><a href="${esc(f.url)}" class="text-blue-700 hover:underline"${f.url.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(f.nome)}</a></li>`).join('')}
</ul>
`;
  return {
    id: `art-${slug}`,
    title: titulo,
    slug,
    dataPublicacao: agora,
    dataAtualizacao: agora,
    descricao: `O pipeline publicou ${novos.length} novos imóveis e registrou ${alteracoes.length} alterações. Base atual: ${fmt(total)} imóveis reais.`,
    categoria: 'Atualização',
    tags: ['ETL', 'Base de dados', 'Transparência'],
    conteudo,
    fontes,
    evidencias: { tipo: 'atualizacao-etl', executadoEm: agora, novos: novos.length, alteracoes: alteracoes.length, arquivadas: arquivadas.length, totalImoveis: total },
  };
}

function main() {
  console.log('Gerador de artigos (modo evidência)...');
  const agora = new Date().toISOString();
  const ops = readJSON(path.join(DATA, 'oportunidades.json'), []);
  const subv = readJSON(path.join(DATA, 'subvencao.json'), {});
  const status = readJSON(path.join(DATA, 'etl_status.json'), {});
  const historico = readJSON(path.join(INTERNAL, 'historico.json'), { eventos: [] });
  let artigos = readJSON(path.join(DATA, 'artigos.json'), []);

  if (!Array.isArray(artigos)) artigos = [];
  if (!Array.isArray(ops) || !ops.length) {
    console.log('Base de oportunidades vazia — nenhum artigo gerado.');
    return;
  }

  const ultimoCorte = artigos.reduce((max, a) => {
    const c = (a.evidencias && a.evidencias.executadoEm) || a.dataPublicacao || '';
    return c > max ? c : max;
  }, '');
  const eventos = (historico.eventos || []).filter((e) => e.data && e.data > ultimoCorte);
  const novos = eventos.filter((e) => e.tipo === 'publicada');
  const alteracoes = eventos.filter((e) => e.tipo === 'alteracao');
  const arquivadas = eventos.filter((e) => e.tipo === 'arquivada' || e.tipo === 'removida_sintetica');

  let novo = null;
  const temSnapshot = artigos.some((a) => a.evidencias && a.evidencias.tipo === 'snapshot-base');
  if (!temSnapshot) {
    novo = montaSnapshot({ ops, subv, status, historico, agora });
  } else if (novos.length || alteracoes.length || arquivadas.length) {
    novo = montaAtualizacao({ novos, alteracoes, arquivadas, ops, agora });
  }

  if (!novo) {
    console.log('Sem novidade real desde o último artigo — nada gerado.');
    return;
  }
  if (artigos.some((a) => a.slug === novo.slug)) {
    console.log(`Artigo ${novo.slug} já existe — nada gerado.`);
    return;
  }
  // Trava final: texto jamais pode conter "undefined" (campo de schema errado).
  const serial = JSON.stringify(novo);
  if (/undefined/.test(serial)) {
    console.error('Artigo descartado: contém "undefined" (schema incompatível).');
    process.exit(1);
  }
  if (!novo.fontes || !novo.fontes.length || !novo.fontes.every((f) => f.url)) {
    console.error('Artigo descartado: sem fontes com URL.');
    process.exit(1);
  }

  artigos = [novo, ...artigos].slice(0, 50);
  fs.writeFileSync(path.join(DATA, 'artigos.json'), JSON.stringify(artigos, null, 2));
  console.log(`Artigo gerado: ${novo.slug}`);
}

main();
