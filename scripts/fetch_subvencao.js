#!/usr/bin/env node
/*
 * ORQUESTRADOR DE DADOS DA SUBVENÇÃO — Radar Retrofit SP
 *
 * GERA (sem nenhum número escrito à mão):
 *  - src/data/projetos.json ......... 46 registros extraídos dos PDFs oficiais
 *  - src/data/subvencao.json ........ fatos do programa + indicadores CALCULADOS
 *  - data-internal/subvencao_extracao.json ... log de extração para auditoria
 *
 * FONTES:
 *  1. data-oficial/subvencao/*.pdf ....... listas SMUL (extração reproduzível)
 *  2. src/data/oportunidades_index.json ... contagens da base imobiliária real
 *  3. Páginas oficiais da Prefeitura ..... fatos do programa (URL + data)
 *
 * CAMPOS REMOVIDOS POR FALTA DE COMPROVAÇÃO (ver `removidos` no JSON gerado):
 *  orcamentoDisponivel, recursosConcedidos, recursosPagos, datas de abertura/
 *  encerramento do "chamamento vigente" e o número "85 oportunidades".
 */

const fs = require('fs');
const path = require('path');
const { extrair, DOCS, PORTAL_SUBVENCAO } = require('./etl/subvencao_docs');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const INTERNAL = path.join(ROOT, 'data-internal');

/* Fatos do programa publicados em páginas oficiais (valor + URL + data de
 * verificação — nada aqui é inferido). */
const FATOS_PROGRAMA = {
  tetoPrevisto: {
    valor: 1000000000,
    moeda: 'BRL',
    rotulo: 'Investimento total previsto do programa (teto em lei)',
    fontes: [
      {
        nome: 'SMUL — “Programa Requalifica Centro é regulamentado para toda a região central”',
        url: 'https://prefeitura.sp.gov.br/web/licenciamento/w/programa-requalifica-centro-%C3%A9-regulamentado-para-toda-a-regi%C3%A3o-central-de-s%C3%A3o-paulo',
        trecho: '“O subsídio total pode chegar a R$ 1 bilhão”',
      },
      {
        nome: 'São Paulo Parcerias (empresa municipal) — 3º Chamamento, 10/10/2025',
        url: 'https://www.spparcerias.com.br/noticias/3o-chamamento-da-subvencao-economica-prefeitura-divulga-lista-final-de-projetos-que-receberao-apoio-da-prefeitura-para-obras-de-retrofit-no-centro',
        trecho: '“Com investimento total previsto de R$ 1 bilhão” (Lei nº 17.844/2022)',
      },
    ],
    verificadoEm: '2026-09-17',
    aviso: 'Teto previsto em lei. Não é valor em caixa, concedido ou pago.',
  },
  ofertaEditais2023a2025: {
    valor: 400000000,
    moeda: 'BRL',
    rotulo: 'Oferta somada dos três editais publicados entre 2023 e 2025',
    fontes: [
      {
        nome: 'SMUL — “Programa Requalifica Centro é regulamentado para toda a região central”',
        url: 'https://prefeitura.sp.gov.br/web/licenciamento/w/programa-requalifica-centro-%C3%A9-regulamentado-para-toda-a-regi%C3%A3o-central-de-s%C3%A3o-paulo',
        trecho: '“Entre 2023 e 2025, foram lançados três editais, com a oferta de R$ 400 milhões”',
      },
    ],
    verificadoEm: '2026-09-17',
    aviso: 'Valor ofertado nos editais. Não equivale a valor concedido ou pago.',
  },
  ofertaTerceiroChamamento: {
    valor: 200000000,
    moeda: 'BRL',
    rotulo: 'Oferta do 3º Chamamento Público (01/2025/SMUL)',
    fontes: [
      {
        nome: 'São Paulo Parcerias (empresa municipal) — 10/10/2025',
        url: 'https://www.spparcerias.com.br/noticias/3o-chamamento-da-subvencao-economica-prefeitura-divulga-lista-final-de-projetos-que-receberao-apoio-da-prefeitura-para-obras-de-retrofit-no-centro',
        trecho: '“a Prefeitura disponibilizou o valor recorde de R$ 200 milhões”',
      },
    ],
    verificadoEm: '2026-09-17',
    aviso: 'Valor ofertado no edital. Não equivale a valor concedido ou pago.',
  },
  percentualMaximo: {
    valor: 25,
    unidade: '% do custo da obra',
    rotulo: 'Teto de subvenção por projeto (“até 25%”)',
    fontes: [
      {
        nome: 'São Paulo Parcerias (empresa municipal) — 10/10/2025',
        url: 'https://www.spparcerias.com.br/noticias/3o-chamamento-da-subvencao-economica-prefeitura-divulga-lista-final-de-projetos-que-receberao-apoio-da-prefeitura-para-obras-de-retrofit-no-centro',
        trecho: '“programa que cobre até 25% do custo das obras de retrofit”',
      },
    ],
    verificadoEm: '2026-09-17',
    aviso: 'Teto teórico. O percentual efetivo depende de pontuação, enquadramento e análise oficial.',
  },
  resultadoFinal2025: {
    inscritos: 19,
    contemplados: 16,
    publicacaoDOC: '2025-10-08',
    rotulo: 'Resultado final do 3º Chamamento (DOC 08/10/2025)',
    fontes: [
      {
        nome: 'São Paulo Parcerias (empresa municipal) — 10/10/2025',
        url: 'https://www.spparcerias.com.br/noticias/3o-chamamento-da-subvencao-economica-prefeitura-divulga-lista-final-de-projetos-que-receberao-apoio-da-prefeitura-para-obras-de-retrofit-no-centro',
        trecho: '“Dos 19 projetos inscritos, 16 foram aprovados … e convocados para assinar termos de outorga”',
      },
    ],
    verificadoEm: '2026-09-17',
    aviso: 'A lista Fase II (19/09/2025, 14 credenciados) usada pelo Radar é etapa anterior ao resultado final (16 contemplados). Os 2 registros adicionais do resultado final não constam do documento Fase II e por isso não são publicados como registros individuais.',
  },
};

