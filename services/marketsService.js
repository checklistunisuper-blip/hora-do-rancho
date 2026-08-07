/**
 * src/services/marketsService.js
 * Base completa de Supermercados, Atacados e Atacarejos do Rio Grande do Sul.
 * Calcula distâncias reais em relação à localização do usuário.
 */

import { APP_CONFIG } from "../config/config.js";

/**
 * Banco de dados estático de Supermercados e Atacados do Rio Grande do Sul.
 */
const ESTABELECIMENTOS_RS = [
  // ==========================================
  // ATACADOS E ATACAREJOS (RS)
  // ==========================================

  // --- STOK CENTER / COMERCIAL ZAFFARI ---
  {
    id: "stok-guaiba",
    nome: "Stok Center — Guaíba",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Guaíba",
    endereco: "BR-116, Km 282 - Guaíba - RS",
    lat: -30.1350,
    lon: -51.3320,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
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
    id: "stok-caxias",
    nome: "Stok Center — Caxias do Sul",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Caxias do Sul",
    endereco: "Rua Os Dezoito do Forte, 2000 - Caxias do Sul - RS",
    lat: -29.1650,
    lon: -51.1850,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  },
  {
    id: "stok-passofundo",
    nome: "Stok Center — Passo Fundo",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Passo Fundo",
    endereco: "Av. Brasil Leste, 3000 - Petrópolis, Passo Fundo - RS",
    lat: -28.2580,
    lon: -52.3850,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  },
  {
    id: "stok-pelotas",
    nome: "Stok Center — Pelotas",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Pelotas",
    endereco: "Av. Fernando Osório, 2000 - Três Vendas, Pelotas - RS",
    lat: -31.7350,
    lon: -52.3480,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  },
  {
    id: "stok-santamaria",
    nome: "Stok Center — Santa Maria",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Santa Maria",
    endereco: "Av. Hélvio Basso, 1280 - Santa Maria - RS",
    lat: -29.7080,
    lon: -53.8150,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  },
  {
    id: "stok-gravatai",
    nome: "Stok Center — Gravataí",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Gravataí",
    endereco: "Av. Dorival Cândido Luz de Oliveira, 6000 - Gravataí - RS",
    lat: -29.9320,
    lon: -51.0350,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true"
  },

  // --- FORT ATACADISTA ---
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
    id: "fort-viamao",
    nome: "Fort Atacadista — Viamão",
    tipo: "Atacado",
    rede: "Fort Atacadista",
    cidade: "Viamão",
    endereco: "Rodovia RS-040, Km 11 - Viamão - RS",
    lat: -30.0750,
    lon: -51.0850,
    logoUrl: "https://ui-avatars.com/api/?name=Fort+Atacadista&background=d32f2f&color=fff&bold=true"
  },
  {
    id: "fort-caxias",
    nome: "Fort Atacadista — Caxias do Sul",
    tipo: "Atacado",
    rede: "Fort Atacadista",
    cidade: "Caxias do Sul",
    endereco: "BR-116, 16550 - De Lazzer, Caxias do Sul - RS",
    lat: -29.1520,
    lon: -51.1550,
    logoUrl: "https://ui-avatars.com/api/?name=Fort+Atacadista&background=d32f2f&color=fff&bold=true"
  },

  // --- DESCO SUPER&ATACADO ---
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
    id: "desco-lajeado",
    nome: "Desco Super&Atacado — Lajeado",
    tipo: "Atacado",
    rede: "Desco",
    cidade: "Lajeado",
    endereco: "BR-386, Km 346 - Lajeado - RS",
    lat: -29.4580,
    lon: -51.9750,
    logoUrl: "https://ui-avatars.com/api/?name=Desco&background=0288d1&color=fff&bold=true"
  },
  {
    id: "desco-canoas",
    nome: "Desco Super&Atacado — Canoas",
    tipo: "Atacado",
    rede: "Desco",
    cidade: "Canoas",
    endereco: "Av. Boqueirão, 2200 - Igara, Canoas - RS",
    lat: -29.9010,
    lon: -51.1580,
    logoUrl: "https://ui-avatars.com/api/?name=Desco&background=0288d1&color=fff&bold=true"
  },

  // --- ATACADÃO ---
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
  {
    id: "atacadao-poa-zona-sul",
    nome: "Atacadão — Zona Sul",
    tipo: "Atacado",
    rede: "Atacadão",
    cidade: "Porto Alegre",
    endereco: "Av. Eduardo Prado, 1954 - Cavalhada, Porto Alegre - RS",
    lat: -30.1220,
    lon: -51.2280,
    logoUrl: "https://ui-avatars.com/api/?name=Atacadao&background=f57c00&color=fff&bold=true"
  },
  {
    id: "atacadao-canoas",
    nome: "Atacadão — Canoas",
    tipo: "Atacado",
    rede: "Atacadão",
    cidade: "Canoas",
    endereco: "Av. Getúlio Vargas, 3100 - Niterói, Canoas - RS",
    lat: -29.9280,
    lon: -51.1730,
    logoUrl: "https://ui-avatars.com/api/?name=Atacadao&background=f57c00&color=fff&bold=true"
  },
  {
    id: "atacadao-gravatai",
    nome: "Atacadão — Gravataí",
    tipo: "Atacado",
    rede: "Atacadão",
    cidade: "Gravataí",
    endereco: "Rodovia RS-040, Km 02 - Gravataí - RS",
    lat: -29.9550,
    lon: -51.0120,
    logoUrl: "https://ui-avatars.com/api/?name=Atacadao&background=f57c00&color=fff&bold=true"
  },
  {
    id: "atacadao-pelotas",
    nome: "Atacadão — Pelotas",
    tipo: "Atacado",
    rede: "Atacadão",
    cidade: "Pelotas",
    endereco: "Av. Ildefonso Simões Lopes, 1000 - Pelotas - RS",
    lat: -31.7420,
    lon: -52.3250,
    logoUrl: "https://ui-avatars.com/api/?name=Atacadao&background=f57c00&color=fff&bold=true"
  },

  // --- MACROMIX ATACADISTA ---
  {
    id: "macromix-esteio",
    nome: "Macromix Atacadista — Esteio",
    tipo: "Atacado",
    rede: "Macromix",
    cidade: "Esteio",
    endereco: "BR-116, Km 257 - Esteio - RS",
    lat: -29.8520,
    lon: -51.1810,
    logoUrl: "https://ui-avatars.com/api/?name=Macromix&background=388e3c&color=fff&bold=true"
  },
  {
    id: "macromix-nh",
    nome: "Macromix Atacadista — Novo Hamburgo",
    tipo: "Atacado",
    rede: "Macromix",
    cidade: "Novo Hamburgo",
    endereco: "Av. Nações Unidas, 3340 - Novo Hamburgo - RS",
    lat: -29.6810,
    lon: -51.1350,
    logoUrl: "https://ui-avatars.com/api/?name=Macromix&background=388e3c&color=fff&bold=true"
  },
  {
    id: "macromix-sapucaia",
    nome: "Macromix Atacadista — Sapucaia do Sul",
    tipo: "Atacado",
    rede: "Macromix",
    cidade: "Sapucaia do Sul",
    endereco: "RS-118, 2700 - Sapucaia do Sul - RS",
    lat: -29.8350,
    lon: -51.1420,
    logoUrl: "https://ui-avatars.com/api/?name=Macromix&background=388e3c&color=fff&bold=true"
  },

  // --- SAM'S CLUB ---
  {
    id: "sams-poa",
    nome: "Sam's Club — Porto Alegre",
    tipo: "Atacado",
    rede: "Sam's Club",
    cidade: "Porto Alegre",
    endereco: "Av. Sertório, 6600 - Sarandi, Porto Alegre - RS",
    lat: -30.0020,
    lon: -51.1480,
    logoUrl: "https://ui-avatars.com/api/?name=Sams+Club&background=003366&color=fff&bold=true"
  },
  {
    id: "sams-caxias",
    nome: "Sam's Club — Caxias do Sul",
    tipo: "Atacado",
    rede: "Sam's Club",
    cidade: "Caxias do Sul",
    endereco: "Rodovia RST-453, Km 140 - Caxias do Sul - RS",
    lat: -29.1580,
    lon: -51.1380,
    logoUrl: "https://ui-avatars.com/api/?name=Sams+Club&background=003366&color=fff&bold=true"
  },

  // --- VIA ATACADISTA ---
  {
    id: "via-bento",
    nome: "Via Atacadista — Bento Gonçalves",
    tipo: "Atacado",
    rede: "Via Atacadista",
    cidade: "Bento Gonçalves",
    endereco: "Rua Herny Hugo Dreher, 500 - Bento Gonçalves - RS",
    lat: -29.1680,
    lon: -51.5180,
    logoUrl: "https://ui-avatars.com/api/?name=Via+Atacadista&background=c2185b&color=fff&bold=true"
  },
  {
    id: "via-farroupilha",
    nome: "Via Atacadista — Farroupilha",
    tipo: "Atacado",
    rede: "Via Atacadista",
    cidade: "Farroupilha",
    endereco: "Rodovia RS-122, Km 60 - Farroupilha - RS",
    lat: -29.2250,
    lon: -51.3480,
    logoUrl: "https://ui-avatars.com/api/?name=Via+Atacadista&background=c2185b&color=fff&bold=true"
  },

  // ==========================================
  // SUPERMERCADOS (RS)
  // ==========================================

  // --- GUAÍBA ---
  {
    id: "guaiba-1",
    nome: "Asun Supermercados — Guaíba",
    tipo: "Supermercado",
    rede: "Asun",
    cidade: "Guaíba",
    endereco: "R. São José, 420 - Centro, Guaíba - RS",
    lat: -30.1132,
    lon: -51.3235,
    logoUrl: "https://ui-avatars.com/api/?name=Asun&background=1b7a3d&color=fff&bold=true"
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

  // --- PORTO ALEGRE ---
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
  },
  {
    id: "poa-rissul-cristovao",
    nome: "Rissul — Cristóvão Colombo",
    tipo: "Supermercado",
    rede: "Rissul",
    cidade: "Porto Alegre",
    endereco: "Av. Cristóvão Colombo, 1980 - Floresta, Porto Alegre - RS",
    lat: -30.0210,
    lon: -51.2055,
    logoUrl: "https://ui-avatars.com/api/?name=Rissul&background=d81b60&color=fff&bold=true"
  },
  {
    id: "poa-asun-bento",
    nome: "Asun — Bento Gonçalves",
    tipo: "Supermercado",
    rede: "Asun",
    cidade: "Porto Alegre",
    endereco: "Av. Bento Gonçalves, 2400 - Partenon, Porto Alegre - RS",
    lat: -30.0620,
    lon: -51.1890,
    logoUrl: "https://ui-avatars.com/api/?name=Asun&background=1b7a3d&color=fff&bold=true"
  },

  // --- CANOAS ---
  {
    id: "canoas-bourbon",
    nome: "Bourbon Supermercados — Canoas",
    tipo: "Supermercado",
    rede: "Bourbon",
    cidade: "Canoas",
    endereco: "Av. Getúlio Vargas, 5765 - Centro, Canoas - RS",
    lat: -29.9180,
    lon: -51.1790,
    logoUrl: "https://ui-avatars.com/api/?name=Bourbon&background=821019&color=fff&bold=true"
  },

  // --- CAXIAS DO SUL ---
  {
    id: "caxias-andreazza",
    nome: "Super Andreazza — Centro",
    tipo: "Supermercado",
    rede: "Andreazza",
    cidade: "Caxias do Sul",
    endereco: "R. Sinimbu, 1200 - Centro, Caxias do Sul - RS",
    lat: -29.1680,
    lon: -51.1790,
    logoUrl: "https://ui-avatars.com/api/?name=Andreazza&background=2e7d32&color=fff&bold=true"
  },
  {
    id: "caxias-zaffari",
    nome: "Zaffari Center Caxias",
    tipo: "Supermercado",
    rede: "Zaffari",
    cidade: "Caxias do Sul",
    endereco: "R. Sinimbu, 2200 - Exposição, Caxias do Sul - RS",
    lat: -29.1695,
    lon: -51.1715,
    logoUrl: "https://ui-avatars.com/api/?name=Zaffari&background=821019&color=fff&bold=true"
  },

  // --- PELOTAS ---
  {
    id: "pelotas-guanabara",
    nome: "Guanabara Supermercados — Pelotas",
    tipo: "Supermercado",
    rede: "Guanabara",
    cidade: "Pelotas",
    endereco: "R. Dom Pedro II, 700 - Centro, Pelotas - RS",
    lat: -31.7650,
    lon: -52.3370,
    logoUrl: "https://ui-avatars.com/api/?name=Guanabara&background=0288d1&color=fff&bold=true"
  },

  // --- SANTA MARIA ---
  {
    id: "santamaria-redevivo",
    nome: "Rede Vivo — Santa Maria",
    tipo: "Supermercado",
    rede: "Rede Vivo",
    cidade: "Santa Maria",
    endereco: "Av. Dores, 305 - Nossa Sra. das Dores, Santa Maria - RS",
    lat: -29.6910,
    lon: -53.8010,
    logoUrl: "https://ui-avatars.com/api/?name=Rede+Vivo&background=e65100&color=fff&bold=true"
  },

  // --- PASSO FUNDO ---
  {
    id: "passofundo-zaffari",
    nome: "Comercial Zaffari — Passo Fundo",
    tipo: "Supermercado",
    rede: "Comercial Zaffari",
    cidade: "Passo Fundo",
    endereco: "Av. Brasil Oeste, 1000 - Centro, Passo Fundo - RS",
    lat: -28.2612,
    lon: -52.4083,
    logoUrl: "https://ui-avatars.com/api/?name=Comercial+Zaffari&background=c62828&color=fff&bold=true"
  },

  // --- NOVO HAMBURGO ---
  {
    id: "nh-bourbon",
    nome: "Bourbon Novo Hamburgo",
    tipo: "Supermercado",
    rede: "Bourbon",
    cidade: "Novo Hamburgo",
    endereco: "Av. Nações Unidas, 2001 - Rio Branco, Novo Hamburgo - RS",
    lat: -29.6890,
    lon: -51.1320,
    logoUrl: "https://ui-avatars.com/api/?name=Bourbon&background=821019&color=fff&bold=true"
  },

  // --- GRAVATAÍ ---
  {
    id: "gravatai-rissul",
    nome: "Rissul — Gravataí Centro",
    tipo: "Supermercado",
    rede: "Rissul",
    cidade: "Gravataí",
    endereco: "Av. Dorival Cândido Luz de Oliveira, 200 - Centro, Gravataí - RS",
    lat: -29.9430,
    lon: -50.9920,
    logoUrl: "https://ui-avatars.com/api/?name=Rissul&background=d81b60&color=fff&bold=true"
  }
];

