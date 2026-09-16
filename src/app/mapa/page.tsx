import MapComponent from '../../components/Map'

export default function MapaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Mapa de Oportunidades e Projetos</h1>
        <p className="text-slate-600">Explore geograficamente os projetos em andamento e as oportunidades identificadas na região central.</p>
      </div>

      <MapComponent />

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700">
        <p><strong>Nota:</strong> As localizações são aproximadas com base nos endereços públicos divulgados. A análise de oportunidade considera o zoneamento, restrições e perímetros oficiais (Requalifica Centro, AIU Setor Central).</p>
      </div>
    </div>
  )
}
