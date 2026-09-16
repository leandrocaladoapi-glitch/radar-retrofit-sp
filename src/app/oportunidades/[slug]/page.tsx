import oportunidadesData from '../../../data/oportunidades.json'
import { notFound } from 'next/navigation'
import { FileDown, ChevronLeft, MapPin, Building, AlertTriangle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function generateStaticParams() {
  return oportunidadesData.map((op) => ({
    slug: op.id,
  }))
}

export default function OportunidadeDossier({ params }: { params: { slug: string } }) {
  const oportunidade = oportunidadesData.find(op => op.id === params.slug)

  if (!oportunidade) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/oportunidades" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
        <ChevronLeft size={16} /> Voltar para o Radar
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{oportunidade.endereco}</h1>
          <p className="text-lg text-slate-600">{oportunidade.regiao}</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition">
          <FileDown size={18} /> Gerar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2">Por que entrou no Radar?</h2>
            <p className="text-slate-700 leading-relaxed">{oportunidade.motivo}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2">Dados do Imóvel</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <span className="block text-sm text-slate-500 font-medium">Uso Conhecido</span>
                <span className="text-slate-900">{oportunidade.usoConhecido}</span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 font-medium">Área Estimada</span>
                <span className="text-slate-900">{oportunidade.area} m²</span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 font-medium">Idade Aproximada</span>
                <span className="text-slate-900">{oportunidade.idade} anos</span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 font-medium">Zoneamento</span>
                <span className="text-slate-900">{oportunidade.zoneamento}</span>
              </div>
            </div>
          </div>

           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-800 border-b pb-2 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20}/> Riscos Identificados
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {oportunidade.riscos.map((risco, idx) => (
                <li key={idx}>{risco}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
             <div className="text-center">
               <div className="text-sm font-semibold text-blue-900 uppercase tracking-wide">Opportunity Score</div>
               <div className="text-6xl font-bold text-blue-600 my-2">{oportunidade.score}</div>
               <div className="text-xs text-blue-700 mt-2">
                 Confiança dos dados: <span className="font-semibold">{oportunidade.confidence}%</span>
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><MapPin size={18}/> Perímetros</h3>
             <ul className="space-y-2 text-sm text-slate-600">
               <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500"/> AIU Setor Central</li>
               <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500"/> Requalifica Centro</li>
             </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2"><Building size={18}/> Patrimônio</h3>
             <p className="text-sm text-slate-600">{oportunidade.protecao}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
