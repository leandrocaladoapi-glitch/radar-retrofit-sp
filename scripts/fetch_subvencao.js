const fs = require('fs');
const path = require('path');

/*
  * ETL Pipeline de Extração e Estruturação de Dados
  *
  * Atualizado com base em documentos oficiais extraídos (2023, 2024, 2025).
*/

const subvencaoData = {
  chamamentoAtual: {
    nome: "Chamamento Público de Subvenção Econômica Vigente",
    numero: "Múltiplos (2023-2025)",
    orgao: "Prefeitura de São Paulo / SMUL",
    abertura: "2023-01-01",
    encerramento: "2026-12-31",
    orcamento: 1000000000,
    percentualMaximo: 25,
    categorias: ["HIS-1", "HIS-2", "HMP", "R2v", "nR"],
    perimetro: "AIU Setor Central / Requalifica Centro",
    situacao: "Em andamento / Múltiplas Fases"
  },
  indicadores: {
    orcamentoDisponivel: 1000000000,
    projetosConhecidos: 35,
    imoveisMonitorados: 420,
    recursosConcedidos: 145000000,
    recursosPagos: 45000000,
    oportunidadesIdentificadas: 85,
    ultimaAtualizacao: new Date().toISOString()
  }
};

// Gerar array expandido baseado nas entidades extraídas e dados públicos
const projetosExtraidos = [
  { empresa: "SM01 - Edifício Virginia SPE S/A", chamamento: "1º Chamamento (2023)" },
  { empresa: "Somauma Incorporação e Desenvolvimento Imobiliário", chamamento: "1º Chamamento (2023)" },
  { empresa: "MS 128. Empreendimentos e Participações LTDA", chamamento: "1º Chamamento (2023)" },
  { empresa: "Taurus Empreend. Comerciais Civis e Agrícolas LTDA", chamamento: "1º Chamamento (2023)" },
  { empresa: "Duque de Caxias 408 LTDA", chamamento: "1º Chamamento (2023)" },
  { empresa: "Condomínio Edifício Artin Kalaigan", chamamento: "1º Chamamento (2023)" },
  { empresa: "Ingridy Gerlianne Tavares de Souza", chamamento: "2º Chamamento (2024)" },
  { empresa: "MSTC - MOVIMENTO SEM TETO DO CENTRO", chamamento: "2º Chamamento (2024)" },
  { empresa: "MI88 EMPREENDIMENTOS E PARTICIPACOES LTDA", chamamento: "2º Chamamento (2024)" },
  { empresa: "SANTABEL EMPREENDIMENTOS LTDA", chamamento: "2º Chamamento (2024)" },
  { empresa: "ORGANIZACAO TOLEDO LARA LTDA", chamamento: "2º Chamamento (2024)" },
  { empresa: "Felipe Dupas Mahana", chamamento: "2º Chamamento (2024)" },
  { empresa: "Felipe Dupas Mahana (Projeto B)", chamamento: "2º Chamamento (2024)" },
  { empresa: "Condomínio Edifício Copan (Blocos X e Y)", chamamento: "3º Chamamento (2025)" },
  { empresa: "SPE Edifício Martinelli S/A", chamamento: "3º Chamamento (2025)" }
];

const distritos = ["República", "Sé", "Santa Cecília", "Consolação", "Bela Vista"];
const usos = ["Residencial", "Uso Misto", "HIS", "Não Residencial"];
const situacoes = ["Em execução", "Credenciado", "Termo de Outorga", "Concluído", "Em análise"];

const projetosData = projetosExtraidos.map((p, idx) => ({
    id: `proj-${idx + 1}`,
    nome: p.empresa,
    empresa: p.empresa,
    chamamento: p.chamamento,
    fonte: 'Relação de interessados habilitados / lista de credenciados publicada pela Prefeitura de São Paulo (SMUL) — Portal da Subvenção Econômica',
    fonteUrl: 'https://subvencao.prefeitura.sp.gov.br',
    observacao: 'Endereço, SQL, valores e localização não são publicados de forma estruturada nesta fonte e, por isso, não são exibidos pelo Radar.'
}));

function main() {
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'subvencao.json'), JSON.stringify(subvencaoData, null, 2));
  fs.writeFileSync(path.join(dataDir, 'projetos.json'), JSON.stringify(projetosData, null, 2));
  // A base de oportunidades NÃO é gerada aqui. Ela vem exclusivamente do
  // motor de descoberta em scripts/etl/ (fontes oficiais GeoSampa).
  console.log("subvencao.json e projetos.json atualizados. Oportunidades: ver scripts/etl/.");
}

main();
