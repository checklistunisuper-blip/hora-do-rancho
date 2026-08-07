/**
 * src/services/marketsService.js
 * Base completa de Supermercados, Atacados e Ofertas do Rio Grande do Sul.
 */

import { APP_CONFIG } from "../config/config.js";

/**
 * Banco de dados estático de Supermercados e Atacados do RS.
 */
const ESTABELECIMENTOS_RS = [
  // ==========================================
  // ATACADOS E ATACAREJOS (RS)
  // ==========================================
  {
    id: "stok-guaiba",
    nome: "Stok Center — Guaíba",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Guaíba",
    endereco: "BR-116, Km 282 - Guaíba - RS",
    lat: -30.1350,
    lon: -51.3320,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true",
    ofertas: [
      { id: "o1", produto: "Arroz Tipo 1 5kg", preco: "R$ 21,90" },
      { id: "o2", produto: "Feijão Preto 1kg", preco: "R$ 7,49" }
    ]
  },
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
  },
  {
    id: "stok-poa-1",
    nome: "Stok Center — Porto Alegre (Zona Norte)",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Porto Alegre",
    endereco: "Av. Manoel Elias, 1800 - Passo das Pedras, Porto Alegre - RS",
    lat: -30.0125,
    lon: -51.1210,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  },
  {
    id: "fort-canoas",
    nome: "Fort Atacadista — Canoas",
    tipo: "Atacado",
    rede: "Fort Atacadista",
    cidade: "Canoas",
    endereco: "Av. Farroupilha, 4500 - Marechal Rondon, Canoas - RS",
    lat: -29.9050,
    lon: -51.1680,
    logoUrl: "https://ui-avatars.com/api/?name=Fort+Atacadista&background=d32f2f&color=fff&bold=true"
  },
  {
    id: "desco-poa",
    nome: "Desco Super&Atacado — Porto Alegre",
    tipo: "Atacado",
    rede: "Desco",
    cidade: "Porto Alegre",
    endereco: "Av. Juca Batista, 1050 - Cavalhada, Porto Alegre - RS",
    lat: -30.1180,
    lon: -51.2250,
    logoUrl: "https://ui-avatars.com/api/?name=Desco&background=0288d1&color=fff&bold=true"
  },
  {
    id: "atacadao-poa-sertorio",
    nome: "Atacadão — Sertório",
    tipo: "Atacado",
    rede: "Atacadão",
    cidade: "Porto Alegre",
    endereco: "Av. Sertório, 8000 - Sarandi, Porto Alegre - RS",
    lat: -29.9985,
    lon: -51.1390,
    logoUrl: "https://ui-avatars.com/api/?name=Atacadao&background=f57c00&color=fff&bold=true"
  },

  // ==========================================
  // SUPERMERCADOS (RS)
  // ==========================================
  {
    id: "guaiba-1",
    nome: "Asun Supermercados — Guaíba",
    tipo: "Supermercado",
    rede: "Asun",
    cidade: "Guaíba",
    endereco: "R. São José, 420 - Centro, Guaíba - RS",
    lat: -30.1132,
    lon: -51.3235,
    logoUrl: "https://ui-avatars.com/api/?name=Asun&background=1b7a3d&color=fff&bold=true",
    ofertas: [
      { id: "o3", produto: "Leite Integral 1L", preco: "R$ 4,29" },
      { id: "o4", produto: "Café Torrado 500g", preco: "R$ 14,90" }
    ]
  },
  {
    id: "guaiba-2",
    nome: "Nacional — Guaíba",
    tipo: "Supermercado",
    rede: "Nacional",
    cidade: "Guaíba",
    endereco: "R. Dr. Lauro Azambuja, 77 - Centro, Guaíba - RS",
    lat: -30.1115,
    lon: -51.3210,
    logoUrl: "https://ui-avatars.com/api/?name=Nacional&background=d32f2f&color=fff&bold=true"
  },
  {
    id: "guaiba-4",
    nome: "Supermercado Paulinho",
    tipo: "Supermercado",
    rede: "Paulinho",
    cidade: "Guaíba",
    endereco: "Av. Nestor de Moura Jardim, 1250 - Guaíba - RS",
    lat: -30.1230,
    lon: -51.3280,
    logoUrl: "https://ui-avatars.com/api/?name=Paulinho&background=1976d2&color=fff&bold=true"
  },
  {
    id: "poa-zaffari-1",
    nome: "Zaffari Fernando Machado",
    tipo: "Supermercado",
    rede: "Zaffari",
    cidade: "Porto Alegre",
    endereco: "R. Fernando Machado, 860 - Centro Histórico, Porto Alegre - RS",
    lat: -30.0346,
    lon: -51.2290,
    logoUrl: "https://ui-avatars.com/api/?name=Zaffari&background=821019&color=fff&bold=true"
  },
  {
    id: "poa-bourbon-ipiranga",
    nome: "Bourbon Shopping Ipiranga",
    tipo: "Supermercado",
    rede: "Bourbon",
    cidade: "Porto Alegre",
    endereco: "Av. Ipiranga, 5200 - Jardim Botânico, Porto Alegre - RS",
    lat: -30.0543,
    lon: -51.1824,
    logoUrl: "https://ui-avatars.com/api/?name=Bourbon&background=821019&color=fff&bold=true"
  }
];

