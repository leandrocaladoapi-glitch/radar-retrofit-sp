export interface ImovelData {
  idade: number;
  area: number;
  zoneamento: string;
  perimetros: string[];
  usoConhecido: string;
  tombamento: boolean;
  dadosCompletos: boolean;
}

export function calculateOpportunityScore(imovel: ImovelData): { score: number, confidence: number, details: Record<string, number> } {
  let score = 0;
  const confidence = imovel.dadosCompletos ? 100 : 70;
  const details: Record<string, number> = {};

  // 1. Localização & Perímetros (Max 45 pts)
  // Requalifica Centro and AIU Setor Central are highly valuable
  if (imovel.perimetros.includes("AIU Setor Central")) {
    score += 25;
    details.perimetro = 25;
  } else if (imovel.perimetros.includes("Requalifica Centro")) {
    score += 20;
    details.perimetro = 20;
  } else {
    details.perimetro = 0;
  }

  // 2. Características Físicas (Max 15 pts)
  // Older buildings generally need more retrofit, but too old might mean strict heritage rules
  if (imovel.idade > 40) {
    score += 15;
    details.fisica = 15;
  } else if (imovel.idade > 20) {
    score += 10;
    details.fisica = 10;
  } else {
    details.fisica = 0;
  }

  // 3. Potencial de Uso (Max 15 pts)
  // Conversion from commercial to residential is heavily incentivized
  if (imovel.usoConhecido.toLowerCase().includes("comercial") || imovel.usoConhecido.toLowerCase().includes("vago")) {
    score += 15;
    details.uso = 15;
  } else if (imovel.usoConhecido.toLowerCase().includes("misto")) {
    score += 10;
    details.uso = 10;
  } else {
    details.uso = 5; // Default existing residential
  }

  // 4. Qualidade / Risco (Max 25 pts)
  // Large areas are good, heritage (tombamento) adds complexity (reduces score slightly but increases confidence if known)
  if (imovel.area > 2000) {
    score += 15;
    details.escala = 15;
  } else {
    score += 5;
    details.escala = 5;
  }

  if (imovel.tombamento) {
    // Heritage means more incentives but harder process
    score += 10;
    details.risco = 10;
  } else {
    score += 10;
    details.risco = 10;
  }

  // Normalize max score to 100
  if (score > 100) score = 100;

  return {
    score,
    confidence,
    details
  };
}
