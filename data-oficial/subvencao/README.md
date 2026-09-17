# Documentos oficiais — Subvenção Econômica (SMUL)

Cópias locais dos documentos públicos usados como fonte da base de projetos do
Radar. A extração é feita por código (`scripts/etl/subvencao_docs.js`) e cada
campo publicado é conferido **verbatim** contra o texto destes PDFs pelo teste
de integridade (`npm run verify:data-integrity`).

| Arquivo | Documento | Autenticidade |
|---|---|---|
| `2023-Relacao-Interessados-Habilitados.pdf` | Relação de habilitados — Chamamento 01/2023/SMUL (07/12/2023) | Relação nominal publicada pela SMUL |
| `2024-Relacao-Interessados-Habilitados.pdf` | Lista Fase I — Chamamento 02/2024/SMUL (DOC 10/07/2024) | SEI 6068.2024/0005871-1 · verificador 106440352 · CRC 9534D549 |
| `2025-Lista_Credenciados.pdf` | Lista de credenciados Fase II — Chamamento 01/2025/SMUL (19/09/2025) | SEI 6068.2025/0004742-8 · verificador 142837382 · CRC 3EB6DE09 |

Conferência de autenticidade (2024/2025): http://processos.prefeitura.sp.gov.br
Portal do programa: https://subvencao.prefeitura.sp.gov.br

**Não edite estes PDFs.** Qualquer divergência entre o JSON publicado e estes
arquivos falha o build.
