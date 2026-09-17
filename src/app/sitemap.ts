import { MetadataRoute } from 'next'
import oportunidades from '../data/oportunidades_index.json'
import artigos from '../data/artigos.json'

export default function sitemap(): MetadataRoute.Sitemap {
  // Configured with a placeholder domain that can be overridden by environment variable
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radar-retrofit.lcfconsulting.com.br'

  const staticRoutes = [
    '',
    '/mapa',
    '/projetos',
    '/oportunidades',
    '/chamamento-atual',
    '/simulador',
    '/pipeline',
    '/mercado',
    '/atualizacoes',
    '/relatorio',
    '/metodologia',
    '/fontes',
    '/artigos'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const oportunidadesRoutes = oportunidades.map((op) => ({
    url: `${baseUrl}/oportunidades/${op.slug}`,
    lastModified: new Date(op.ultimaVerificacao),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const artigosRoutes = artigos.map((art) => ({
    url: `${baseUrl}/artigos/${art.slug}`,
    lastModified: new Date(art.dataAtualizacao),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...oportunidadesRoutes, ...artigosRoutes]
}
