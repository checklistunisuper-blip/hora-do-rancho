/**
 * src/services/marketsService.js
 * Unifica buscas do Google Maps, ofertas da SEFAZ e robô Gemini
 */

import { googleMapsService } from "./googleMapsService.js";
import { sefazService } from "./sefazService.js";

let payloadCapturado = { ofertasPorMercado: {} };

async function carregarOfertasCapturadas() {
  try {
    const response = await fetch(`/data/ofertas-capturadas.json?t=${Date.now()}`);
    if (response.ok) {
      payloadCapturado = await response.json();
    }
  } catch (e) {
    console.warn("Carregando ofertas locais...");
  }
}

export const marketsService = {
  async refresh() {
    await carregarOfertasCapturadas();
  },

  /**
   * Busca mercados próximos combinando Google Maps e base local
   */
  async findNearby(lat = -30.1132, lon = -51.3235, maxRadiusKm = 15, googleApiKey = "") {
    await carregarOfertasCapturadas();

    // 1. Busca estabelecimentos do Google Maps
    const mercadosGoogle = await googleMapsService.fetchNearbyMarkets(lat, lon, maxRadiusKm * 1000, googleApiKey);

    // 2. Mescla com os dados capturados do robô de ofertas
    const mercadosCompletos = mercadosGoogle.map((gMarket) => {
      const ofertasScraper = payloadCapturado.ofertasPorMercado?.[gMarket.id] || [];
      return {
        ...gMarket,
        ofertas: ofertasScraper,
        ofertasCount: ofertasScraper.length,
        hasOffers: ofertasScraper.length > 0
      };
    });

    return mercadosCompletos;
  },

  /**
   * Busca ofertas diretamente da SEFAZ por localização
   */
  async getOfertasSefaz(lat = -30.1132, lon = -51.3235, raioKm = 10, termo = "") {
    return await sefazService.buscarOfertasSefaz(lat, lon, raioKm, termo);
  }
};

export default marketsService;
