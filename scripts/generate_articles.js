const fs = require('fs');
const path = require('path');

// Paths
const dataDir = path.join(__dirname, '..', 'src', 'data');
const artigosPath = path.join(dataDir, 'artigos.json');
const oportunidadesPath = path.join(dataDir, 'oportunidades.json');
const projetosPath = path.join(dataDir, 'projetos.json');
const subvencaoPath = path.join(dataDir, 'subvencao.json');

// Helper to format date in pt-BR
function formatDate(date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Helper to create a slug
function createSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, '-') // spaces to dashes
    .replace(/[^\w\-]+/g, '') // remove non-words
    .replace(/\-\-+/g, '-') // multiple dashes to single
    .replace(/^-+/, '') // trim dash from start
    .replace(/-+$/, ''); // trim dash from end
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
}

const ctaHtml = `
<div class="mt-10 p-6 bg-slate-50 border border-slate-200 rounded-xl">
  <h3 class="text-lg font-bold text-slate-900 mb-2">Quer identificar imóveis com potencial de retrofit no Centro de São Paulo?</h3>
  <p class="text-slate-600 mb-4">O Radar Retrofit SP monitora dezenas de propriedades com alta viabilidade financeira.</p>
  <a href="/oportunidades" class="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition">Explorar o Radar de Oportunidades</a>
</div>
`;

