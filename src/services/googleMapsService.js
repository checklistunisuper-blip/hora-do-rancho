/**
 * src/services/googleMapsService.js
 * Busca estabelecimentos de supermercados dinamicamente via Google Maps / Places API
 */

export const googleMapsService = {
  /**
   * Busca supermercados e atacadistas próximos via Google Places API
   */
  async fetchNearbyMarkets(lat, lon, radiusMeters = 10000, apiKey = "") {
    if (!apiKey) {
      console.warn("Chave da API do Google Maps não fornecida. Usando fallback local.");
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radiusMeters}&type=supermarket&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results) return [];

      return data.results.map((place) => ({
        id: `gmap-${place.place_id}`,
        placeId: place.place_id,
        nome: place.name,
        endereco: place.vicinity,
        lat: place.geometry.location.lat,
        lon: place.geometry.location.lng,
        avaliacao: place.rating,
        abertoAgora: place.opening_hours?.open_now,
        origem: "google_maps"
      }));
    } catch (error) {
      console.error("Erro ao buscar mercados do Google Maps:", error);
      return [];
    }
  }
};
