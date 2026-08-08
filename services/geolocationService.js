/**
 * src/services/geolocationService.js
 * Geolocalização nativa + Nominatim (OpenStreetMap) com fallbacks e tratamento de erros.
 */

import { APP_CONFIG } from "../config/config.js";

export const geolocationService = {
  /**
   * Pede permissão do GPS e retorna { latitude, longitude, accuracy }.
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocalização não é suportada pelo seu navegador."));
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
        (error) => {
          let mensagem = "Erro ao obter localização.";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagem = "Permissão de localização negada pelo usuário.";
              break;
            case error.POSITION_UNAVAILABLE:
              mensagem = "Informações de localização indisponíveis.";
              break;
            case error.TIMEOUT:
              mensagem = "Tempo limite esgotado ao buscar localização.";
              break;
          }
          reject(new Error(mensagem));
        },
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
    try {
      if (latitude == null || longitude == null) {
        return this.getFallbackLocation();
      }

      const endpoint = APP_CONFIG?.nominatim?.endpoint || "https://nominatim.openstreetmap.org/reverse";
      const url = new URL(endpoint);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", String(latitude));
      url.searchParams.set("lon", String(longitude));
      url.searchParams.set("zoom", "18");
      url.searchParams.set("addressdetails", "1");
      
      // Se tiver email de contato configurado no APP_CONFIG, adiciona conforme recomendação do Nominatim
      if (APP_CONFIG?.nominatim?.email) {
        url.searchParams.set("email", APP_CONFIG.nominatim.email);
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Accept-Language": "pt-BR",
        },
      }).catch(() => null);

      if (!response || !response.ok) {
        return this.getFallbackLocation();
      }

      const data = await response.json();
      const addr = data.address || {};

      return {
        estado: addr.state || "",
        municipality: addr.city || addr.town || addr.municipality || addr.village || "Sua Região",
        municipio: addr.city || addr.town || addr.municipality || addr.village || "Sua Região",
        bairro: addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter || "",
        enderecoCompleto: data.display_name || "Endereço identificado",
      };
    } catch (error) {
      console.warn("Falha no geocodificador Nominatim:", error);
      return this.getFallbackLocation();
    }
  },

  /**
   * Retorna localização genérica padrão caso ocorra falha de rede ou bloqueio.
   */
  getFallbackLocation() {
    return {
      estado: "",
      municipio: "Sua Cidade",
      bairro: "Região Central",
      enderecoCompleto: "Localização Padrão",
    };
  },

  /**
   * Distância em km entre dois pontos (Fórmula de Haversine).
   */
  distanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
      return 0;
    }

    const p1Lat = Number(lat1);
    const p1Lon = Number(lon1);
    const p2Lat = Number(lat2);
    const p2Lon = Number(lon2);

    if (isNaN(p1Lat) || isNaN(p1Lon) || isNaN(p2Lat) || isNaN(p2Lon)) {
      return 0;
    }

    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371; // Raio médio da Terra em km
    const dLat = toRad(p2Lat - p1Lat);
    const dLon = toRad(p2Lon - p1Lon);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(p1Lat)) * Math.cos(toRad(p2Lat)) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};

export default geolocationService;