/**
 * Fórmula de Haversine para cálculo de distância real entre dois pontos (em km).
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

export const marketsService = {
  /**
   * Retorna os estabelecimentos (Supermercados e Atacados) mais próximos do usuário.
   * @param {number} lat - Latitude do usuário
   * @param {number} lon - Longitude do usuário
   * @param {number} maxRadiusKm - Raio máximo de busca
   */
  async findNearby(lat, lon, maxRadiusKm = APP_CONFIG.searchRadiusKm || 20) {
    // Padrão: Guaíba/RS se a localização ainda não tiver sido detectada
    const userLat = lat || -30.1132;
    const userLon = lon || -51.3235;

    const listWithDistance = ESTABELECIMENTOS_RS.map((market) => {
      const dist = calculateDistanceKm(userLat, userLon, market.lat, market.lon);
      return {
        ...market,
        distanciaKm: Number(dist.toFixed(1)),
      };
    });

    // Ordena do mais próximo para o mais distante
    listWithDistance.sort((a, b) => a.distanciaKm - b.distanciaKm);

    // Filtra dentro do raio especificado
    const filtered = listWithDistance.filter((m) => m.distanciaKm <= maxRadiusKm);

    if (filtered.length > 0) {
      return filtered;
    }

    // Se estiver fora do raio padrão, retorna os 8 mais próximos do RS
    return listWithDistance.slice(0, 8);
  },

  /**
   * Retorna todos os estabelecimentos cadastrados no Rio Grande do Sul.
   */
  async getAll() {
    return ESTABELECIMENTOS_RS;
  }
};
