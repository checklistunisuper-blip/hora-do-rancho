/**
 * src/services/marketsService.js
 */
import { APP_CONFIG } from "../config/config.js";

export const marketsService = {
  async findNearby(latitude, longitude) {
    try {
      const radius = APP_CONFIG?.location?.defaultRadiusKm || 5;
      const url = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:${radius * 1000},${latitude},${longitude})[shop=supermarket];out;`;

      const response = await fetch(url).catch(() => null);
      if (!response || !response.ok) return [];

      const data = await response.json();
      return data.elements || [];
    } catch (error) {
      console.warn("Falha ao buscar mercados no Overpass:", error);
      return [];
    }
  },

  async getNearbyMarkets() {
    return [];
  }
};

// Exportação padrão para compatibilidade universal
export default marketsService;
