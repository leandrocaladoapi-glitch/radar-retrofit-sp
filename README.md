# Radar Retrofit São Paulo

Plataforma pública de inteligência sobre oportunidades de retrofit, requalificação imobiliária e Subvenção Econômica na região central da cidade de São Paulo, desenvolvida para a **LCF Consulting**.

## Visão Geral
A plataforma transforma dados públicos da Prefeitura, GeoSampa, Diário Oficial e Portal da Subvenção em inteligência de mercado estruturada.

## Como Funciona a Arquitetura (Dados)
Devido à ausência de APIs JSON abertas nos sistemas da Prefeitura, este projeto utiliza um modelo híbrido:
1. Um script de Ingestão de Dados (ETL) localizado em `scripts/fetch_subvencao.js` é executado antes do build.
2. Ele estrutura as informações e gera arquivos estáticos no diretório `src/data/`.
3. A aplicação Next.js (App Router) consome esses arquivos JSON para gerar páginas estáticas extremamente rápidas (SSG).

## Como Rodar Localmente
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Rode o ambiente de desenvolvimento (o script ETL é rodado automaticamente no build, mas para desenvolvimento você pode rodá-lo antes caso necessário: `node scripts/fetch_subvencao.js`):
   ```bash
   npm run dev
   ```
3. Acesse `http://localhost:3000`.

## 🚀 Como Fazer o Deploy no Vercel (Passo a Passo)
O código já está **100% pronto e configurado para o Vercel**. Como não tenho acesso às credenciais da sua conta Vercel, você só precisa fazer o seguinte:

1. **Suba este código para o GitHub** (caso ainda não esteja no repositório final).
2. Acesse sua conta no [Vercel](https://vercel.com).
3. Clique no botão **"Add New..."** e escolha **"Project"**.
4. Importe o repositório do GitHub onde este código está hospedado.
5. O Vercel detectará automaticamente que é um projeto **Next.js**.
6. **Não é necessário alterar nenhuma configuração de build**. O comando de build (`node scripts/fetch_subvencao.js && next build`) já foi modificado no `package.json` para rodar o script de dados automaticamente antes de gerar o site.
7. Clique em **"Deploy"**.

Em 2 minutos, seu site estará no ar e funcional!

## Atualização Automática (GitHub Actions)
O projeto já conta com um workflow em `.github/workflows/etl.yml`. Se você hospedar isso no GitHub, ele rodará duas vezes ao dia (08:00 e 18:00 BRT) para atualizar os dados automaticamente e gerar um novo build no Vercel.
