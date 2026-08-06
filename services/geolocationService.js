/**
 * geolocationService.js
 * Usa apenas a Geolocation API nativa do navegador + Nominatim (OpenStreetMap,
 * gratuito) para geocodificação reversa (estado / município / bairro).
 */

import { APP_CONFIG } from "../config/config.js";

export const geolocationService = {
  /**
   * Pede permissão e retorna { latitude, longitude }.
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocalização não suportada neste navegador."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  },

  /**
   * Converte lat/lng em estado, município e bairro usando Nominatim.
   */
  async reverseGeocode(latitude, longitude) {
    const url = new URL(APP_CONFIG.nominatim.endpoint);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", latitude);
    url.searchParams.set("lon", longitude);
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url.toString(), {
      headers: { "Accept-Language": "pt-BR" },
    });

    if (!response.ok) {
      throw new Error("Não foi possível identificar sua localização.");
    }

    const data = await response.json();
    const addr = data.address || {};

    return {
      estado: addr.state || "",
      municipio: addr.city || addr.town || addr.municipality || "",
      bairro: addr.suburb || addr.neighbourhood || addr.city_district || "",
      enderecoCompleto: data.display_name || "",
    };
  },

  /**
   * Distância em km entre dois pontos (fórmula de Haversine).
   */
  distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
