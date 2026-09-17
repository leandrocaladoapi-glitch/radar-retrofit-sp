#!/usr/bin/env node
/*
 * Copia o worker do MapLibre GL para public/maplibre/.
 *
 * Por que isso é necessário: o maplibre-gl resolve a URL do seu worker a partir do
 * import.meta.url do próprio pacote. Em bundle de produção (webpack/Next), esse
 * import.meta.url é substituído por um caminho de arquivo (file:///.../node_modules/
 * maplibre-gl/dist/maplibre-gl.mjs), que não passa na validação do pacote — a função
 * devolve string vazia e `new Worker('')` falha. Sem worker não há processamento de
 * tiles vetoriais, GeoJSON, clusterização nem colocação de símbolos: as fontes nunca
 * ficam "carregadas", o evento `load` do mapa nunca dispara e a tela fica presa em
 * "Carregando mapa…".
 *
 * A correção é servir os arquivos do worker como estáticos (/maplibre/*.mjs) e apontar
 * config.WORKER_URL para eles (ver src/components/map/MapCanvas.tsx).
 */
const fs = require('fs')
const path = require('path')

const raiz = path.join(__dirname, '..')
const origem = path.join(raiz, 'node_modules', 'maplibre-gl', 'dist')
const destino = path.join(raiz, 'public', 'maplibre')
// O worker importa ./maplibre-gl-shared.mjs, então os dois arquivos andam juntos.
const arquivos = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']

if (!fs.existsSync(origem)) {
  console.error(`[maplibre-worker] maplibre-gl não instalado (${origem}); nada a copiar.`)
  process.exit(1)
}

fs.mkdirSync(destino, { recursive: true })

for (const arquivo of arquivos) {
  const de = path.join(origem, arquivo)
  const para = path.join(destino, arquivo)
  if (!fs.existsSync(de)) {
    console.error(`[maplibre-worker] arquivo ausente no pacote: ${arquivo}`)
    process.exit(1)
  }
  const conteudo = fs.readFileSync(de)
  const atual = fs.existsSync(para) ? fs.readFileSync(para) : null
  if (atual && atual.equals(conteudo)) {
    console.log(`[maplibre-worker] ${arquivo} já está atualizado.`)
    continue
  }
  fs.writeFileSync(para, conteudo)
  console.log(`[maplibre-worker] ${arquivo} copiado para public/maplibre/.`)
}
