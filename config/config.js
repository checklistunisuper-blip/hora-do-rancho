/**
 * src/config/config.js
 * Configurações centrais do HORA DO RANCHO.
 */

export const APP_CONFIG = {
  appName: "HORA DO RANCHO",
  company: "WP DIGITAL VAREJO",
  slogan: "Compare preços. Economize mais.",
  version: "1.0.0",

  // Raio de busca de mercados (em km)
  searchRadiusKm: 10,

  // Overpass API (OpenStreetMap)
  overpass: {
    endpoints: [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter"
    ],
  },

  // Nominatim (OpenStreetMap)
  nominatim: {
    endpoint: "https://nominatim.openstreetmap.org/reverse",
  },

  // Tiles do mapa (Google Maps via raster tiles)
  mapTiles: {
    url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20
  },

  // Categorias fixas do app
  categories: [
    { id: "padaria", label: "Padaria", icon: "🥖" },
    { id: "rotisseria", label: "Rotisseria", icon: "🍗" },
    { id: "hortifruti", label: "Hortifruti", icon: "🥬" },
    { id: "laticinios", label: "Laticínios", icon: "🧀" },
    { id: "mercearia-liquida", label: "Mercearia líquida", icon: "🥤" },
    { id: "mercearia", label: "Mercearia", icon: "🌾" },
    { id: "matinais", label: "Matinais", icon: "☕" },
    { id: "limpeza", label: "Limpeza", icon: "🧼" },
    { id: "perfumaria", label: "Perfumaria", icon: "🧴" },
    { id: "bazar", label: "Bazar", icon: "🛍️" },
    { id: "sazonais", label: "Sazonais", icon: "🎉" },
    { id: "eletronicos", label: "Eletrônicos", icon: "📺" },
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
