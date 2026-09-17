/*
 * Metodologia pública do Radar Retrofit SP.
 * Tudo aqui é ESTIMATIVA DO RADAR ou DADO CALCULADO — nunca dado oficial.
 */

const METODOLOGIA_CUSTO = {
  dataBase: '2025-01',
  custoBaseM2: 4800, // R$/m² — custo paramétrico de retrofit (ordem de grandeza, base CUB/SINAPI residencial multifamiliar + adicional de retrofit)
  fonteCustoBase:
    'Ordem de grandeza paramétrica derivada de índices públicos de custo de construção (CUB-SP/SINAPI) acrescida de fator de retrofit. Não é orçamento.',
  fatores: {
    tombado: 1.35,
    envoltoriaTombamento: 1.15,
    edificacaoMuitoAntiga: 1.1,
    grandePorte: 0.95,
  },
  formula:
    'Custo estimado = Área construída (cadastro oficial) × R$/m² base × fator de complexidade patrimonial × fator de porte',
};

const METODOLOGIA_SUBVENCAO = {
  regra: 'até 25% do custo da obra',
  base: 'Lei nº 17.577/2021 (Requalifica Centro) e regras do chamamento público de subvenção econômica vigente (SMUL).',
  aviso:
    'Teto teórico preliminar. Não é valor concedido, não é direito adquirido e está sujeito ao enquadramento, aos limites do edital e à análise oficial da Prefeitura.',
  percentualTeto: 0.25,
};

function arredondarMilhoes(valor) {
  // Evita falsa precisão: devolve valor arredondado em milhões com 1 casa.
  return Math.round(valor / 100000) / 10;
}

function estimarCusto({ areaConstruida, tombado, envoltoria, idadeAnos }) {
  if (!areaConstruida || areaConstruida <= 0) return null;
  const f = METODOLOGIA_CUSTO.fatores;
  const fatores = [];
  let mult = 1;
  if (tombado) { mult *= f.tombado; fatores.push({ nome: 'Imóvel tombado / protegido', fator: f.tombado }); }
  else if (envoltoria) { mult *= f.envoltoriaTombamento; fatores.push({ nome: 'Envoltória de bem tombado', fator: f.envoltoriaTombamento }); }
  if (idadeAnos && idadeAnos >= 60) { mult *= f.edificacaoMuitoAntiga; fatores.push({ nome: 'Edificação com 60+ anos', fator: f.edificacaoMuitoAntiga }); }
  if (areaConstruida >= 20000) { mult *= f.grandePorte; fatores.push({ nome: 'Ganho de escala (20.000 m²+)', fator: f.grandePorte }); }

  const bruto = areaConstruida * METODOLOGIA_CUSTO.custoBaseM2 * mult;
  return {
    tipo: 'ESTIMATIVA_RADAR',
    valorMilhoes: arredondarMilhoes(bruto),
    textoValor: `aprox. R$ ${arredondarMilhoes(bruto).toLocaleString('pt-BR')} milhões`,
    areaConsiderada: areaConstruida,
    custoM2: METODOLOGIA_CUSTO.custoBaseM2,
    multiplicadorTotal: Number(mult.toFixed(3)),
    fatores,
    dataBase: METODOLOGIA_CUSTO.dataBase,
    formula: METODOLOGIA_CUSTO.formula,
    fonteMetodologia: METODOLOGIA_CUSTO.fonteCustoBase,
  };
}

function tetoSubvencao(custo) {
  if (!custo) return null;
  const teto = custo.valorMilhoes * METODOLOGIA_SUBVENCAO.percentualTeto;
  return {
    tipo: 'ESTIMATIVA_RADAR',
    valorMilhoes: Math.round(teto * 10) / 10,
    textoValor: `até aproximadamente R$ ${(Math.round(teto * 10) / 10).toLocaleString('pt-BR')} milhões`,
    percentual: 'até 25%',
    formula: 'Teto = custo estimado de obra × até 25%',
    base: METODOLOGIA_SUBVENCAO.base,
    aviso: METODOLOGIA_SUBVENCAO.aviso,
  };
}

/*
 * Opportunity Score — componentes explícitos e reprodutíveis (0-100).
 * Calculado SOMENTE sobre atributos oficiais verificados do imóvel.
 */
