/**
 * src/services/offerProviders/ScrapedFeedProvider.js
 */

export const scrapedProvider = {
  async fetchOffers(context = {}) {
    try {
      const response = await fetch("./assets/data/scraped-offers.json").catch(() => null);
      if (!response || !response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
};

// Exportação padrão para garantia de compatibilidade
export default scrapedProvider;
