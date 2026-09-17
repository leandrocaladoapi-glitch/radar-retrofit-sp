/** @type {import('next').NextConfig} */

// URLs sintéticas antigas (/oportunidades/op-N) não correspondem a imóveis reais.
// Não há substituto equivalente registro a registro, portanto redirecionam 301
// para o índice de oportunidades reais, evitando páginas sintéticas indexadas.
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/oportunidades/op-:id(\\d+)',
        destination: '/oportunidades',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
