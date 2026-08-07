/**
 * src/services/offersService.js
 * Serviço de ofertas unificado com busca web via Gemini.
 */

import { APP_CONFIG } from "../config/config.js";

export const offersService = {
  /**
   * Busca ofertas para uma lista de mercados.
   */
  async fetchAllOffers(markets = [], context = {}) {
    if (!markets || !markets.length) return [];

    let ofertas = [];

    // 1. Tenta buscar ofertas no provedor local (ScrapedFeedProvider)
    try {
      const providerModule = await import("./offerProviders/ScrapedFeedProvider.js").catch(() => ({}));
      const scrapedProvider = providerModule.scrapedProvider || providerModule.default;

      if (scrapedProvider?.fetchOffers) {
        const marketIds = markets.map((m) => m.id);
        ofertas = await scrapedProvider.fetchOffers({ marketIds, markets, ...context }).catch(() => []);
      }
    } catch (e) {
      console.warn("[offersService] Provedor local indisponível:", e);
    }

    // 2. Se não houver ofertas locais, consulta a web via Gemini para o primeiro mercado
    if (!ofertas.length && markets[0]) {
      const primeiroMercado = markets[0];
      const nomeMercado = primeiroMercado.nome || primeiroMercado.rede || "Mercado Local";
      const cidade = context.municipio || context.cidade || "";
      const estado = context.estado || "";

      const ofertasWeb = await this.buscarOfertasNaWeb(nomeMercado, cidade, estado);

      if (ofertasWeb?.ofertas?.length) {
        ofertas = ofertasWeb.ofertas.map((item, index) => ({
          id: `gemini-${primeiroMercado.id || "m"}-${index}-${Date.now()}`,
          marketId: primeiroMercado.id || "m1",
          nomeMercado: nomeMercado,
          produto: item.produto,
          preco: typeof item.preco === "number" ? item.preco : parseFloat(item.preco) || 0,
          unidade: item.unidade || "un",
          origem: "gemini-web",
          atualizadoEm: new Date().toISOString(),
        }));
      }
    }

    // 3. Salva no Storage se operacional
    try {
      const storageModule = await import("./storageService.js").catch(() => ({}));
      const storageService = storageModule.storageService || storageModule.default;
      const storeName = APP_CONFIG?.db?.stores?.offers;

      if (ofertas.length && storageService?.putMany && storeName) {
        await storageService.putMany(storeName, ofertas).catch(() => {});
      }
    } catch (e) {
      console.warn("[offersService] Falha ao persistir ofertas:", e);
    }

    return ofertas;
  },

  /**
   * Chamada direta para a Netlify Function do Gemini Search Grounding
   */
  async buscarOfertasNaWeb(nomeMercado, cidade = "", estado = "") {
    const endpoint = window.location.hostname.includes("github.io")
      ? "https://checklistunisuper-blip.netlify.app/.netlify/functions/search-market-offers"
      : "/.netlify/functions/search-market-offers";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeMercado, cidade, estado }),
      });

      if (!response.ok) {
        throw new Error(`Status HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[offersService] Erro na busca de ofertas para ${nomeMercado}:`, error);
      return { mercado: nomeMercado, ofertas: [], observacao: null };
    }
  }
};

export default offersService;
