import { APP_CONFIG } from "../config/config.js";

let payloadCapturado = { ofertasPorMercado: {} };

async function carregarOfertasMaisRecentes() {
  try {
    // ?t=Date.now() evita que o navegador leia uma versão antiga do cache
    const response = await fetch(`/data/ofertas-capturadas.json?t=${Date.now()}`);
    if (response.ok) {
      payloadCapturado = await response.json();
    }
  } catch (e) {
    console.warn("Carregando ofertas locais como fallback...");
  }
}

// Executa o carregamento inicial
await carregarOfertasMaisRecentes();

function formatMarketPayload(market, userLat = -30.1132, userLon = -51.3235) {
  const distNum = calculateDistanceKm(userLat, userLon, market.lat, market.lon);
  const distKm = Number(distNum.toFixed(1));
  const distMeters = Math.round(distNum * 1000);
  const distText = distKm < 1 ? `${distMeters} m` : `${distKm} km`;

  // Busca a lista de ofertas mais recentes daquele mercado no JSON atualizado
  const ofertasDoMercado = payloadCapturado.ofertasPorMercado?.[market.id] || market.ofertas || [];

  return {
    ...market,
    nome: market.nome,
    distanciaKm: distKm,
    distanciaFormatada: distText,
    
    // Metadados da última atualização
    ultimaAtualizacao: payloadCapturado.updatedAt || new Date().toISOString(),
    dataAtualizacao: payloadCapturado.dataFormatada || "Recente",

    ofertas: ofertasDoMercado,
    offers: ofertasDoMercado,
    ofertasCount: ofertasDoMercado.length,
    hasOffers: ofertasDoMercado.length > 0
  };
}
