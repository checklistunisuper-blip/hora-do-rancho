/**
 * src/services/marketsService.js
 * Serviço de mercados e ofertas do Hora do Rancho.
 */

import { APP_CONFIG } from "../config/config.js";

let payloadCapturado = {
  updatedAt: null,
  dataFormatada: "Recente",
  ofertasPorMercado: {}
};

async function carregarOfertasMaisRecentes() {
  try {
    const cacheBuster = Date.now();
    const response = await fetch(`/data/ofertas-capturadas.json?t=${cacheBuster}`);
    if (response.ok) {
      payloadCapturado = await response.json();
    }
  } catch (e) {
    console.warn("Utilizando dados estáticos como fallback.");
  }
}

await carregarOfertasMaisRecentes();

const ESTABELECIMENTOS_RS = [
  {
    id: "stok-canoas",
    nome: "Stok Center — Canoas",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Canoas",
    endereco: "Av. Getúlio Vargas, 2400 - Niterói, Canoas - RS",
    lat: -29.9320,
    lon: -51.1710,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  }
];

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatMarketPayload(market, userLat = -30.1132, userLon = -51.3235) {
  const distNum = calculateDistanceKm(userLat, userLon, market.lat, market.lon);
  const distKm = Number(distNum.toFixed(1));
  const distMeters = Math.round(distNum * 1000);
  const distText = distKm < 1 ? `${distMeters} m` : `${distKm} km`;

  const ofertasDinamicas = payloadCapturado.ofertasPorMercado?.[market.id];
  const ofertasList = ofertasDinamicas || market.ofertas || [];

  return {
    ...market,
    distanciaKm: distKm,
    distanciaFormatada: distText,
    dataAtualizacao: payloadCapturado.dataFormatada || "Recente",
    ofertas: ofertasList,
    offers: ofertasList,
    ofertasCount: ofertasList.length,
    hasOffers: ofertasList.length > 0
  };
}

// Exportação nomeada exigida por home.js
export const marketsService = {
  async refresh() {
    await carregarOfertasMaisRecentes();
  },
  async getById(id, userLat, userLon) {
    await carregarOfertasMaisRecentes();
    const market = ESTABELECIMENTOS_RS.find((m) => m.id === id) || ESTABELECIMENTOS_RS[0];
    return formatMarketPayload(market, userLat, userLon);
  },
  async findNearby(lat, lon) {
    await carregarOfertasMaisRecentes();
    const formattedList = ESTABELECIMENTOS_RS.map((m) => formatMarketPayload(m, lat, lon));
    return formattedList.sort((a, b) => a.distanciaKm - b.distanciaKm);
  },
  async getAll(lat, lon) {
    await carregarOfertasMaisRecentes();
    return ESTABELECIMENTOS_RS.map((m) => formatMarketPayload(m, lat, lon));
  }
};

// Exportação padrão para compatibilidade
export default marketsService;
