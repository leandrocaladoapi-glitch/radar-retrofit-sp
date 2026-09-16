export default function MetodologiaPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Metodologia e Transparência</h1>

      <div className="prose prose-slate max-w-none">
        <p>O <strong>Radar Retrofit São Paulo</strong> é uma ferramenta independente de inteligência de mercado desenvolvida pela LCF Consulting. Nossa missão é consolidar e estruturar dados públicos dispersos para facilitar a análise de oportunidades de requalificação imobiliária.</p>

        <h3>1. Fontes de Dados</h3>
        <p>Utilizamos exclusivamente fontes oficiais e públicas:</p>
        <ul>
          <li>Diário Oficial da Cidade de São Paulo.</li>
          <li>Portal da Subvenção Econômica (Prefeitura de São Paulo / SMUL).</li>
          <li>Portal GeoSampa (dados geoespaciais, zoneamento, IPTU).</li>
          <li>Legislação municipal vigente.</li>
        </ul>

        <h3>2. Opportunity Score (Índice de Oportunidade)</h3>
        <p>O <em>Retrofit Opportunity Score</em> é um indicador criado pelo Radar variando de 0 a 100. Ele avalia o alinhamento de um imóvel com as regras conhecidas do programa de subvenção.</p>
        <p>Os critérios incluem:</p>
        <ul>
          <li><strong>Localização (25 pts):</strong> Inserção em áreas prioritárias do edital.</li>
          <li><strong>Compatibilidade de Perímetros (20 pts):</strong> Presença na AIU Setor Central ou Requalifica Centro.</li>
          <li><strong>Potencial de Uso (15 pts):</strong> Viabilidade para HIS/HMP.</li>
          <li><strong>Características Físicas (15 pts):</strong> Idade, área, e indícios de subutilização.</li>
          <li><strong>Incentivos (15 pts):</strong> Outorga onerosa e isenções tributárias aplicáveis.</li>
          <li><strong>Qualidade dos Dados (10 pts):</strong> Nível de certeza e completude da informação pública.</li>
        </ul>
        <p><strong>Importante:</strong> Este score NÃO é a pontuação oficial da Prefeitura e não garante aprovação no programa.</p>

        <h3>3. Atualização</h3>
        <p>A plataforma roda processos automatizados (ETL) para varrer diários oficiais e portais de dados em busca de novidades, retificações de editais e novos termos de outorga, mantendo um histórico auditável.</p>

        <h3>4. Limitações</h3>
        <p>O Radar não substitui a análise técnica, jurídica e arquitetônica de profissionais habilitados. Dados podem apresentar defasagem em relação ao processo interno da Prefeitura. Não inventamos ou inferimos dados faltantes; lacunas são tratadas como &quot;Não confirmado&quot;.</p>
      </div>
    </div>
  )
}