function opportunityScore(imovel) {
  const c = [];
  const add = (nome, pontos, max, justificativa) => c.push({ nome, pontos, max, justificativa });

  // 1. Enquadramento territorial (0-30)
  let terr = 0; let just = [];
  if (imovel.requalificaCentro === 'dentro') { terr += 18; just.push('dentro do perímetro Requalifica Centro'); }
  else if (imovel.requalificaCentro === 'intersecta') { terr += 12; just.push('intersecta o perímetro Requalifica Centro'); }
  if (imovel.aiuSetorCentral === 'dentro') { terr += 12; just.push('dentro da AIU Setor Central'); }
  else if (imovel.aiuSetorCentral === 'intersecta') { terr += 8; just.push('intersecta a AIU Setor Central'); }
  add('Enquadramento territorial', Math.min(terr, 30), 30, just.join('; ') || 'fora dos perímetros incentivados');

  // 2. Escala construída (0-20)
  const a = imovel.areaConstruida || 0;
  let esc = a >= 20000 ? 20 : a >= 10000 ? 16 : a >= 5000 ? 12 : a >= 2000 ? 8 : 4;
  add('Escala construída', esc, 20, `${a.toLocaleString('pt-BR')} m² de área construída (cadastro oficial)`);

  // 3. Uso cadastrado x conversão (0-15)
  const uso = (imovel.usoCadastrado || '').toLowerCase();
  let up = 5; let ujust = 'uso cadastrado com potencial neutro de conversão';
  if (uso.includes('não residencial') || uso.includes('nao residencial')) { up = 15; ujust = 'uso não residencial — alvo prioritário de conversão residencial incentivada'; }
  else if (uso.includes('misto')) { up = 11; ujust = 'uso misto — conversão parcial viável'; }
  else if (uso.includes('residencial')) { up = 6; ujust = 'uso residencial já existente'; }
  add('Potencial de conversão de uso', up, 15, ujust);

  // 4. Aproveitamento do terreno / subutilização (0-15)
  let sub = 0; let sjust = 'sem indício cadastral de subaproveitamento';
  if (imovel.areaTerreno > 0 && imovel.areaConstruida > 0) {
    const ca = imovel.areaConstruida / imovel.areaTerreno;
    if (ca < 1) { sub = 15; sjust = `coeficiente de aproveitamento cadastral ${ca.toFixed(2)} (baixo para a área central)`; }
    else if (ca < 2) { sub = 10; sjust = `coeficiente de aproveitamento cadastral ${ca.toFixed(2)}`; }
    else if (ca < 4) { sub = 6; sjust = `coeficiente de aproveitamento cadastral ${ca.toFixed(2)}`; }
    else { sub = 3; sjust = `coeficiente de aproveitamento cadastral ${ca.toFixed(2)} (terreno intensamente ocupado)`; }
  }
  add('Aproveitamento do terreno', sub, 15, sjust);

  // 5. Zoneamento (0-10)
  const z = (imovel.zoneamentoSigla || '').toUpperCase();
  let zp = 3; let zjust = `zona ${z || 'não identificada'}`;
  if (['ZC', 'ZCa', 'ZEU', 'ZEUa', 'ZEUP', 'ZEUPa', 'ZEIS-3', 'ZEIS 3'].map((s) => s.toUpperCase()).includes(z)) { zp = 10; zjust = `zona ${z} — parâmetros favoráveis a adensamento/uso misto`; }
  else if (z.startsWith('ZEIS')) { zp = 9; zjust = `zona ${z} — vocação para habitação de interesse social`; }
  else if (z.startsWith('ZEM') || z.startsWith('ZM')) { zp = 7; zjust = `zona ${z}`; }
  else if (z.startsWith('ZEPEC')) { zp = 6; zjust = `zona ${z} — proteção cultural com incentivos específicos`; }
  add('Zoneamento vigente (Lei 18.177/2024)', zp, 10, zjust);

  // 6. Qualidade documental (0-10)
  let doc = 0; const djust = [];
  if (imovel.sql) { doc += 4; djust.push('SQL cadastral oficial'); }
  if (imovel.endereco) { doc += 3; djust.push('endereço cadastral oficial'); }
  if (imovel.geometria) { doc += 3; djust.push('geometria oficial do lote'); }
  add('Qualidade documental', doc, 10, djust.join('; '));

  const total = c.reduce((s, x) => s + x.pontos, 0);
  return { score: Math.min(100, Math.round(total)), componentes: c };
}

/*
 * Data Confidence Score.
 * Requisitos ELIMINATÓRIOS (endereço real + identificação cadastral + fonte oficial)
 * são avaliados na validação, não compensáveis pelo score.
 */
function dataConfidence(imovel) {
  const itens = [];
  const add = (nome, ok, peso) => itens.push({ nome, ok: !!ok, peso });
  add('SQL cadastral oficial (GeoSampa/Cadastro Imobiliário Fiscal)', imovel.sql, 20);
  add('Endereço cadastral oficial', imovel.endereco && imovel.numero && imovel.numero !== 'S/N', 15);
  add('Geometria oficial do lote', imovel.geometria, 15);
  add('Área construída de cadastro oficial', imovel.areaConstruida > 0, 12);
  add('Área de terreno de cadastro oficial', imovel.areaTerreno > 0, 8);
  add('Uso cadastrado oficial', !!imovel.usoCadastrado, 8);
  add('Zoneamento oficial vigente', !!imovel.zoneamentoSigla, 8);
  add('Distrito oficial', !!imovel.distrito, 6);
  add('Situação cadastral ativa', imovel.situacaoLote === 'ATIVO', 8);
  const total = itens.reduce((s, i) => s + (i.ok ? i.peso : 0), 0);
  return { confidence: total, itens };
}

module.exports = {
  METODOLOGIA_CUSTO,
  METODOLOGIA_SUBVENCAO,
  estimarCusto,
  tetoSubvencao,
  opportunityScore,
  dataConfidence,
};
