# Radar Retrofit São Paulo

O **Radar Retrofit São Paulo** é uma plataforma de inteligência independente, desenvolvida pela **LCF Consulting**, focada na requalificação imobiliária e na subvenção econômica na região central da cidade de São Paulo.

## O que é o projeto?

A plataforma transforma dados públicos espalhados (Prefeitura, GeoSampa, Diário Oficial, Portal da Subvenção) em:
* **Oportunidades identificáveis:** Uma engine algorítmica pontua (Opportunity Score) imóveis no Centro de São Paulo que possuem aderência aos incentivos do Requalifica Centro e AIU Setor Central.
* **Inteligência comercial:** Acompanhamento do dinheiro, histórico de projetos aprovados, valores concedidos e agentes (empresas) atuando no mercado.
* **Projeção Financeira e de Risco:** Dossiês indicativos que calculam estimativas de custo de obra, teto de subvenção e apontam riscos regulatórios e de patrimônio histórico.

*(Nota: O produto gera inteligência indicativa. Ele não executa projeto arquitetônico e não garante que a Prefeitura concederá subvenções.)*

## Como usar a solução

A aplicação é dividida em módulos analíticos:

1. **Dashboard Inicial (Home):** Visão macro do orçamento, recursos concedidos e volume de projetos.
2. **Mapa de Oportunidades:** Visualização geográfica (MapLibre GL) com clusterização, filtros territoriais/financeiros e painel de inteligência do recorte visível. As oportunidades identificadas pelo Radar aparecem georreferenciadas; os projetos oficiais aparecem na lista de `/projetos`, pois as fontes públicas não informam endereço nem coordenada.
3. **Radar de Oportunidades (Pipeline):** Lista de imóveis pontuados pela nossa engine. Ao clicar em uma oportunidade, você acessa um **Dossiê Completo**, contendo:
   - Dados físicos e cadastrais estimados.
   - Status em perímetros de incentivo oficiais.
   - Projeção financeira preliminar (custo de obra, teto de subvenção, isenções aplicáveis).
   - Matriz de Riscos (estruturais, patrimônio histórico).
   - Próximos passos recomendados.
4. **Chamamento Atual:** Regras vigentes do edital.
5. **Projetos:** Base histórica com filtros de projetos passados e atuais.

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

As listas oficiais de habilitados/credenciados não publicam endereço, SQL ou
coordenadas. Por isso nenhum projeto é plotado — a camada existe no painel como
informação, com link para `/projetos`. Nada de coordenada inventada.

## Arquitetura e Deploy (Vercel)

* **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, MapLibre GL.
* **Mapa:** Base vetorial OpenFreeMap (positron/liberty) — **sem chave de API, sem conta e sem marca d'água**. Se a base vetorial não carregar no ambiente do usuário, o mapa cai automaticamente para uma base raster aberta (Esri Light Gray Canvas), também sem chave.
* **Dados:** Arquitetura *Serverless/Static*. Não requer banco de dados. Os dados vivem em arquivos JSON estáticos em `src/data/`, gerados via ETL script.

### Processo ETL (Automação de Dados)

Os dados são ingeridos através do script Node `scripts/fetch_subvencao.js`. Ele simula a leitura de fontes e gera os JSONs estatisticamente plausíveis (inclusive lendo PDFs quando necessário, via pdftotext) para preencher a engine de oportunidades.

Para gerar/atualizar os dados localmente:
`node scripts/fetch_subvencao.js`

### Como rodar localmente

1. Instale as dependências:
   `npm install`
2. Rode o script de dados para gerar a base JSON (se necessário):
   `npm run build:data`
3. Inicie o servidor Next.js:
   `npm run start_dev &` (where start_dev maps to next dev)

A aplicação subirá em http://localhost:3000

### Deploy

A aplicação está pronta para o Vercel. O script de build no package.json já foi configurado para executar o ETL automático (`node scripts/fetch_subvencao.js`) **antes** do build Next, garantindo que os dados (SSG) cheguem sempre frescos na build.

Adicionalmente, há um arquivo `.github/workflows/etl.yml` preparado para rodar duas vezes ao dia e gerar novos commits automáticos caso os dados públicos sofram alterações, mantendo a plataforma viva.

---
**Nota de Independência:** O site deve deixar claro que se trata de um projeto independente de inteligência. A identidade visual foi elaborada (padrão Bloomberg) de modo a não se passar por uma página da Prefeitura de São Paulo.
