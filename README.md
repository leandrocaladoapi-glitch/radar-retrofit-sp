# Radar Retrofit São Paulo

O **Radar Retrofit São Paulo** é uma plataforma de inteligência independente, desenvolvida pela **LCF Consulting**, focada na requalificação imobiliária e na subvenção econômica na região central da cidade de São Paulo.

## O que é o projeto?

A plataforma transforma dados públicos espalhados (GeoSampa, listas oficiais da SMUL, Portal da Subvenção) em:
* **Oportunidades identificáveis:** Uma engine algorítmica pontua (Opportunity Score) imóveis reais no Centro de São Paulo que possuem aderência aos incentivos do Requalifica Centro e AIU Setor Central.
* **Inteligência comercial:** Histórico de habilitados/credenciados extraído das listas oficiais, valores máximos Fase II/2025 e agentes (empresas) atuando no mercado. Valores concedidos ou pagos não são publicados — nenhuma fonte oficial localizada até o momento.
* **Projeção Financeira e de Risco:** Dossiês que exibem dados cadastrais oficiais, estimativas paramétricas de custo de obra e teto de subvenção (sempre rotuladas como estimativas do Radar) e apontam riscos regulatórios e de patrimônio histórico.

**Política de integridade: zero dado inventado.** Todo campo oficial publicado possui proveniência (fonte + URL/documento + data). O comando `npm run verify:data-integrity` falha o build diante de qualquer dado não comprovado. O que não pode ser verificado não é publicado.

*(Nota: O produto gera inteligência indicativa. Ele não executa projeto arquitetônico e não garante que a Prefeitura concederá subvenções.)*

## Como usar a solução

A aplicação é dividida em módulos analíticos:

1. **Dashboard Inicial (Home):** Visão macro calculada da base real (imóveis monitorados, credenciados Fase II/2025, registros SMUL, teto do programa em lei).
2. **Mapa de Oportunidades:** Visualização geográfica (MapLibre GL) com clusterização, filtros territoriais/financeiros e painel de inteligência do recorte visível. As oportunidades identificadas pelo Radar aparecem georreferenciadas (centroide da geometria oficial do lote); os projetos oficiais aparecem na lista de `/projetos`, pois as listas não publicam coordenadas (a lista 2025 publica endereços, sem georreferência oficial).
3. **Radar de Oportunidades (Pipeline):** Lista de imóveis reais pontuados pela nossa engine. Ao clicar em uma oportunidade, você acessa um **Dossiê Completo**, contendo:
   - Dados cadastrais oficiais (SQL, endereço, áreas, uso, zoneamento).
   - Status em perímetros de incentivo oficiais (cruzamento geométrico).
   - Estimativas do Radar (custo de obra, teto teórico de subvenção) — nunca apresentadas como dados da Prefeitura.
   - Matriz de Riscos (patrimônio histórico, lacunas de informação).
   - Fontes e proveniência por campo + data da última verificação.
4. **Chamamentos:** Os três chamamentos com listas oficiais extraídas (01/2023, 02/2024, 01/2025/SMUL), com documentos, SEI e valores Fase II/2025.
5. **Projetos:** Base histórica com busca, extraída verbatim das listas oficiais.

## Mapa de Oportunidades (arquitetura)

O mapa vive em `/mapa` e é alimentado por `src/data/mapa.json`, gerado por
`scripts/build_mapa_index.js` a partir de `src/data/oportunidades.json`
(projeção 1:1 — nenhum registro é criado, removido ou reinterpretado).

* **Clusterização nativa (MapLibre):** os pontos são agrupados por proximidade com
  contagem visível; ao aproximar o zoom, os grupos se abrem progressivamente e o
  clique no agrupamento enquadra a área. Isso elimina o efeito de "tapete de bolinhas".
* **Tipologia visual:** oportunidade, oportunidade prioritária (score ≥ 85),
  imóvel protegido e protegido + prioritário — distinguidos por cor **e** forma
  (círculo, losango, escudo), com legenda descritiva.
* **Filtros:** tipo de registro, distrito, score mínimo, Requalifica Centro,
  AIU Setor Central, status patrimonial, uso cadastrado, faixa de área
  construída, faixa de custo estimado e faixa de subvenção teórica (teto),
  além de busca livre por endereço/SQL/distrito.
