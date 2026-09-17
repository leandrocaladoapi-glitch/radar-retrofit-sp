import PageHeader from '../../components/ui/PageHeader'

export default function MetodologiaPage() {
  return (
    <div className="page-shell page-shell-narrow max-w-3xl space-y-6">
      <PageHeader title="Metodologia e Transparência" />

      <article className="card radar-prose p-6 md:p-10">
        <p>O <strong>Radar Retrofit São Paulo</strong> é uma ferramenta independente de inteligência de mercado desenvolvida pela LCF Consulting. Nossa missão é consolidar e estruturar dados públicos dispersos para facilitar a análise de oportunidades de requalificação imobiliária.</p>

        <h3>1. Fontes de Dados</h3>
        <p>A base de oportunidades é construída exclusivamente a partir de serviços oficiais (WFS/GeoJSON) do GeoSampa e de normas municipais:</p>
        <ul>
          <li><strong>Cadastro Imobiliário Fiscal — camada Lote</strong> (<code>geoportal:lote_cidadao</code>): SQL, endereço cadastral, área construída, área de terreno, uso e situação do lote.</li>
          <li><strong>Requalifica Centro — Perímetro Área Central</strong> (<code>geoportal:requalifica_centro_perimetro_geral</code>), Lei nº 17.577/2021 e Lei nº 18.081/2023.</li>
          <li><strong>AIU Setor Central</strong> (<code>geoportal:perimetro_aiu</code>).</li>
          <li><strong>Zoneamento vigente</strong> (<code>geoportal:perimetro_zona_lei_18177_24</code>), LPUOS Lei nº 18.177/2024.</li>
          <li><strong>Bens tombados</strong> (<code>geoportal:patrimonio_cultural_bem_tombado</code>): CONPRESP, CONDEPHAAT e IPHAN, consolidado pelo DPH/SMC.</li>
          <li><strong>Distritos municipais</strong> (<code>geoportal:distrito_municipal</code>).</li>
          <li><strong>Portal da Subvenção Econômica</strong> (SMUL): regras do chamamento e listas de habilitados/credenciados.</li>
        </ul>
        <p>Cada campo publicado carrega a sua própria proveniência (fonte, camada, URL e data de coleta). Não há dados sintéticos, fallback fictício nem inserção manual de imóveis.</p>

        <h3>2. Regras de entrada no Radar</h3>
        <ul>
          <li>Lote com situação cadastral <strong>ATIVO</strong> no Cadastro Imobiliário Fiscal.</li>
          <li>Área construída cadastrada ≥ 3.000 m².</li>
          <li>Relação espacial verificada <em>por geometria</em> (não por nome de bairro) com o perímetro do Requalifica Centro e/ou da AIU Setor Central.</li>
          <li>Endereço cadastral e SQL oficiais presentes na fonte.</li>
        </ul>

        <h3>3. Opportunity Score (0-100)</h3>
        <p>Indicador do Radar, calculado apenas sobre atributos oficiais verificados, com componentes explícitos e reproduzíveis em cada página:</p>
        <ul>
          <li><strong>Enquadramento territorial (30 pts):</strong> relação geométrica com Requalifica Centro e AIU Setor Central.</li>
          <li><strong>Escala construída (20 pts):</strong> área construída do cadastro oficial.</li>
          <li><strong>Potencial de conversão de uso (15 pts):</strong> uso cadastrado.</li>
          <li><strong>Aproveitamento do terreno (15 pts):</strong> coeficiente de aproveitamento cadastral.</li>
          <li><strong>Zoneamento vigente (10 pts):</strong> zona da Lei 18.177/2024.</li>
          <li><strong>Qualidade documental (10 pts):</strong> SQL, endereço e geometria oficiais.</li>
        </ul>
        <p>O score <strong>não compensa</strong> ausência de identificação real: sem endereço, SQL e fonte oficial, o imóvel não é publicado, qualquer que seja a pontuação.</p>

        <h3>4. Data Confidence e critérios de publicação</h3>
        <p>São requisitos <strong>eliminatórios</strong>: endereço real, identificação cadastral oficial (SQL) e fonte oficial com URL. Além disso, exige-se geometria verificável, distrito oficial, relação espacial com perímetro relevante e ausência de contradições lógicas. Só então aplica-se o Data Confidence, que precisa ser <strong>≥ 70%</strong>. Registros abaixo disso permanecem como candidatos internos, não publicados.</p>

        <h3>5. Fato x estimativa</h3>
        <p>Cada informação é rotulada como <strong>DADO OFICIAL</strong>, <strong>DADO CALCULADO</strong> (derivado de geometria oficial), <strong>ANÁLISE DO RADAR</strong> (score) ou <strong>ESTIMATIVA DO RADAR</strong>.</p>
        <p><strong>Custo de retrofit:</strong> Área construída oficial × R$ 4.800/m² (data-base 2025-01, ordem de grandeza derivada de índices públicos CUB-SP/SINAPI com adicional de retrofit) × fator de complexidade patrimonial × fator de porte. Apresentado arredondado em milhões, para não sugerir precisão inexistente.</p>
        <p><strong>Subvenção:</strong> teto teórico preliminar de <em>até 25%</em> do custo estimado, conforme Lei nº 17.577/2021 e regras do chamamento vigente. Não é valor concedido nem direito adquirido — depende de enquadramento, limites do edital e análise oficial.</p>
        <p><strong>VGV:</strong> não é publicado. O Radar não dispõe de preço/m² de venda auditável por endereço nem de área vendável confirmada; preferimos não exibir número a produzir falsa precisão.</p>
        <p><strong>Patrimônio:</strong> um edifício antigo não é chamado de &quot;histórico&quot; em sentido regulatório. Só há menção a proteção quando existe registro na base oficial de tombamento. Ocupação/vacância não é afirmada sem evidência: quando há apenas indicador cadastral, o texto usa &quot;possível subutilização identificada&quot; e explica a evidência.</p>

        <h3>6. Atualização automática</h3>
        <p>O pipeline (fontes oficiais → normalização → cruzamento geográfico → regras → confidence → validação → publicação → <strong>trava de integridade</strong>) roda automaticamente às <strong>08:00</strong> e <strong>18:00</strong> (America/Sao_Paulo). A cada execução são detectados novos registros e alterações, os scores são recalculados, oportunidades que deixam de cumprir critérios são <strong>arquivadas</strong> (nunca apagadas silenciosamente), o sitemap é atualizado e o histórico antes/depois é registrado para auditoria. O comando <code>npm run verify:data-integrity</code> falha o build diante de qualquer dado não comprovado — é ele, e não uma promessa editorial, que garante a política de zero invenção.</p>

        <h3>6.1. Listas de subvenção: extração reproduzível de documentos</h3>
        <p>Os registros de subvenção (habilitados/credenciados) são extraídos por código dos PDFs oficiais preservados em <code>data-oficial/subvencao/</code>: relação 01/2023/SMUL, lista Fase I 02/2024/SMUL (SEI 6068.2024/0005871-1) e lista de credenciados Fase II 01/2025/SMUL (SEI 6068.2025/0004742-8). Cada nome, endereço, protocolo, processo SEI e valor publicado é conferido <strong>verbatim</strong> (substring normalizada) contra o texto do PDF pelo teste de integridade. Protocolos sem nome atribuível com segurança são descartados e listados no log interno — nunca completados.</p>
        <p><strong>Valores 2025:</strong> a coluna publicada é o &quot;VALOR MÁXIMO DE SUBVENÇÃO&quot; da lista Fase II (19/09/2025). O próprio documento informa que os valores serão ajustados antes dos Termos de Outorga. O resultado final do 3º chamamento (16 contemplados, DOC 08/10/2025) é etapa posterior: os registros adicionais do resultado final não constam do documento Fase II e por isso não aparecem como registros individuais.</p>

        <h3>6.2. Artigos automáticos: só com evidência</h3>
        <p>O gerador de artigos só publica a partir de agregados reais da base e de eventos do histórico auditável do ETL. Sem novidade real, nada é gerado. Todo artigo carrega seção &quot;Fontes e evidências&quot; com links, e o teste de integridade rejeita artigos sem fontes, com links para imóveis inexistentes ou com campos de outro schema.</p>

        <h3>7. Limitações</h3>
        <p>O Radar não substitui análise técnica, jurídica e arquitetônica de profissionais habilitados. Condições estruturais, de instalações, segurança contra incêndio, situação dominial e ocupação não constam das fontes públicas utilizadas. Dados podem apresentar defasagem em relação ao processo interno da Prefeitura. Lacunas não são preenchidas por inferência.</p>

        <h3>8. Privacidade</h3>
        <p>O foco é o imóvel e a oportunidade. Não são publicados telefone, CPF ou dados pessoais de proprietários.</p>
      </article>
    </div>
  )
}
