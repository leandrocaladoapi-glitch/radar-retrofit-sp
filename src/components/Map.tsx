'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import projetosData from '../data/projetos.json';
import oportunidadesData from '../data/oportunidades.json';

// Dynamically import map components to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

export default function RetrofitMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[600px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Carregando mapa...</div>;
  }

  const center: [number, number] = [-23.542, -46.638]; // Center of SP

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render Projetos */}
        {projetosData.map((proj) => (
          <CircleMarker
            key={proj.id}
            center={[proj.lat, proj.lng]}
            radius={7}
            pathOptions={{ color: '#1d4ed8', fillColor: '#3b82f6', fillOpacity: 0.9, weight: 2 }}
          >
            <Popup>
              <div className="text-sm">
                <strong className="block mb-1">{proj.empresa}</strong>
                <p className="text-slate-600 mb-1">{proj.chamamento}</p>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">{proj.situacao}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Render Oportunidades */}
        {oportunidadesData.map((op) => (
          <CircleMarker
            key={op.id}
            center={[op.lat, op.lng]}
            radius={5}
            pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.6, weight: 1 }}
          >
            <Popup>
               <div className="text-sm space-y-2">
                <div>
                  <strong className="block mb-1">Oportunidade Indicativa</strong>
                  <p className="text-slate-600 mb-1">{op.endereco}</p>
                  <div className="font-semibold text-amber-600">Score: {op.score}/100</div>
                </div>
                <a href={`/oportunidades/${op.id}`} className="inline-block text-blue-600 font-semibold hover:underline text-xs">
                  Ver detalhes &rarr;
                </a>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow-md border border-slate-200 z-[400]">
        <h4 className="text-xs font-bold text-slate-700 mb-2">Legenda</h4>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-slate-600">Projetos Oficiais ({projetosData.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <span className="text-xs text-slate-600">Oportunidades ({oportunidadesData.length})</span>
        </div>
      </div>
    </div>
  );
}
