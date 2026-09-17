#!/usr/bin/env node
/*
 * EXTRAÇÃO DAS LISTAS OFICIAIS DE SUBVENÇÃO — Radar Retrofit SP
 *
 * FONTES (documentos oficiais da SMUL, preservados em data-oficial/subvencao/):
 *  - 2023-Relacao-Interessados-Habilitados.pdf .... Chamamento 01/2023/SMUL — habilitados
 *  - 2024-Relacao-Interessados-Habilitados.pdf .... Chamamento 02/2024/SMUL — Fase I (SEI 6068.2024/0005871-1)
 *  - 2025-Lista_Credenciados.pdf ................. Chamamento 01/2025/SMUL — Fase II (SEI 6068.2025/0004742-8)
 *
 * REGRAS:
 *  - Todo registro publicado precisa existir VERBATIM no texto do PDF (teste de
 *    integridade confere cada nome/endereço/valor como substring normalizada).
 *  - Protocolo/endereço/valor sem atribuição segura => NULL + nota explícita.
 *    NADA é completado por suposição.
 *  - Protocolos sem nome atribuível são descartados e registrados no log interno.
 *
 * SAÍDA: { projetos, chamamentos, soma2025, descartados, documentos }
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const ROOT = path.resolve(__dirname, '../..');
const DIR_OFICIAL = path.join(ROOT, 'data-oficial', 'subvencao');

const PORTAL_SUBVENCAO = 'https://subvencao.prefeitura.sp.gov.br';
const SEI_VERIFICACAO = 'http://processos.prefeitura.sp.gov.br';

/* Metadados de cada DOCUMENTO (identidade do documento, transcrita do próprio
 * PDF — o teste de integridade exige que cada código apareça no texto-fonte). */
const DOCS = {
  2023: {
    arquivo: '2023-Relacao-Interessados-Habilitados.pdf',
    chamamento: 'Chamamento Público nº 01/2023/SMUL',
    titulo: 'Relação de INTERESSADOS habilitados a participar do CHAMAMENTO PÚBLICO',
    data: '2023-12-07',
    fase: 'Habilitados',
    situacao: 'Habilitado',
    itemEdital: '1.1.29',
    processo: null,
    lote: null,
    portaria: null,
    sei: null,
    verificador: null,
    crc: null,
  },
  2024: {
    arquivo: '2024-Relacao-Interessados-Habilitados.pdf',
    chamamento: 'Chamamento Público nº 02/2024/SMUL',
    titulo: 'LISTA DE INTERESSADOS — habilitados na Fase I (convocação de REUNIÃO TÉCNICA)',
    data: '2024-07-10',
    fase: 'Fase I — Habilitados',
    situacao: 'Habilitado (Fase I)',
    itemEdital: '8.4',
    processo: '6011.2024/0000706-7',
    lote: 'Lote 2',
    portaria: 'Portaria SMUL nº 55/2024',
    sei: '6068.2024/0005871-1',
    verificador: '106440352',
    crc: '9534D549',
    atosExecutivo: '982876',
  },
  2025: {
    arquivo: '2025-Lista_Credenciados.pdf',
    chamamento: 'Chamamento Público nº 01/2025/SMUL',
    titulo: 'LISTA DE CREDENCIADOS em ORDEM DE PRIORIZAÇÃO — Fase II',
    data: '2025-09-19',
    fase: 'Fase II — Credenciados',
    situacao: 'Credenciado (Fase II)',
    itensEdital: '9.3.11 e 9.3.13',
    processo: '6068.2024/0005871-1',
    lote: 'Lote 3',
    portaria: 'Portaria SMUL nº 34/2025',
    sei: '6068.2025/0004742-8',
    verificador: '142837382',
    crc: '3EB6DE09',
  },
};

