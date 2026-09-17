#!/usr/bin/env node
/*
 * MOTOR DE DESCOBERTA — Radar Retrofit SP
 *
 * FONTES OFICIAIS -> IMÓVEIS REAIS -> NORMALIZAÇÃO -> CRUZAMENTO GEOGRÁFICO
 * -> REGRAS DE OPORTUNIDADE -> CONFIDENCE SCORE -> VALIDAÇÃO -> PUBLICAÇÃO
 *
 * Fontes (todas WFS oficial GeoSampa / Prefeitura de São Paulo):
 *  - geoportal:lote_cidadao ................ Cadastro Imobiliário Fiscal (SQL, endereço, áreas, uso)
 *  - geoportal:requalifica_centro_perimetro_geral ... Programa Requalifica Centro (Lei 17.577/2021)
 *  - geoportal:perimetro_aiu ............... AIU Setor Central
 *  - geoportal:perimetro_zona_lei_18177_24 . Zoneamento vigente (LPUOS)
 *  - geoportal:patrimonio_cultural_bem_tombado ... Bens tombados (CONPRESP/CONDEPHAAT/IPHAN)
 *  - geoportal:distrito_municipal .......... Distritos
 *
 * NÃO HÁ FALLBACK SINTÉTICO. Falha de fonte = aborta sem alterar a base.
 */

const fs = require('fs');
const path = require('path');
const { wfsGetFeature, sourceUrl } = require('./lib/wfs');
const { spatialRelation, centroid, bboxOf, bboxOverlap, pointInPolygon } = require('./lib/geo');
const M = require('./lib/metodologia');

const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'src/data');
const INTERNAL = path.join(ROOT, 'data-internal');

const LAYERS = {
  lote: 'geoportal:lote_cidadao',
  requalifica: 'geoportal:requalifica_centro_perimetro_geral',
  aiu: 'geoportal:perimetro_aiu',
  zoneamento: 'geoportal:perimetro_zona_lei_18177_24',
  tombado: 'geoportal:patrimonio_cultural_bem_tombado',
  distrito: 'geoportal:distrito_municipal',
};

const FONTES = {
  cadastro: {
    nome: 'Cadastro Imobiliário Fiscal — camada Lote (GeoSampa)',
    orgao: 'Prefeitura de São Paulo / Secretaria Municipal da Fazenda (via PRODAM/GeoSampa)',
    camada: LAYERS.lote,
    url: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/62c1113c-36a4-43d1-b763-81ec63b58116',
  },
  requalifica: {
    nome: 'Requalifica Centro — Perímetro Área Central (GeoSampa)',
    orgao: 'Prefeitura de São Paulo / SMUL',
    camada: LAYERS.requalifica,
    url: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-17577-de-20-de-julho-de-2021',
  },
  aiu: {
    nome: 'AIU Setor Central — Perímetros (GeoSampa)',
    orgao: 'Prefeitura de São Paulo / SMUL',
    camada: LAYERS.aiu,
    url: 'https://gestaourbana.prefeitura.sp.gov.br/',
  },
  zoneamento: {
    nome: 'Zoneamento vigente — LPUOS Lei nº 18.177/2024 (GeoSampa)',
    orgao: 'Prefeitura de São Paulo / SMUL',
    camada: LAYERS.zoneamento,
    url: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-18177-de-25-de-julho-de-2024',
  },
  tombado: {
    nome: 'Bem Tombado e/ou em Processo de Tombamento (GeoSampa)',
    orgao: 'CONPRESP / CONDEPHAAT / IPHAN — consolidado por DPH-SMC',
    camada: LAYERS.tombado,
    url: 'https://metadados.geosampa.prefeitura.sp.gov.br/geonetwork/srv/api/records/f3522ff3-df73-4fc4-bff7-0344945f02f8',
  },
  distrito: {
    nome: 'Distrito Municipal (GeoSampa)',
    orgao: 'Prefeitura de São Paulo',
    camada: LAYERS.distrito,
    url: 'http://geosampa.prefeitura.sp.gov.br/',
  },
};

// Janela de busca: área central de São Paulo (EPSG:31983 / SIRGAS2000 UTM 23S)
const BBOX_CENTRO = [331200, 7392800, 337500, 7398500];

