// src/services/offersService.js

export const offersService = {
  async fetchAllOffers(markets, context = {}) {
    const marketIds = markets.map((m) => m.id);

    const ofertasReais = await scrapedProvider
      .fetchOffers({ marketIds, markets, ...context })
      .catch(() => []);

    // Atualiza o IndexedDB com ofertas reais
    if (ofertasReais.length) {
      await storageService.putMany(APP_CONFIG.db.stores.offers, ofertasReais);
    }

    // Retorna apenas as ofertas encontradas na requisição atual
    return ofertasReais;
  },
  
  // ... restam os demais métodos sem alteração
};