function norm(s) {
  return String(s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normFlat(s) {
  // Normalização agressiva para comparação verbatim (ignora quebra de linha,
  // espaços duplos e hifenização de fim de linha "0005370-\n3").
  return String(s || '')
    .replace(/-\s*\n\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

async function textoPDF(arquivo) {
  const buf = fs.readFileSync(path.join(DIR_OFICIAL, arquivo));
  const d = await pdfParse(buf);
  return d.text || '';
}

function parseBRMoney(s) {
  // "21.690.192,26" -> 21690192.26
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(n)) throw new Error(`Valor monetário inválido: ${s}`);
  return Math.round(n * 100) / 100;
}

function parseBRNumber(s) {
  const n = Number(String(s).replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(n)) throw new Error(`Número inválido: ${s}`);
  return n;
}

/* ---------------- 2023: lista simples de nomes ---------------- */
function parse2023(text) {
  const marcador = 'CHAMAMENTO PÚBLICO SMUL Nº 01/2023/SMUL.';
  const i = text.indexOf(marcador);
  if (i < 0) throw new Error('2023: marcador de início da lista não encontrado');
  const nomes = text
    .slice(i + marcador.length)
    .split('\n')
    .map(norm)
    .filter(Boolean);
  if (nomes.length < 5) throw new Error(`2023: poucas linhas extraídas (${nomes.length})`);
  return nomes;
}

/* ---------------- 2024: pares protocolo + interessado ---------------- */
const LINHA_PROTOCOLO = /^(SUBVENCAO2024\.\d{10})(.*)$/;
const LINHA_NAO_NOME = /^(Atos do Executivo|Disponibiliza|Publica|Comunicado|PROTOCOLO\(S\)|A\s+Comiss|Mariana|Diretor|Em \d|Denise|Arquiteto|A autenticidade|código|Referência|SUBVENCAO@|subvencao@|convocados|com endereço|Núcleo|SECRETARIA|Rua São Bento|Telefone|Chamamento|Processo|Interessados|Objeto|Assunto|localizados|Público|ESPECIAL|análise|02\/2024|Edital, os seguintes)/i;

function parse2024(text) {
  const linhas = text.split('\n').map((l) => norm(l));
  const registros = [];
  const descartados = [];
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(LINHA_PROTOCOLO);
    if (!m) continue;
    const protocolo = m[1];
    const resto = norm(m[2]);
    if (resto) {
      registros.push({ protocolo, interessado: resto });
      continue;
    }
    // Protocolo "nú": o nome pode estar na linha seguinte. Só atribui se a
    // linha seguinte não for outro protocolo nem cabeçalho/rodapé — E se não
    // houver ambiguidade (dois ou mais protocolos nus seguidos + 1 nome).
    const prox = norm(linhas[i + 1] || '');
    const proxEProtocolo = LINHA_PROTOCOLO.test(prox);
    if (!prox || proxEProtocolo || LINHA_NAO_NOME.test(prox)) {
      descartados.push({ protocolo, motivo: 'sem nome atribuível no documento (linha seguinte é outro protocolo, vazia ou rodapé)' });
      continue;
    }
    // Verifica ambiguidade: conta protocolos nus consecutivos antes deste nome.
    let nusSeguidos = 1;
    for (let j = i - 1; j >= 0; j--) {
      const mj = linhas[j].match(LINHA_PROTOCOLO);
      if (mj && !norm(mj[2])) nusSeguidos++;
      else break;
    }
    if (nusSeguidos > 1) {
      // Ambíguo: publica o NOME (verificado no documento) sem atribuir protocolo.
      registros.push({ protocolo: null, interessado: prox, notaProtocolo: `Nome consta da lista de habilitados; protocolo individual não atribuível com segurança (cluster de ${nusSeguidos} protocolos sem nome em sequência no layout do PDF)` });
      descartados.push({ protocolo, motivo: 'protocolo em cluster ambíguo — nome publicado sem atribuição de protocolo' });
      i++; // consome a linha do nome
      continue;
    }
    registros.push({ protocolo, interessado: prox });
    i++; // consome a linha do nome
  }
  return { registros, descartados };
}

/* ---------------- 2025: tabela de credenciados ---------------- */
const ORDEM = /^(\d{1,2})º$/;
const SEI_LINHA = /^6068\.2025\/\d{7}-$/;
const CATEGORIA_TOKEN = /(HIS-[12]|HMP|R2v|nR)/;

function parse2025(text) {
  const linhas = text.split('\n'); // mantém cru; normaliza por campo
  const registros = [];
  let i = 0;
  // Avança até o cabeçalho da tabela
  while (i < linhas.length && !/VALOR/.test(linhas[i]) && !/MÁXIMO DE/.test(linhas[i])) i++;
  while (i < linhas.length && !ORDEM.test(norm(linhas[i]))) i++;

  while (i < linhas.length) {
    const ord = norm(linhas[i]).match(ORDEM);
    if (!ord) { i++; continue; }
    const ordem = Number(ord[1]);
    i++;
    // SEI (duas linhas: "6068.2025/0005370-" + "3")
    const seiA = norm(linhas[i] || '');
    const seiB = norm(linhas[i + 1] || '');
    if (!SEI_LINHA.test(seiA) || !/^\d$/.test(seiB)) {
      throw new Error(`2025 #${ordem}: processo SEI não reconhecido (${seiA} / ${seiB})`);
    }
    const processoSei = `${seiA}${seiB}`;
    i += 2;
    // Coleta linhas até a próxima ordem ou fim da tabela ("Comunicado" / "* Para os casos")
    const bloco = [];
    while (i < linhas.length && !ORDEM.test(norm(linhas[i])) && !/^(Comunicado|\* Para os casos)/.test(norm(linhas[i]))) {
      bloco.push(linhas[i]);
      i++;
    }
    registros.push(parseBloco2025(ordem, processoSei, bloco));
  }
  if (!registros.length) throw new Error('2025: nenhum credenciado extraído');
  return registros;
}

function splitCauda2025(ordem, aposEndereco) {
  const re = /(HIS-[12]|HMP|R2v|nR)/g;
  const posicoes = [];
  let m;
  while ((m = re.exec(aposEndereco))) posicoes.push(m.index);
  for (const pos of posicoes) {
    const antes = norm(aposEndereco.slice(0, pos));
    const cauda = norm(aposEndereco.slice(pos));
    if (!antes || /R\$|%/.test(antes)) continue; // nome não contém valor/percentual
    if (!/R\$/.test(cauda) || !/%/.test(cauda)) continue;
    try {
      validaCauda2025(ordem, cauda);
      return { interessado: antes, cauda };
    } catch {
      // tenta a próxima ocorrência
    }
  }
  throw new Error(`2025 #${ordem}: cauda válida não encontrada (${aposEndereco.slice(0, 120)}…)`);
}

// Validação estrita da cauda (a extração real acontece em parseBloco2025).
function validaCauda2025(ordem, cauda) {
  const mValor = cauda.match(/^(.*)R\$\s*([\d.,]+)$/);
  if (!mValor) throw new Error('valor');
  parseBRMoney(mValor[2]);
  let rest = norm(mValor[1]);
  if (!/%$/.test(rest)) throw new Error('percentual');
  const semPct = rest.slice(0, -1);
  const mNum = semPct.match(/([\d.,]+)$/);
  if (!mNum) throw new Error('percentual');
  parseBRNumber(mNum[1]);
  rest = norm(semPct.slice(0, semPct.length - mNum[1].length));
  if (/[\d.,]$/.test(rest)) throw new Error('fronteira');
  const mBon = rest.match(/^(.*?)(-|5%\s*\([^)]*\))$/);
  if (!mBon) throw new Error('bonificação');
  rest = norm(mBon[1]);
  const mPon = rest.match(/^(.*?)(\d[\d.,]*)$/);
  if (!mPon) throw new Error('pontuação');
  let categoria = norm(mPon[1]);
  let pontuacaoTxt = mPon[2];
  while (categoria && !/(HIS-[12]|HMP|R2v|nR)\s*,?\s*$/.test(categoria) && pontuacaoTxt.length > 1) {
    categoria = `${categoria}${pontuacaoTxt[0]}`;
    pontuacaoTxt = pontuacaoTxt.slice(1);
  }
  if (!/(HIS-[12]|HMP|R2v|nR)\s*,?\s*$/.test(categoria)) throw new Error('categoria');
  if (!/^\d{2,3}([.,]\d+)?$/.test(pontuacaoTxt)) throw new Error('pontuação');
}

// Une linhas desfazendo a hifenização de fim de linha ("(CAU-" + "SP)" =>
// "(CAU-SP)"). Hífen precedido de espaço é separador e mantém o espaço.
function uneLinhas(linhas) {
  let out = '';
  for (const ln of linhas) {
    const t = norm(ln);
    if (!t) continue;
    if (!out) { out = t; continue; }
    if (/-$/.test(out) && !/\s-$/.test(out)) out += t;
    else out += ` ${t}`;
  }
  return out;
}

function parseBloco2025(ordem, processoSei, bloco) {
  const L = bloco.map(norm).filter((l) => l.length > 0);
  // 1) Endereço: da primeira linha até a primeira linha que termina em dígito
  //    (número do imóvel), mais eventuais continuações ("e 73").
  let fimEnd = -1;
  for (let k = 0; k < L.length; k++) {
    if (/\d$/.test(L[k])) { fimEnd = k; break; }
  }
  if (fimEnd < 0) throw new Error(`2025 #${ordem}: endereço sem número identificável`);
  while (fimEnd + 1 < L.length && /^e\s+\d/i.test(L[fimEnd + 1])) fimEnd++;
  const endereco = uneLinhas(L.slice(0, fimEnd + 1));
  // 2) Interessado + cauda: o nome pode vir colado à cauda na mesma linha
  //    ("LIBERO 370 LTDAR2v65-16,25%R$ ..."). Testa cada ocorrência de token
  //    de categoria como início da cauda; a primeira que produz cauda válida
  //    pela gramática estrita vence.
  const aposEndereco = uneLinhas(L.slice(fimEnd + 1));
  const split = splitCauda2025(ordem, aposEndereco);
  const interessado = split.interessado;
  const cauda = split.cauda;
  // 3) Cauda: categoria + pontuação + bonificação + percentual + valor.
  //    Ex.: "R2v e nR89,7815-22,45%" + "R$" + "21.690.192,26"
  //    Ex.: "R2v65" + "5% (<" + "1.500m²)" + "21,25%R$ 303.719,77"
  // Cauda: extração DE TRÁS PARA FRENTE (valor -> percentual -> bonificação
  // -> pontuação -> categoria), porque pontuação e bonificação vêm coladas
  // ("...R2v765% (HIS-2)24%").
  let rest = cauda;
  const mValor = rest.match(/^(.*)R\$\s*([\d.,]+)$/);
  if (!mValor) throw new Error(`2025 #${ordem}: valor ilegível (${cauda})`);
  const valor = parseBRMoney(mValor[2]);
  rest = norm(mValor[1]);
  // Percentual: número imediatamente anterior ao "%" final.
  if (!/%$/.test(rest)) throw new Error(`2025 #${ordem}: percentual ilegível (${cauda})`);
  const semPct = rest.slice(0, -1);
  const mNum = semPct.match(/([\d.,]+)$/);
  if (!mNum) throw new Error(`2025 #${ordem}: percentual ilegível (${cauda})`);
  const percentual = parseBRNumber(mNum[1]);
  rest = norm(semPct.slice(0, semPct.length - mNum[1].length));
  if (/[\d.,]$/.test(rest)) throw new Error(`2025 #${ordem}: fronteira percentual/bonificação ambígua (${cauda})`);
  const mBon = rest.match(/^(.*?)(-|5%\s*\([^)]*\))$/);
  if (!mBon) throw new Error(`2025 #${ordem}: bonificação ilegível (${cauda})`);
  const bonificacao = norm(mBon[2]);
  rest = norm(mBon[1]);
  // Pontuação: sequência numérica final; categoria: o prefixo restante, que
  // precisa terminar com um token de categoria válido.
  const mPon = rest.match(/^(.*?)(\d[\d.,]*)$/);
  if (!mPon) throw new Error(`2025 #${ordem}: pontuação ilegível (${cauda})`);
  let categoria = norm(mPon[1]);
  let pontuacaoTxt = mPon[2];
  // Desambiguação: categoria válida termina em letra (R2v, nR, HMP) ou em
  // token HIS-N completo. Se o prefixo não for categoria válida, devolve
  // dígitos da pontuação para a categoria (caso "HIS-2"+pontuação coladas).
  while (categoria && !/(HIS-[12]|HMP|R2v|nR)\s*,?\s*$/.test(categoria) && pontuacaoTxt.length > 1) {
    categoria = `${categoria}${pontuacaoTxt[0]}`;
    pontuacaoTxt = pontuacaoTxt.slice(1);
  }
  if (!/(HIS-[12]|HMP|R2v|nR)\s*,?\s*$/.test(categoria)) {
    throw new Error(`2025 #${ordem}: categoria ilegível (${cauda})`);
  }
  categoria = norm(categoria.replace(/,\s*$/, ''));
  if (!/^\d{2,3}([.,]\d+)?$/.test(pontuacaoTxt)) {
    throw new Error(`2025 #${ordem}: pontuação fora do padrão (${pontuacaoTxt})`);
  }
  const pontuacao = parseBRNumber(pontuacaoTxt);
  return { ordem, processoSei, endereco, interessado, categoria, pontuacao, bonificacao, percentual, valor };
}