const REMOVIDOS = [
  { campo: 'orcamentoDisponivel', motivo: 'Sem fonte oficial localizada para “orçamento disponível em caixa”. Substituído por teto previsto em lei (R$ 1 bi) e ofertas por edital, ambos com fonte e URL.' },
  { campo: 'recursosConcedidos', motivo: 'Sem fonte oficial localizada para total concedido. Removido em 2026-09-17.' },
  { campo: 'recursosPagos', motivo: 'Sem fonte oficial localizada para total pago. Removido em 2026-09-17.' },
  { campo: 'chamamentoAtual.abertura / encerramento', motivo: 'Datas escritas à mão sem vínculo com edital (“2023-01-01 / 2026-12-31”). Substituídas pelas datas reais de cada chamamento, extraídas dos documentos.' },
  { campo: 'chamamentoAtual.numero = “Múltiplos (2023-2025)”', motivo: 'Identificação vaga. Substituída pelos três chamamentos reais (01/2023, 02/2024, 01/2025/SMUL).' },
  { campo: 'indicadores.oportunidadesIdentificadas = 85', motivo: 'Número escrito à mão, incompatível com a base real. Indicadores agora são calculados (array.length / agregação).' },
  { campo: 'indicadores.imoveisMonitorados = 420', motivo: 'Número escrito à mão. Agora calculado a partir da base publicada.' },
  { campo: 'indicadores.projetosConhecidos = 35', motivo: 'Número escrito à mão. Agora calculado a partir das listas oficiais extraídas.' },
  { campo: 'projetos “Felipe Dupas Mahana (Projeto B)”', motivo: 'Sufixo “(Projeto B)” inventado. O documento traz 3 protocolos distintos em nome de Felipe Dupas Mahana, publicados separadamente.' },
  { campo: 'projeto “Condomínio Edifício Copan (Blocos X e Y)”', motivo: '“(Blocos X e Y)” inventado e chamamento errado. Substituído pelos registros reais: habilitado 2024 (protocolo …31829167) e credenciado 2025 (Av. Ipiranga, 200).' },
  { campo: 'projeto “SPE Edifício Martinelli S/A”', motivo: 'Razão social inventada. O documento de 2024 traz “Tokyo Martinelli SPE S.A.” (habilitado, protocolo não atribuível com segurança).' },
];

