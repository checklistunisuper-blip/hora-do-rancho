/**
 * config.js
 * Configurações centrais do HORA DO RANCHO.
 * Nenhuma chave paga é usada aqui — apenas serviços públicos/gratuitos.
 */

export const APP_CONFIG = {
  appName: "HORA DO RANCHO",
  company: "WP DIGITAL VAREJO",
  slogan: "Compare preços. Economize mais.",
  version: "1.0.0",

  // Raio de busca de mercados (em km)
  searchRadiusKm: 10,

  // Overpass API (OpenStreetMap) — busca de supermercados por geolocalização, 100% gratuito
  overpass: {
    endpoint: "https://overpass-api.de/api/interpreter",
  },

  // Nominatim (OpenStreetMap) — geocodificação reversa (estado/município/bairro), gratuito
  nominatim: {
    endpoint: "https://nominatim.openstreetmap.org/reverse",
  },

  // Tiles do mapa (Leaflet + OpenStreetMap, gratuito, sem chave de API)
  mapTiles: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; colaboradores do OpenStreetMap",
  },

  // Categorias fixas do app
  categories: [
    { id: "acougue", label: "Açougue", icon: "🥩" },
    { id: "laticinios", label: "Laticínios", icon: "🧀" },
    { id: "hortifruti", label: "Hortifruti", icon: "🥬" },
    { id: "mercearia-seca", label: "Mercearia seca", icon: "🌾" },
    { id: "mercearia-liquida", label: "Mercearia líquida", icon: "🧴" },
    { id: "limpeza", label: "Limpeza", icon: "🧼" },
    { id: "perfumaria", label: "Perfumaria", icon: "🧴" },
    { id: "bazar", label: "Bazar", icon: "🛍️" },
    { id: "sazonal", label: "Sazonal", icon: "🎉" },
  ],

  // Faixas de reserva para a Lista de Rancho
  budgetReservePercents: [5, 10, 15, 20, 25, 30],

  // Nomes dos bancos locais (IndexedDB)
  db: {
    name: "hora-do-rancho-db",
    version: 1,
    stores: {
      markets: "markets",
      offers: "offers",
      favorites: "favorites",
      profile: "profile",
      ranchoLists: "ranchoLists",
    },
  },
};