async function extrair() {
  const executadoEm = new Date().toISOString();
  const t2023 = await textoPDF(DOCS[2023].arquivo);
  const t2024 = await textoPDF(DOCS[2024].arquivo);
  const t2025 = await textoPDF(DOCS[2025].arquivo);

  const nomes2023 = parse2023(t2023);
  const r2024 = parse2024(t2024);
  const r2025 = parse2025(t2025);

  const docBase = (ano) => {
    const d = DOCS[ano];
    return {
      titulo: d.titulo,
      chamamento: d.chamamento,
      arquivo: `data-oficial/subvencao/${d.arquivo}`,
      data: d.data,
      fase: d.fase,
      processo: d.processo,
      portaria: d.portaria,
      sei: d.sei,
      verificador: d.verificador,
      crc: d.crc,
      verificacaoUrl: d.verificador ? SEI_VERIFICACAO : null,
    };
  };

  const projetos = [];
  nomes2023.forEach((nome, idx) => {
    projetos.push({
      id: `subv-2023-${String(idx + 1).padStart(2, '0')}`,
      nome,
      empresa: nome,
      interessado: nome,
      endereco: null,
      chamamento: DOCS[2023].chamamento,
      ano: 2023,
      fase: DOCS[2023].fase,
      situacao: DOCS[2023].situacao,
      ordem: idx + 1,
      processoSei: null,
      protocolo: null,
      categoria: null,
      pontuacao: null,
      bonificacao: null,
      percentualSubvencao: null,
      valorMaximoSubvencao: null,
      observacao: 'Endereço, protocolo, categoria e valores não constam deste documento (relação nominal de habilitados) e por isso não são exibidos.',
      documento: docBase(2023),
      fonte: 'SMUL / Comissão Especial de Avaliação',
      fonteUrl: PORTAL_SUBVENCAO,
      extraidoEm: executadoEm,
    });
  });

  r2024.registros.forEach((r, idx) => {
    projetos.push({
      id: `subv-2024-${String(idx + 1).padStart(2, '0')}`,
      nome: r.interessado,
      empresa: r.interessado,
      interessado: r.interessado,
      endereco: null,
      chamamento: DOCS[2024].chamamento,
      ano: 2024,
      fase: DOCS[2024].fase,
      situacao: DOCS[2024].situacao,
      ordem: idx + 1,
      processoSei: null,
      protocolo: r.protocolo,
      notaProtocolo: r.notaProtocolo || null,
      categoria: null,
      pontuacao: null,
      bonificacao: null,
      percentualSubvencao: null,
      valorMaximoSubvencao: null,
      observacao: 'Endereço, categoria e valores não constam deste documento (lista de habilitados Fase I) e por isso não são exibidos.',
      documento: docBase(2024),
      fonte: `SMUL / Comissão Especial de Avaliação — ${DOCS[2024].portaria}`,
      fonteUrl: PORTAL_SUBVENCAO,
      extraidoEm: executadoEm,
    });
  });

  r2025.forEach((r) => {
    projetos.push({
      id: `subv-2025-${String(r.ordem).padStart(2, '0')}`,
      nome: r.interessado,
      empresa: r.interessado,
      interessado: r.interessado,
      endereco: r.endereco,
      chamamento: DOCS[2025].chamamento,
      ano: 2025,
      fase: DOCS[2025].fase,
      situacao: DOCS[2025].situacao,
      ordem: r.ordem,
      processoSei: r.processoSei,
      protocolo: null,
      categoria: r.categoria,
      pontuacao: r.pontuacao,
      bonificacao: r.bonificacao,
      percentualSubvencao: r.percentual,
      valorMaximoSubvencao: r.valor,
      observacao: 'Valores = "VALOR MÁXIMO DE SUBVENÇÃO" da lista Fase II (19/09/2025). Serão ajustados antes dos Termos de Outorga; não são valores pagos.',
      documento: docBase(2025),
      fonte: `SMUL / Comissão Especial de Avaliação — ${DOCS[2025].portaria}`,
      fonteUrl: PORTAL_SUBVENCAO,
      extraidoEm: executadoEm,
    });
  });

  const soma2025 = Math.round(r2025.reduce((s, r) => s + r.valor, 0) * 100) / 100;

  return {
    executadoEm,
    projetos,
    soma2025,
    descartados2024: r2024.descartados,
    totais: { 2023: nomes2023.length, 2024: r2024.registros.length, 2025: r2025.length },
    textos: { t2023, t2024, t2025 },
  };
}

module.exports = { extrair, DOCS, DIR_OFICIAL, norm, normFlat, PORTAL_SUBVENCAO, SEI_VERIFICACAO };

if (require.main === module) {
  extrair()
    .then((r) => {
      console.log(JSON.stringify({ executadoEm: r.executadoEm, totais: r.totais, soma2025: r.soma2025, descartados2024: r.descartados2024 }, null, 2));
    })
    .catch((err) => {
      console.error('FALHA NA EXTRAÇÃO:', err.message);
      process.exit(1);
    });
}