* **Painel de inteligência:** recalcula, para o recorte visível (viewport ∩ filtros),
  quantidade de imóveis, prioritárias, protegidos, score médio, área média,
  custo médio/total, subvenção teórica agregada, distribuição por distrito e
  por tipo, e as principais oportunidades visíveis.
* **Camadas:** imóveis pontuados, destaque de prioritárias, destaque de patrimônio,
  perímetro Requalifica Centro, perímetro AIU Setor Central, divisas distritais e
  alternância de base cartográfica.
* **Interação:** clique no marcador abre o card com identificação, tipologia,
  score, áreas, uso, status patrimonial, enquadramento territorial e link para o
  dossiê; hover mostra tooltip leve.

### Geometria oficial dos perímetros

`scripts/fetch_perimetros.js` (executado no build) consulta o WFS oficial do
GeoSampa e grava `public/data/perimetros.json` com o **desenho simplificado** dos
perímetros e das divisas distritais. A classificação `dentro/intersecta/fora` de
cada imóvel **não** vem desse arquivo: é calculada no ETL com a geometria
completa. Se a fonte oficial estiver indisponível, o script apenas avisa e o mapa
segue em modo *destaque* (marca os imóveis dentro do perímetro, sem desenhar polígono).

### Projetos no mapa

As listas oficiais de habilitados/credenciados não publicam coordenadas (a lista
2025 publica endereços, sem georreferência oficial). Por isso nenhum projeto é
plotado — a camada existe no painel como informação, com link para `/projetos`.
Nada de coordenada inventada.

## Arquitetura e Deploy (Vercel)

* **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL.
* **Mapa:** Base vetorial OpenFreeMap (positron/liberty) — **sem chave de API, sem conta e sem marca d'água**. Se a base vetorial não carregar no ambiente do usuário, o mapa cai automaticamente para uma base raster aberta (Esri Light Gray Canvas), também sem chave.
* **Dados:** Arquitetura *Serverless/Static*. Não requer banco de dados. Os dados vivem em arquivos JSON estáticos em `src/data/`, gerados via ETL script.

### Processo ETL (Automação de Dados)

Pipeline 100% a partir de fontes oficiais — nenhum dado escrito à mão:

1. **Imóveis** (`scripts/etl/discover_opportunities.js`): consulta o WFS oficial do GeoSampa (camada Lote + Requalifica + AIU + zoneamento + tombamento + distritos), cruza geometrias e calcula score/confiança.
2. **Validação** (`scripts/etl/validate_and_publish.js` + `qa_audit.js`): requisitos eliminatórios, confidence ≥ 70%, arquivamento (nunca deleção silenciosa) e histórico antes/depois.
3. **Subvenção** (`scripts/fetch_subvencao.js` + `scripts/etl/subvencao_docs.js`): extrai por código os 3 PDFs oficiais em `data-oficial/subvencao/` e calcula todos os indicadores (nenhum número digitado).
4. **Artigos** (`scripts/generate_articles.js`): só publica a partir de agregados reais + eventos do histórico, sempre com fontes linkadas.
5. **Trava** (`scripts/verify_data_integrity.js`, via `npm run verify:data-integrity`): falha o build se houver mock, campo oficial sem fonte, indicador divergente ou artigo sem evidência.

Para regenerar os dados derivados localmente:
`npm run build:data && npm run verify:data-integrity`

Para rodar o ETL completo de imóveis (requer acesso ao WFS do GeoSampa):
`npm run etl:imoveis`

### Como rodar localmente

1. Instale as dependências:
   `npm install`
2. Verifique a integridade dos dados:
   `npm run verify:data-integrity`
3. Inicie o servidor Next.js:
   `npm run dev`

A aplicação subirá em http://localhost:3000

### Deploy

A aplicação está pronta para o Vercel. O script de build executa ETL derivado + trava de integridade **antes** do build Next, garantindo que dados não comprovados nunca cheguem à produção.

Adicionalmente, `.github/workflows/radar-etl.yml` roda duas vezes ao dia (08:00 e 18:00 BRT): executa o ETL completo nas fontes oficiais, valida, e gera commit automático **somente quando há mudança real** nos dados.

---
**Nota de Independência:** O site deve deixar claro que se trata de um projeto independente de inteligência. A identidade visual foi elaborada (padrão Bloomberg) de modo a não se passar por uma página da Prefeitura de São Paulo.
