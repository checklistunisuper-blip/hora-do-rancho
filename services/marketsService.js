/**
 * src/services/marketsService.js
 * Serviço unificado de mercados e ofertas do Hora do Rancho.
 */

let payloadCapturado = {
  updatedAt: null,
  dataFormatada: "Recente",
  ofertasPorMercado: {}
};

// Tenta carregar dados raspados via GitHub Actions / Robô Gemini
async function carregarOfertasCapturadas() {
  try {
    const cacheBuster = Date.now();
    const response = await fetch(`/data/ofertas-capturadas.json?t=${cacheBuster}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.ofertasPorMercado) {
        payloadCapturado = data;
      }
    }
  } catch (e) {
    console.warn("Utilizando ofertas estáticas de fallback.");
  }
}

// Lista expandida com grandes redes de supermercados e atacadistas do RS
const ESTABELECIMENTOS_RS = [
  // --- GUAÍBA ---
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
      { produto: "Café Torrado e Moído 500g", preco: "R$ 14,90", tag: "Oferta do Dia" },
      { produto: "Leite Integral 1L", preco: "R$ 4,19", tag: "Promoção" },
      { produto: "Açúcar Refinado 1kg", preco: "R$ 3,99", tag: "Oferta" }
    ]
  },
  {
    id: "asun-guaiba",
    nome: "Asun Supermercados — Guaíba",
    tipo: "Supermercado",
    rede: "Asun",
    cidade: "Guaíba",
    endereco: "R. São José, 420 - Centro, Guaíba - RS",
    lat: -30.1132,
    lon: -51.3235,
    logoUrl: "https://ui-avatars.com/api/?name=Asun&background=1b7a3d&color=fff&bold=true",
    ofertas: [
      { produto: "Costela Bovina kg", preco: "R$ 26,90", tag: "Churrasco" },
      { produto: "Cerveja Lata 350ml", preco: "R$ 2,89", tag: "Oferta" }
    ]
  },
  {
    id: "nacional-guaiba",
    nome: "Nacional — Guaíba",
    tipo: "Supermercado",
    rede: "Nacional",
    cidade: "Guaíba",
    endereco: "R. Dr. Lauro Azambuja, 77 - Centro, Guaíba - RS",
    lat: -30.1115,
    lon: -51.3210,
    logoUrl: "https://ui-avatars.com/api/?name=Nacional&background=d32f2f&color=fff&bold=true",
    ofertas: [
      { produto: "Detergente Líquido 500ml", preco: "R$ 2,19", tag: "Limpeza" },
      { produto: "Sabão em Pó 1.6kg", preco: "R$ 15,90", tag: "Desconto" }
    ]
  },

  // --- CANOAS ---
  {
    id: "stok-canoas",
    nome: "Stok Center — Canoas",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Canoas",
    endereco: "Av. Getúlio Vargas, 2400 - Niterói, Canoas - RS",
    lat: -29.9320,
    lon: -51.1710,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true",
    ofertas: [
      { produto: "Arroz Parboilizado 5kg", preco: "R$ 19,90", tag: "Oferta" },
      { produto: "Feijão Preto 1kg", preco: "R$ 7,89", tag: "Destaque" },
      { produto: "Óleo de Soja 900ml", preco: "R$ 5,49", tag: "Preço Baixo" }
    ]
  },
  {
    id: "fort-canoas",
    nome: "Fort Atacadista — Canoas",
    tipo: "Atacado",
    rede: "Fort Atacadista",
    cidade: "Canoas",
    endereco: "Av. Farroupilha, 4545 - Marechal Rondon, Canoas - RS",
    lat: -29.9075,
    lon: -51.1680,
    logoUrl: "https://ui-avatars.com/api/?name=Fort+Atacadista&background=0277bd&color=fff&bold=true",
    ofertas: [
      { produto: "Lava Roupas Líquido 3L", preco: "R$ 24,90", tag: "Atacado" },
      { produto: "Papel Higiênico Folha Dupla 12un", preco: "R$ 13,80", tag: "Promoção" }
    ]
  },
  {
    id: "via-atacadista-canoas",
    nome: "Via Atacadista — Canoas",
    tipo: "Atacado",
    rede: "Via Atacadista",
    cidade: "Canoas",
    endereco: "Av. Guilherme Schell, 6750 - Mathias Velho, Canoas - RS",
    lat: -29.9140,
    lon: -51.1890,
    logoUrl: "https://ui-avatars.com/api/?name=Via+Atacadista&background=e65100&color=fff&bold=true",
    ofertas: [
      { produto: "Coxão Mole Bovino kg", preco: "R$ 31,90", tag: "Açougue" },
      { produto: "Cerveja Pilsen Latão 473ml", preco: "R$ 3,49", tag: "Bebidas" }
    ]
  },

  // --- PORTO ALEGRE ---
  {
    id: "zaffari-bourbon-ipiranga",
    nome: "Bourbon Hipermercado — Ipiranga",
    tipo: "Hipermercado",
    rede: "Zaffari",
    cidade: "Porto Alegre",
    endereco: "Av. Ipiranga, 5200 - Partenon, Porto Alegre - RS",
    lat: -30.0545,
    lon: -51.1830,
    logoUrl: "https://ui-avatars.com/api/?name=Zaffari&background=821019&color=fff&bold=true",
    ofertas: [
      { produto: "Queijo Mussarela Fatiado 400g", preco: "R$ 16,90", tag: "Oferta" },
      { produto: "Vinho Red 750ml", preco: "R$ 29,90", tag: "Especial" }
    ]
  },
  {
    id: "zaffari-centro",
    nome: "Zaffari — Fernando Machado",
    tipo: "Supermercado",
    rede: "Zaffari",
    cidade: "Porto Alegre",
    endereco: "R. Fernando Machado, 860 - Centro Histórico, Porto Alegre - RS",
    lat: -30.0346,
    lon: -51.2290,
    logoUrl: "https://ui-avatars.com/api/?name=Zaffari&background=821019&color=fff&bold=true",
    ofertas: [
      { produto: "Pão de Forma Tradicional 480g", preco: "R$ 6,49", tag: "Padaria" },
      { produto: "Manteiga Extra com Sal 200g", preco: "R$ 9,90", tag: "Oferta" }
    ]
  },
  {
    id: "atacadao-sertorio",
    nome: "Atacadão — Sertório",
    tipo: "Atacado",
    rede: "Atacadão",
    cidade: "Porto Alegre",
    endereco: "Av. Sertório, 8000 - Sarandi, Porto Alegre - RS",
    lat: -29.9985,
    lon: -51.1390,
    logoUrl: "https://ui-avatars.com/api/?name=Atacadao&background=f57c00&color=fff&bold=true",
    ofertas: [
      { produto: "Farinha de Trigo Tipo 1 5kg", preco: "R$ 14,50", tag: "Atacado" },
      { produto: "Caixa de Leite Condensado 395g (12un)", preco: "R$ 54,00", tag: "Caixa Fechada" }
    ]
  },
  {
    id: "desco-zona-sul",
    nome: "Desco Super&Atacado — Cavalhada",
    tipo: "Atacado",
    rede: "Desco",
    cidade: "Porto Alegre",
    endereco: "Av. Cavalhada, 3000 - Cavalhada, Porto Alegre - RS",
    lat: -30.1060,
    lon: -51.2280,
    logoUrl: "https://ui-avatars.com/api/?name=Desco&background=2e7d32&color=fff&bold=true",
    ofertas: [
      { produto: "Cerveja Heineken Long Neck 330ml", preco: "R$ 5,99", tag: "Super Oferta" },
      { produto: "Alcatra Bovina com Maminha kg", preco: "R$ 34,90", tag: "Churrasco" }
    ]
  },
  {
    id: "carrefour-pasqualini",
    nome: "Carrefour Hipermercado — Partenon",
    tipo: "Hipermercado",
    rede: "Carrefour",
    cidade: "Porto Alegre",
    endereco: "R. Bento Gonçalves, 5600 - Partenon, Porto Alegre - RS",
    lat: -30.0610,
    lon: -51.1710,
    logoUrl: "https://ui-avatars.com/api/?name=Carrefour&background=1565c0&color=fff&bold=true",
    ofertas: [
      { produto: "Smart TV LED 50\" 4K", preco: "R$ 1.899,00", tag: "Eletro" },
      { produto: "Azeite de Oliva Extra Virgem 500ml", preco: "R$ 32,90", tag: "Oferta" }
    ]
  },
  {
    id: "sams-club-poa",
    nome: "Sam's Club — Sertório",
    tipo: "Clube de Compras",
    rede: "Sam's Club",
    cidade: "Porto Alegre",
    endereco: "Av. Sertório, 6600 - Sarandi, Porto Alegre - RS",
    lat: -29.9990,
    lon: -51.1480,
    logoUrl: "https://ui-avatars.com/api/?name=Sams+Club&background=0d47a1&color=fff&bold=true",
    ofertas: [
      { produto: "Pneu 175/65 R14 Aro 14", preco: "R$ 289,90", tag: "Exclusivo Sócios" },
      { produto: "Biscoito Importado Stroopwafel 400g", preco: "R$ 21,90", tag: "Importado" }
    ]
  },

  // --- GRAVATAÍ & VIAMÃO ---
  {
    id: "stock-center-gravatai",
    nome: "Stok Center — Gravataí",
    tipo: "Atacado",
    rede: "Stok Center",
    cidade: "Gravataí",
    endereco: "Av. Dorival Cândido Luz de Oliveira, 6000 - Gravataí - RS",
    lat: -29.9410,
    lon: -51.0110,
    logoUrl: "https://ui-avatars.com/api/?name=Stok+Center&background=f57c00&color=fff&bold=true",
    ofertas: [
      { produto: "Margarina com Sal 500g", preco: "R$ 5,99", tag: "Oferta" },
      { produto: "Biscoito Recheado 130g", preco: "R$ 1,99", tag: "Lanche" }
    ]
  },
  {
    id: "guarani-viamao",
    nome: "Supermercado Guarani — Viamão",
    tipo: "Supermercado",
    rede: "Guarani",
    cidade: "Viamão",
    endereco: "Av. Senador Salgado Filho, 2200 - Viamão - RS",
    lat: -30.0810,
    lon: -51.0250,
    logoUrl: "https://ui-avatars.com/api/?name=Guarani&background=c62828&color=fff&bold=true",
    ofertas: [
      { produto: "Massa para Lasanha 500g", preco: "R$ 4,89", tag: "Massa" },
      { produto: "Molho de Tomate Sachê 300g", preco: "R$ 1,69", tag: "Oferta" }
    ]
  }
];

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

function formatMarketPayload(market, userLat = -30.1132, userLon = -51.3235) {
  const distNum = calculateDistanceKm(userLat, userLon, market.lat, market.lon);
  const distKm = Number(distNum.toFixed(1));
  const distMeters = Math.round(distNum * 1000);
  const distText = distKm < 1 ? `${distMeters} m` : `${distKm} km`;

  const ofertasDinamicas = payloadCapturado.ofertasPorMercado?.[market.id];
  const ofertasList = (ofertasDinamicas && ofertasDinamicas.length > 0) 
    ? ofertasDinamicas 
    : (market.ofertas || []);

  return {
    ...market,
    name: market.nome,
    title: market.nome,
    distanciaKm: distKm,
    distanciaFormatada: distText,
    dataAtualizacao: payloadCapturado.dataFormatada || "Recente",
    ofertas: ofertasList,
    offers: ofertasList,
    ofertasCount: ofertasList.length,
    hasOffers: ofertasList.length > 0
  };
}

export const marketsService = {
  async refresh() {
    await carregarOfertasCapturadas();
  },

  async getById(id, userLat = -30.1132, userLon = -51.3235) {
    await carregarOfertasCapturadas();
    const market = ESTABELECIMENTOS_RS.find((m) => m.id === id) || ESTABELECIMENTOS_RS[0];
    return formatMarketPayload(market, userLat, userLon);
  },

  async findNearby(lat = -30.1132, lon = -51.3235, maxRadiusKm = 100) {
    await carregarOfertasCapturadas();
    
    const list = ESTABELECIMENTOS_RS.map((m) => formatMarketPayload(m, lat, lon));
    list.sort((a, b) => a.distanciaKm - b.distanciaKm);
    
    return list.filter((m) => m.distanciaKm <= maxRadiusKm);
  },

  async getAll(lat = -30.1132, lon = -51.3235) {
    await carregarOfertasCapturadas();
    return ESTABELECIMENTOS_RS.map((m) => formatMarketPayload(m, lat, lon));
  }
};

export default marketsService;
