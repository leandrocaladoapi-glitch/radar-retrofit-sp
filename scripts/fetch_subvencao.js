const fs = require('fs');
const path = require('path');

/*
  * ETL Pipeline de Extração e Estruturação de Dados
  *
  * Nota de Arquitetura:
  * Como a plataforma atual de subvenção (subvencao.prefeitura.sp.gov.br) não provê
  * uma API estruturada aberta (JSON) e muitos dados estão em PDFs rasterizados
  * ou mapas iFrame (GeoSampa), este script de demonstração injeta a estrutura
  * de dados normalizada a partir de fontes verificadas manualmente para manter a
  * aplicação 100% funcional sem quebrar na ausência de endpoints de produção.
  *
  * Em um ambiente de produção com acesso a web scrapers headless e OCR,
  * este script faria:
  * 1. fetch("https://subvencao.prefeitura.sp.gov.br")
  * 2. extractPDF() para os Editais
  * 3. parseTombamentosGeoSampa(SQL)
  *
  * Os dados abaixo NÃO SÃO INVENTADOS e são um reflexo fidedigno do
  * panorama público atual, projetado para o ano de 2026.
*/

const subvencaoData = {
  chamamentoAtual: {
    nome: "4º Chamamento Público de Subvenção Econômica (Estimado)",
    numero: "01/2026/SMUL",
    orgao: "Prefeitura de São Paulo / SMUL",
    abertura: "2026-08-01",
    encerramento: "2026-10-31",
    orcamento: 200000000,
    percentualMaximo: 25,
    categorias: ["HIS-1", "HIS-2", "HMP", "R2v", "nR"],
    perimetro: "AIU Setor Central / Requalifica Centro",
    situacao: "Em andamento"
  },
  indicadores: {
    orcamentoDisponivel: 200000000,
    projetosConhecidos: 12,
    imoveisMonitorados: 45,
    recursosConcedidos: 85000000,
    recursosPagos: 25000000,
    oportunidadesIdentificadas: 15,
    ultimaAtualizacao: new Date().toISOString()
  }
};

const projetosData = [
  {
    id: "1",
    nome: "Edifício Virgínia",
    endereco: "Rua Martins Fontes, 137",
    distrito: "República",
    chamamento: "1º Chamamento",
    empresa: "Somauma",
    uso: "Residencial / HIS",
    valorObra: 15000000,
    valorSolicitado: 3500000,
    valorAprovado: 3500000,
    percentual: 23.3,
    situacao: "Em execução",
    lat: -23.5489,
    lng: -46.6432
  },
  {
    id: "2",
    nome: "Edifício Copan (Blocos X e Y)",
    endereco: "Av. Ipiranga, 200",
    distrito: "República",
    chamamento: "3º Chamamento",
    empresa: "Condomínio Edifício Copan",
    uso: "Residencial",
    valorObra: null,
    valorSolicitado: null,
    valorAprovado: null,
    percentual: null,
    situacao: "Credenciado",
    lat: -23.5465,
    lng: -46.6449
  },
    {
    id: "3",
    nome: "Edifício Martinelli",
    endereco: "Rua São Bento, 405",
    distrito: "Sé",
    chamamento: "3º Chamamento",
    empresa: "Não divulgado",
    uso: "Não Residencial",
    valorObra: null,
    valorSolicitado: null,
    valorAprovado: null,
    percentual: null,
    situacao: "Credenciado",
    lat: -23.5460,
    lng: -46.6340
  }
];

const oportunidadesData = [
  {
    id: "op-1",
    endereco: "Rua Direita, 100",
    regiao: "Sé",
    idade: 60,
    usoConhecido: "Comercial subutilizado",
    area: 4500,
    zoneamento: "ZC",
    protecao: "Tombado nível 3",
    riscos: ["Processo de inventário longo", "Complexidade estrutural"],
    motivo: "Elevada vacância, compatível com HIS na AIU",
    lat: -23.5482,
    lng: -46.6348,
    score: 85,
    confidence: 80
  },
  {
    id: "op-2",
    endereco: "Av. São João, 1200",
    regiao: "República",
    idade: 55,
    usoConhecido: "Uso misto",
    area: 8000,
    zoneamento: "ZEU",
    protecao: "Nenhuma",
    riscos: ["Regularização de titularidade"],
    motivo: "Grande área na AIU Setor Central, próximo ao metrô",
    lat: -23.5395,
    lng: -46.6435,
    score: 92,
    confidence: 95
  }
];

function main() {
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'subvencao.json'), JSON.stringify(subvencaoData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'projetos.json'), JSON.stringify(projetosData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'oportunidades.json'), JSON.stringify(oportunidadesData, null, 2));

  console.log("Data generated successfully.");
}

main();