// REGRAS DE CANDIDATURA (transparentes, aplicadas na própria consulta oficial)
const REGRAS = {
  areaConstruidaMinima: 3000,
  situacaoLote: 'ATIVO',
  descricao: [
    'Lote com situação cadastral ATIVO no Cadastro Imobiliário Fiscal.',
    'Área construída cadastrada igual ou superior a 3.000 m².',
    'Localizado na área central de São Paulo (janela de busca oficial em SIRGAS2000/UTM 23S).',
    'Relação espacial verificada por geometria com o perímetro do Requalifica Centro e/ou da AIU Setor Central.',
    'Endereço cadastral e SQL oficiais presentes na fonte.',
  ],
};

const TITULOS_LOGRADOURO = {
  R: 'Rua', AV: 'Avenida', PC: 'Praça', LG: 'Largo', AL: 'Alameda', TV: 'Travessa',
  VD: 'Viaduto', VL: 'Vila', EST: 'Estrada', RDV: 'Rodovia', PQ: 'Parque', LD: 'Ladeira',
  BC: 'Beco', PTE: 'Ponte', GL: 'Galeria', PSG: 'Passagem',
};
const ABREV = {
  BRIG: 'Brigadeiro', CEL: 'Coronel', DR: 'Dr.', PROF: 'Prof.', PRES: 'Presidente',
  SEN: 'Senador', DEP: 'Deputado', GEN: 'General', MAL: 'Marechal', STA: 'Santa',
  STO: 'Santo', SAO: 'São', CONS: 'Conselheiro', VISC: 'Visconde', MAR: 'Marquês',
  CAP: 'Capitão', ENG: 'Engenheiro', DES: 'Desembargador', PE: 'Padre', DONA: 'Dona',
};

