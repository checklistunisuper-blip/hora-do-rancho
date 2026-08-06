/**
 * marketsService.js
 * Busca supermercados/atacados reais próximos usando a Overpass API
 * (dados abertos do OpenStreetMap) — sem chave de API, 100% gratuito.
 */

import { APP_CONFIG } from "../config/config.js";
import { geolocationService } from "./geolocationService.js";
import { storageService } from "./storageService.js";

function buildOverpassQuery(lat, lon, radiusMeters) {
  return `
    [out:json][timeout:25];
    (
      node["shop"~"supermarket|convenience|wholesale"](around:${radiusMeters},${lat},${lon});
      way["shop"~"supermarket|convenience|wholesale"](around:${radiusMeters},${lat},${lon});
    );
    out center tags;
  `;
}

function toMarket(element, userLat, userLon) {
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  const tags = element.tags || {};

  if (lat == null || lon == null) return null;

  return {
    id: `osm-${element.type}-${element.id}`,
    nome: tags.name || "Mercado sem nome cadastrado",
    endereco: [tags["addr:street"], tags["addr:housenumber"], tags["addr:suburb"]]
      .filter(Boolean)
      .join(", "),
    latitude: lat,
    longitude: lon,
    distanciaKm: geolocationService.distanceKm(userLat, userLon, lat, lon),
    tipo: tags.shop === "wholesale" ? "Atacado" : "Supermercado",
    ultimaAtualizacaoOfertas: null, // preenchido pela camada de ofertas
    status: "ativo",
  };
}

export const marketsService = {
  /**
   * Busca mercados num raio (padrão: APP_CONFIG.searchRadiusKm) a partir da posição do usuário.
   * Faz cache local (IndexedDB) para uso offline.
   */
  async findNearby(latitude, longitude, radiusKm = APP_CONFIG.searchRadiusKm) {
    const query = buildOverpassQuery(latitude, longitude, radiusKm * 1000);

    try {
      const response = await fetch(APP_CONFIG.overpass.endpoint, {
        method: "POST",
        body: `data=${encodeURIComponent(query)}`,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      if (!response.ok) throw new Error("Falha ao consultar mercados próximos.");

      const data = await response.json();
      const markets = (data.elements || [])
        .map((el) => toMarket(el, latitude, longitude))
        .filter(Boolean)
        .sort((a, b) => a.distanciaKm - b.distanciaKm);

      if (markets.length) {
        await storageService.putMany(APP_CONFIG.db.stores.markets, markets);
      }

      return markets;
    } catch (error) {
      console.warn("Overpass indisponível, usando cache local:", error.message);
      return storageService.getAll(APP_CONFIG.db.stores.markets);
    }
  },

  async getById(id) {
    return storageService.get(APP_CONFIG.db.stores.markets, id);
  },
};