function readJSON(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

async function main() {
  const extracao = await extrair();
  const { projetos, totais, soma2025, descartados2024, executadoEm } = extracao;

  const indice = readJSON(path.join(DATA, 'oportunidades_index.json'), null);
  const imoveisMonitorados = Array.isArray(indice) ? indice.length : null;
  const score85 = Array.isArray(indice) ? indice.filter((o) => o.score >= 85).length : null;

  const chamamentos = [2023, 2024, 2025].map((ano) => {
    const d = DOCS[ano];
    return {
      ano,
      numero: d.chamamento,
      tituloDocumento: d.titulo,
      fase: d.fase,
      processo: d.processo,
      lote: d.lote,
      portaria: d.portaria,
      dataDocumento: d.data,
      totalRegistros: totais[ano],
      somaValorMaximo: ano === 2025 ? soma2025 : null,
      protocolosSemNomeAtribuivel: ano === 2024 ? descartados2024.map((x) => x.protocolo) : [],
      documento: {
        arquivo: `data-oficial/subvencao/${d.arquivo}`,
        sei: d.sei,
        verificador: d.verificador,
        crc: d.crc,
        verificacaoUrl: d.verificador ? 'http://processos.prefeitura.sp.gov.br' : null,
      },
      portal: PORTAL_SUBVENCAO,
    };
  });

  const subvencao = {
    programa: {
      nome: 'Programa de Subvenção Econômica — Requalifica Centro',
      orgao: 'Prefeitura de São Paulo / SMUL',
      portal: PORTAL_SUBVENCAO,
      baseLegal: [
        { norma: 'Lei nº 17.577/2021 (Requalifica Centro)', url: 'https://legislacao.prefeitura.sp.gov.br/leis/lei-17577-de-20-de-julho-de-2021' },
        { norma: 'Lei nº 17.844/2022 (AIU Setor Central — autoriza a subvenção)', url: 'https://legislacao.prefeitura.sp.gov.br' },
        { norma: 'Decreto nº 62.878/2023 (regulamenta a subvenção)', url: 'https://legislacao.prefeitura.sp.gov.br' },
        { norma: 'Decreto nº 64.092/2025 (aperfeiçoa incentivos)', url: 'https://legislacao.prefeitura.sp.gov.br' },
      ],
      fatos: FATOS_PROGRAMA,
    },
    chamamentos,
    indicadores: {
      imoveisMonitorados,
      oportunidadesScore85: score85,
      chamamentosComListas: chamamentos.length,
      interessadosHabilitados2023: totais[2023],
      interessadosHabilitadosFaseI2024: totais[2024],
      credenciadosFaseII2025: totais[2025],
      totalRegistrosSubvencao: projetos.length,
      valorMaximoCredenciado2025FaseII: soma2025,
      ultimaAtualizacao: executadoEm,
    },
    metodologiaIndicadores: {
      imoveisMonitorados: 'oportunidades_index.json.length (base imobiliária publicada pelo ETL GeoSampa)',
      oportunidadesScore85: 'contagem de registros com Opportunity Score >= 85 na base publicada',
      chamamentosComListas: 'quantidade de chamamentos com documento oficial extraído',
      interessadosHabilitados2023: 'linhas da relação nominal 01/2023/SMUL',
      interessadosHabilitadosFaseI2024: 'pares protocolo+nome atribuíveis da lista 02/2024/SMUL (5 protocolos sem nome descartados — ver log)',
      credenciadosFaseII2025: 'linhas da tabela 01/2025/SMUL Fase II',
      totalRegistrosSubvencao: 'soma dos registros extraídos (11 + 21 + 14)',
      valorMaximoCredenciado2025FaseII: 'soma da coluna “VALOR MÁXIMO DE SUBVENÇÃO” (Fase II). Não é valor concedido nem pago.',
    },
    removidos: REMOVIDOS,
    extraidoEm: executadoEm,
  };

  fs.mkdirSync(DATA, { recursive: true });
  fs.mkdirSync(INTERNAL, { recursive: true });
  fs.writeFileSync(path.join(DATA, 'projetos.json'), JSON.stringify(projetos, null, 2));
  fs.writeFileSync(path.join(DATA, 'subvencao.json'), JSON.stringify(subvencao, null, 2));
  fs.writeFileSync(
    path.join(INTERNAL, 'subvencao_extracao.json'),
    JSON.stringify({ executadoEm, totais, soma2025, descartados2024, documentos: DOCS }, null, 2)
  );

  console.log(
    `subvencao.json + projetos.json gerados a partir dos PDFs oficiais: ${projetos.length} registros (2023: ${totais[2023]}, 2024: ${totais[2024]}, 2025: ${totais[2025]}).`
  );
}

main().catch((err) => {
  console.error('FALHA NA EXTRAÇÃO DA SUBVENÇÃO:', err && err.stack ? err.stack : err);
  process.exit(1);
});