/**
 * Cálculo de distância real (Haversine) em km.
 */
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

/**
 * Normalizador do Payload para compatibilidade total de UI.
 */
function formatMarketPayload(market, userLat = -30.1132, userLon = -51.3235) {
  const distNum = calculateDistanceKm(userLat, userLon, market.lat, market.lon);
  const distKm = Number(distNum.toFixed(1));
  const distMeters = Math.round(distNum * 1000);
  const distText = distKm < 1 ? `${distMeters} m` : `${distKm} km`;
  const ofertasList = market.ofertas || [];

  return {
    ...market,
    nome: market.nome,
    rede: market.rede,
    endereco: market.endereco,
    cidade: market.cidade,
    distanciaKm: distKm,
    distanciaFormatada: distText,

    // Compatibilidade com variáveis em Inglês e Google Places
    name: market.nome,
    title: market.nome,
    brand: market.rede,
    address: market.endereco,
    vicinity: market.endereco,
    city: market.cidade,
    distance: distKm,
    distanceKm: distKm,
    distanceMeters: distMeters,
    distanceFormatted: distText,
    distanceText: distText,
    ofertas: ofertasList,
    offers: ofertasList,
    ofertasCount: ofertasList.length,
    hasOffers: ofertasList.length > 0,

    geometry: {
      location: {
        lat: market.lat,
        lng: market.lon,
        lon: market.lon
      }
    }
  };
}

export const marketsService = {
  /**
   * Busca um mercado específico pelo ID (Corrige o erro do ofertas.js)
   */
  async getById(id, userLat = -30.1132, userLon = -51.3235) {
    const market = ESTABELECIMENTOS_RS.find((m) => m.id === id || String(m.id) === String(id));
    if (!market) {
      // Se o ID não for encontrado, retorna o primeiro como fallback
      return formatMarketPayload(ESTABELECIMENTOS_RS[0], userLat, userLon);
    }
    return formatMarketPayload(market, userLat, userLon);
  },

  /**
   * Busca ofertas associadas a um ID de mercado
   */
  async getOffersByMarketId(id) {
    const market = await this.getById(id);
    return market ? market.ofertas || [] : [];
  },

  /**
   * Retorna os estabelecimentos mais próximos ordenados por distância.
   */
  async findNearby(lat, lon, maxRadiusKm = APP_CONFIG?.searchRadiusKm || 30) {
    const userLat = lat || -30.1132;
    const userLon = lon || -51.3235;

    const formattedList = ESTABELECIMENTOS_RS.map((m) =>
      formatMarketPayload(m, userLat, userLon)
    );

    formattedList.sort((a, b) => a.distanciaKm - b.distanciaKm);

    const filtered = formattedList.filter((m) => m.distanciaKm <= maxRadiusKm);

    return filtered.length > 0 ? filtered : formattedList.slice(0, 10);
  },

  /**
   * Retorna todos os mercados
   */
  async getAll(lat = -30.1132, lon = -51.3235) {
    return ESTABELECIMENTOS_RS.map((m) => formatMarketPayload(m, lat, lon));
  }
};