function loadJson(filePath, defaultVal) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
  }
  return defaultVal;
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function main() {
  console.log("Iniciando geração de artigos...");

  try {
    const oportunidades = loadJson(oportunidadesPath, []);
    const projetos = loadJson(projetosPath, []);
    const subvencao = loadJson(subvencaoPath, {});
    let artigos = loadJson(artigosPath, []);

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...

    // Check if we should generate the weekly article (e.g., every Monday)
    // For the sake of testing/initial run, if no articles exist, let's create a weekly one anyway.
    const isWeekly = dayOfWeek === 1 || artigos.length === 0;

    const newArticles = [];

    if (isWeekly) {
      // Generate Weekly Summary Article
      const weekNumber = Math.ceil(now.getDate() / 7);
      const title = `Oportunidades de Retrofit da Semana — ${formatDate(now)}`;
      const slug = createSlug(`oportunidades-retrofit-semana-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`);

      // Avoid exact duplicates
      if (!artigos.find(a => a.slug === slug)) {
        const topOportunidades = [...oportunidades].sort((a, b) => b.score - a.score).slice(0, 3);
        const topProjetos = [...projetos].sort((a, b) => b.valorAprovado - a.valorAprovado).slice(0, 2);

        let content = `
          <p class="lead text-lg text-slate-600 mb-6">Resumo das principais movimentações da semana no monitoramento do Radar Retrofit SP. Identificamos novos imóveis com potencial de subvenção e atualizamos o status de projetos no Centro.</p>

          <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">O que mudou esta semana</h2>
          <p class="mb-4">Na atualização de ${formatDate(now)}, a base do Radar registra um total de ${subvencao.indicadores?.oportunidadesIdentificadas || oportunidades.length} imóveis monitorados e um orçamento disponível de ${formatCurrency(subvencao.indicadores?.orcamentoDisponivel || 0)}.</p>

          <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Maiores Opportunity Scores</h2>
          <p class="mb-4">Nossa engine destacou os seguintes imóveis com alta aderência aos parâmetros de retrofit:</p>
          <ul class="space-y-4 mb-6">
            ${topOportunidades.map(op => `
              <li class="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                <a href="/oportunidades/${op.id}" class="font-bold text-blue-700 hover:underline text-lg block mb-1">${op.endereco}</a>
                <span class="text-sm text-slate-500 block mb-2">${op.regiao} • Score: <strong class="text-slate-800">${op.score}/100</strong></span>
                <p class="text-sm text-slate-600">${op.motivo}</p>
              </li>
            `).join('')}
          </ul>

          <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Destaques em Projetos e Incentivos</h2>
          <p class="mb-4">Entre os projetos acompanhados, destacamos movimentações relevantes:</p>
          <ul class="space-y-4 mb-6">
            ${topProjetos.map(proj => `
              <li class="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                <strong class="text-slate-900 block mb-1">${proj.nome} (${proj.empresa})</strong>
                <p class="text-sm text-slate-600">Situado em ${proj.distrito}, o projeto encontra-se <em>${proj.situacao}</em> com valor aprovado estimado em ${formatCurrency(proj.valorAprovado)}.</p>
              </li>
            `).join('')}
          </ul>

          <p class="mb-4">Continue acompanhando nossa plataforma para mais informações e alertas.</p>
          ${ctaHtml}
        `;

        newArticles.push({
          id: `art-weekly-${Date.now()}`,
          title,
          slug,
          dataPublicacao: now.toISOString(),
          dataAtualizacao: now.toISOString(),
          descricao: `Resumo das principais movimentações da semana no Radar Retrofit SP, incluindo novas oportunidades e projetos.`,
          categoria: 'Semanal',
          tags: ['Resumo Semanal', 'Oportunidades', 'Retrofit Centro'],
          conteudo: content
        });
      }
    } else {
      // Daily Content generation based on an interesting opportunity not recently covered
      // Let's pick a random high score opportunity
      const highScores = oportunidades.filter(op => op.score >= 80);
      const op = highScores[Math.floor(Math.random() * highScores.length)] || oportunidades[0];

      if (op) {
        const title = `Radar identifica nova oportunidade de retrofit na região de ${op.regiao}`;
        const slug = createSlug(`oportunidade-retrofit-${op.regiao}-${op.id}`);

        if (!artigos.find(a => a.slug === slug)) {
          let content = `
            <p class="lead text-lg text-slate-600 mb-6">Na atualização mais recente do Radar Retrofit São Paulo, nossa engine identificou um novo imóvel com potencial significativo para requalificação e acesso à subvenção econômica.</p>

            <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Sobre o Imóvel</h2>
            <p class="mb-4">Localizado na região de <strong>${op.regiao}</strong>, o imóvel possui aproximadamente <strong>${op.area}m²</strong> e uso conhecido atual como <em>${op.usoConhecido}</em>. A inteligência do Radar atribuiu a este imóvel um <strong>Opportunity Score de ${op.score}/100</strong>.</p>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <p class="text-blue-900 font-medium">Motivo do destaque: ${op.motivo}</p>
            </div>

            <h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Viabilidade Financeira e Regulatória</h2>
            <p class="mb-4">Estando em zoneamento ${op.zoneamento} e inserido no perímetro de ${op.perimetros?.join(', ')}, o imóvel apresenta potencial máximo de subvenção econômica estimado em <strong>${formatCurrency(op.financeiro?.potencialMaximoSubvencao)}</strong>, dado um custo de obra projetado de ${formatCurrency(op.financeiro?.estimativaCustoObra)}.</p>

            <p class="mb-4">É importante notar os riscos regulatórios e operacionais associados, tais como: ${op.riscos?.join(', ')}. O imóvel possui status de proteção: ${op.protecao}.</p>

            <p class="mb-6">Para acessar a análise completa, incluindo VGV potencial estimado e isenções fiscais aplicáveis, acesse a página detalhada da oportunidade.</p>

            <div class="text-center my-8">
              <a href="/oportunidades/${op.id}" class="inline-block bg-slate-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-slate-800 transition shadow-md">Ver Dossiê Completo da Oportunidade</a>
            </div>

            ${ctaHtml}
          `;

          newArticles.push({
            id: `art-daily-${Date.now()}`,
            title,
            slug,
            dataPublicacao: now.toISOString(),
            dataAtualizacao: now.toISOString(),
            descricao: `Nova oportunidade identificada na região de ${op.regiao} com alto Opportunity Score no Radar Retrofit SP.`,
            categoria: 'Oportunidades',
            tags: ['Novas Oportunidades', op.regiao, 'Análise Indicativa'],
            conteudo: content
          });
        }
      }
    }

    if (newArticles.length > 0) {
      artigos = [...newArticles, ...artigos];
      saveJson(artigosPath, artigos);
      console.log(`Sucesso: ${newArticles.length} artigo(s) gerado(s).`);
    } else {
      console.log("Nenhum artigo novo gerado (possível duplicidade ou sem pautas).");
    }

  } catch (error) {
    console.error("Erro fatal durante a geração de artigos. Protegendo a build...", error);
    // Exit code 0 to NOT break the Next.js build or ETL action
    process.exit(0);
  }
}

main();