function titleCase(word) {
  const lower = word.toLowerCase();
  if (['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o'].includes(lower) ) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatarLogradouro(nm) {
  if (!nm) return null;
  const partes = nm.trim().split(/\s+/);
  const out = [];
  partes.forEach((p, i) => {
    const up = p.toUpperCase().replace(/\.$/, '');
    if (i === 0 && TITULOS_LOGRADOURO[up]) { out.push(TITULOS_LOGRADOURO[up]); return; }
    if (ABREV[up]) { out.push(ABREV[up]); return; }
    out.push(titleCase(p));
  });
  return out.join(' ');
}

function formatarSQL(p) {
  const setor = String(p.cd_setor_fiscal || '').padStart(3, '0');
  const quadra = String(p.cd_quadra_fiscal || '').padStart(3, '0');
  const lote = String(p.cd_lote || '').padStart(4, '0');
  const digito = p.cd_digito_sql != null ? String(p.cd_digito_sql) : '';
  if (!p.cd_setor_fiscal || !p.cd_quadra_fiscal || !p.cd_lote) return null;
  return `${setor}.${quadra}.${lote}-${digito}`;
}

function slugify(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function nowISO() { return new Date().toISOString(); }

async function fetchLayer(key, extra = {}) {
  const typeName = LAYERS[key];
  const { json } = await wfsGetFeature({ typeName, ...extra });
  if (!json || !Array.isArray(json.features)) throw new Error(`Resposta inválida da camada ${typeName}`);
  console.log(`  [fonte] ${typeName}: ${json.features.length} feições`);
  return json.features;
}

function pickArea(features, lotGeom) {
  const lb = bboxOf(lotGeom);
  for (const f of features) {
    if (!f.geometry) continue;
    if (!bboxOverlap(lb, bboxOf(f.geometry))) continue;
    const rel = spatialRelation(lotGeom, f.geometry);
    if (rel !== 'fora') return { feature: f, relacao: rel };
  }
  return null;
}

function pickByCentroid(features, lotGeom) {
  const c = centroid(lotGeom);
  if (!c) return null;
  for (const f of features) {
    if (!f.geometry) continue;
    if (pointInPolygon(c, f.geometry)) return f;
  }
  return null;
}

(async function main() {
  const executadoEm = nowISO();
  console.log('== Radar Retrofit SP :: motor de descoberta de imóveis reais ==');
  console.log(`   execução: ${executadoEm}`);

  const bboxLote = `BBOX(ge_poligono,${BBOX_CENTRO.join(',')},'EPSG:31983')`;
  const cqlLote = `${bboxLote} AND qt_area_construida>=${REGRAS.areaConstruidaMinima} AND tx_situ_lote='${REGRAS.situacaoLote}'`;

  console.log('-> coletando camadas oficiais (GeoSampa WFS)');
  const [lotes, requalifica, aiu, zoneamento, tombados, distritos] = await Promise.all([
    fetchLayer('lote', {
      cqlFilter: cqlLote,
      propertyName: 'ge_poligono,cd_setor_fiscal,cd_quadra_fiscal,cd_lote,cd_digito_sql,cd_condominio,nm_logradouro_completo,cd_numero_porta,tx_complemento_endereco,qt_area_construida,qt_area_terreno,dc_tipo_uso_imovel,tx_situ_lote,cd_cib,tx_situacao_cib',
      maxFeatures: 4000,
    }),
    fetchLayer('requalifica'),
    fetchLayer('aiu'),
    fetchLayer('zoneamento', { cqlFilter: `BBOX(ge_poligono,${BBOX_CENTRO.join(',')},'EPSG:31983')`, maxFeatures: 4000 }),
    fetchLayer('tombado', { cqlFilter: `BBOX(ge_poligono,${BBOX_CENTRO.join(',')},'EPSG:31983')`, maxFeatures: 4000 }),
    fetchLayer('distrito', { cqlFilter: `BBOX(ge_poligono,${BBOX_CENTRO.join(',')},'EPSG:31983')`, maxFeatures: 200 }),
  ]);

  if (!lotes.length) throw new Error('Fonte oficial retornou zero lotes — pipeline abortado para não degradar a base.');

  console.log('-> normalizando e cruzando geometrias');
  const candidatos = [];
  const seen = new Set();

  for (const lote of lotes) {
    const p = lote.properties || {};
    const geom = lote.geometry;
    if (!geom) continue;

    const sql = formatarSQL(p);
    const logradouro = formatarLogradouro(p.nm_logradouro_completo);
    const numero = p.cd_numero_porta && String(p.cd_numero_porta).trim();
    if (!sql || !logradouro || !numero) continue; // sem identificação real -> descartado
    if (seen.has(sql)) continue;
    seen.add(sql);

    const c = centroid(geom);
    if (!c) continue;

    const relReq = pickArea(requalifica, geom);
    const relAiu = pickArea(aiu, geom);
    if (!relReq && !relAiu) continue; // regra: precisa estar em perímetro incentivado

    const zonaF = pickByCentroid(zoneamento, geom) || (pickArea(zoneamento, geom) || {}).feature;
    const distritoF = pickByCentroid(distritos, geom) || (pickArea(distritos, geom) || {}).feature;
    const tombF = pickArea(tombados, geom);

    const areaConstruida = Number(p.qt_area_construida) || 0;
    const areaTerreno = Number(p.qt_area_terreno) || 0;
    const uso = p.dc_tipo_uso_imovel || null;
    const zonaSigla = zonaF ? zonaF.properties.cd_zoneamento_perimetro : null;
    const zonaNome = zonaF ? zonaF.properties.tx_zoneamento_perimetro : null;
    const distritoNome = distritoF
      ? (distritoF.properties.nm_distrito_municipal || distritoF.properties.nm_distrito || null)
      : null;

    const tombamento = tombF ? {
      situacao: tombF.feature.properties.tx_situacao_tombamento || null,
      area: tombF.feature.properties.nm_area_tombada || null,
      nivel: tombF.feature.properties.tx_nivel_tombamento || null,
      zepec: tombF.feature.properties.tx_zepec || null,
      resolucaoConpresp: tombF.feature.properties.tx_resolucao_conpresp || null,
      resolucaoCondephaat: tombF.feature.properties.tx_resolucao_condephaat || null,
      resolucaoIphan: tombF.feature.properties.tx_resolucao_iphan || null,
      linkResolucao: tombF.feature.properties.tx_link_resolucao || null,
      relacao: tombF.relacao,
    } : null;
    const protegido = !!(tombamento && /TOMBADO/i.test(tombamento.situacao || ''));

    const imovel = {
      sql,
      endereco: logradouro,
      numero,
      areaConstruida,
      areaTerreno,
      usoCadastrado: uso,
      zoneamentoSigla: zonaSigla,
      distrito: distritoNome,
      situacaoLote: p.tx_situ_lote,
      geometria: true,
      requalificaCentro: relReq ? relReq.relacao : 'fora',
      aiuSetorCentral: relAiu ? relAiu.relacao : 'fora',
    };

    const { score, componentes } = M.opportunityScore(imovel);
    const { confidence, itens } = M.dataConfidence(imovel);

    const custo = M.estimarCusto({ areaConstruida, tombado: protegido, envoltoria: !!tombamento && !protegido });
    const subv = M.tetoSubvencao(custo);

    const nomeExibicao = `${logradouro}, ${numero} — ${distritoNome ? titleCase(distritoNome) : 'São Paulo'}`;
    const slug = slugify(`${logradouro}-${numero}-${distritoNome || 'sao-paulo'}-${sql.replace(/\D/g, '').slice(0, 6)}`);

    // Motivos objetivos de entrada no Radar
    const motivos = [];
    if (relReq) motivos.push(`Relação espacial ${relReq.relacao} com o perímetro oficial do Requalifica Centro (${relReq.feature.properties.nm_perimetro || 'Perímetro Área Central'}).`);
    if (relAiu) motivos.push(`Relação espacial ${relAiu.relacao} com o perímetro oficial da AIU Setor Central.`);
    motivos.push(`Área construída cadastral de ${areaConstruida.toLocaleString('pt-BR')} m², acima do corte de ${REGRAS.areaConstruidaMinima.toLocaleString('pt-BR')} m² do Radar.`);
    if (uso) motivos.push(`Uso cadastrado "${uso}" no Cadastro Imobiliário Fiscal.`);
    if (areaTerreno > 0 && areaConstruida / areaTerreno < 2) motivos.push(`Possível subutilização identificada: coeficiente de aproveitamento cadastral de ${(areaConstruida / areaTerreno).toFixed(2)} — indicador cadastral, não vistoria.`);
    if (protegido) motivos.push(`Imóvel com proteção patrimonial registrada (${tombamento.situacao}${tombamento.nivel ? `, nível ${tombamento.nivel}` : ''}).`);

    const riscos = [];
    if (protegido) {
      riscos.push('Imóvel protegido: intervenção sujeita a aprovação do órgão de tombamento competente (CONPRESP/CONDEPHAAT/IPHAN conforme a resolução aplicável).');
      riscos.push('Custos e prazos de restauro maiores e menos previsíveis.');
    } else if (tombamento) {
      riscos.push('Imóvel em relação espacial com área de tombamento/envoltória — verificar restrições junto ao órgão competente.');
    }
    riscos.push('Condições estruturais, de instalações e de segurança contra incêndio não constam das fontes cadastrais e exigem levantamento técnico.');
    riscos.push('Situação dominial, ocupação e passivos não constam das fontes públicas utilizadas.');

    const proveniencia = {
      endereco: { valor: `${logradouro}, ${numero}`, tipo: 'DADO_OFICIAL', fonte: FONTES.cadastro.nome, url: FONTES.cadastro.url, camada: LAYERS.lote, coletadoEm: executadoEm },
      sql: { valor: sql, tipo: 'DADO_OFICIAL', fonte: FONTES.cadastro.nome, url: FONTES.cadastro.url, camada: LAYERS.lote, coletadoEm: executadoEm },
      areaConstruida: { valor: areaConstruida, unidade: 'm²', tipo: 'DADO_OFICIAL', fonte: FONTES.cadastro.nome, url: FONTES.cadastro.url, camada: LAYERS.lote, coletadoEm: executadoEm },
      areaTerreno: { valor: areaTerreno, unidade: 'm²', tipo: 'DADO_OFICIAL', fonte: FONTES.cadastro.nome, url: FONTES.cadastro.url, camada: LAYERS.lote, coletadoEm: executadoEm },
      usoCadastrado: { valor: uso, tipo: 'DADO_OFICIAL', fonte: FONTES.cadastro.nome, url: FONTES.cadastro.url, camada: LAYERS.lote, coletadoEm: executadoEm },
      coordenadas: { valor: { lat: Number(c[1].toFixed(7)), lng: Number(c[0].toFixed(7)) }, tipo: 'DADO_CALCULADO', fonte: 'Centroide calculado sobre a geometria oficial do lote (GeoSampa)', camada: LAYERS.lote, coletadoEm: executadoEm },
      zoneamento: zonaSigla ? { valor: zonaSigla, descricao: zonaNome, tipo: 'DADO_OFICIAL', fonte: FONTES.zoneamento.nome, url: FONTES.zoneamento.url, camada: LAYERS.zoneamento, coletadoEm: executadoEm } : null,
      distrito: distritoNome ? { valor: titleCase(distritoNome), tipo: 'DADO_OFICIAL', fonte: FONTES.distrito.nome, url: FONTES.distrito.url, camada: LAYERS.distrito, coletadoEm: executadoEm } : null,
      requalificaCentro: { valor: relReq ? relReq.relacao : 'fora', tipo: 'DADO_CALCULADO', fonte: FONTES.requalifica.nome, url: FONTES.requalifica.url, camada: LAYERS.requalifica, metodo: 'Cruzamento geométrico entre a geometria do lote e o polígono oficial do perímetro', coletadoEm: executadoEm },
      aiuSetorCentral: { valor: relAiu ? relAiu.relacao : 'fora', tipo: 'DADO_CALCULADO', fonte: FONTES.aiu.nome, url: FONTES.aiu.url, camada: LAYERS.aiu, metodo: 'Cruzamento geométrico entre a geometria do lote e o polígono oficial do perímetro', coletadoEm: executadoEm },
      patrimonio: { valor: protegido ? (tombamento.situacao || 'TOMBADO') : (tombamento ? 'Relação espacial com área de tombamento/envoltória' : 'Nenhuma proteção patrimonial identificada nesta base'), detalhe: tombamento, tipo: 'DADO_OFICIAL', fonte: FONTES.tombado.nome, url: (tombamento && tombamento.linkResolucao) || FONTES.tombado.url, camada: LAYERS.tombado, coletadoEm: executadoEm },
    };

    candidatos.push({
      id: slug,
      slug,
      nome: nomeExibicao,
      sql,
      logradouro,
      numero,
      complementoCadastral: p.tx_complemento_endereco || null,
      distrito: distritoNome ? titleCase(distritoNome) : null,
      lat: Number(c[1].toFixed(7)),
      lng: Number(c[0].toFixed(7)),
      geometry: geom,
      areaConstruida,
      areaTerreno,
      usoCadastrado: uso,
      situacaoLote: p.tx_situ_lote,
      cib: p.cd_cib || null,
      zoneamento: zonaSigla,
      zoneamentoDescricao: zonaNome,
      perimetros: {
        requalificaCentro: { relacao: relReq ? relReq.relacao : 'fora', perimetro: relReq ? (relReq.feature.properties.nm_perimetro || null) : null, lei: relReq ? (relReq.feature.properties.dc_lei || null) : null, link: relReq ? (relReq.feature.properties.tx_link_site || FONTES.requalifica.url) : FONTES.requalifica.url },
        aiuSetorCentral: { relacao: relAiu ? relAiu.relacao : 'fora', perimetro: relAiu ? (relAiu.feature.properties.nm_perimetro || relAiu.feature.properties.tx_perimetro || null) : null },
      },
      patrimonio: { protegido, registro: tombamento },
      score,
      scoreComponentes: componentes,
      confidence,
      confidenceItens: itens,
      estimativas: { custoObra: custo, tetoSubvencao: subv },
      motivos,
      riscos,
      proveniencia,
      fontes: [
        { nome: FONTES.cadastro.nome, orgao: FONTES.cadastro.orgao, url: FONTES.cadastro.url, consulta: sourceUrl({ typeName: LAYERS.lote, cqlFilter: `cd_setor_fiscal='${String(p.cd_setor_fiscal)}' AND cd_quadra_fiscal='${String(p.cd_quadra_fiscal)}' AND cd_lote='${String(p.cd_lote)}'` }) },
        { nome: FONTES.requalifica.nome, orgao: FONTES.requalifica.orgao, url: FONTES.requalifica.url },
        { nome: FONTES.aiu.nome, orgao: FONTES.aiu.orgao, url: FONTES.aiu.url },
        { nome: FONTES.zoneamento.nome, orgao: FONTES.zoneamento.orgao, url: FONTES.zoneamento.url },
        { nome: FONTES.tombado.nome, orgao: FONTES.tombado.orgao, url: (tombamento && tombamento.linkResolucao) || FONTES.tombado.url },
        { nome: 'Portal da Subvenção Econômica — regras do chamamento vigente', orgao: 'Prefeitura de São Paulo / SMUL', url: 'https://subvencao.prefeitura.sp.gov.br' },
      ],
      coletadoEm: executadoEm,
      ultimaVerificacao: executadoEm,
      regrasAplicadas: REGRAS.descricao,
    });
  }

  console.log(`-> ${candidatos.length} imóveis reais normalizados a partir das fontes oficiais`);

  fs.mkdirSync(INTERNAL, { recursive: true });
  fs.writeFileSync(path.join(INTERNAL, 'candidatos_brutos.json'), JSON.stringify({ executadoEm, total: candidatos.length, regras: REGRAS, candidatos }, null, 2));

  fs.writeFileSync(path.join(INTERNAL, 'fontes_conectadas.json'), JSON.stringify({ executadoEm, fontes: FONTES, bboxBusca: BBOX_CENTRO, crsBusca: 'EPSG:31983' }, null, 2));

  console.log('OK — descoberta concluída. Próxima etapa: validate_and_publish.js');
})().catch((err) => {
  console.error('FALHA NO PIPELINE:', err.message);
  console.error('Base publicada mantida inalterada (sem fallback sintético).');
  process.exit(1);
});
