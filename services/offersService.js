/**
 * src/services/offersService.js
 * Serviço de ofertas resiliente contra erros de importação.
 */

import { APP_CONFIG } from "../config/config.js";

export const offersService = {
  /**
   * Busca todas as ofertas para os mercados informados.
   */
  async fetchAllOffers(markets = [], context = {}) {
    if (!markets || !markets.length) return [];

    let ofertas = [];

    // 1. Tenta carregar do provedor de raspagem/feed se disponível
    try {
      const { scrapedProvider } = await import("./offerProviders/ScrapedFeedProvider.js").catch(() => ({}));
      if (scrapedProvider?.fetchOffers) {
        const marketIds = markets.map((m) => m.id);
        ofertas = await scrapedProvider.fetchOffers({ marketIds, markets, ...context }).catch(() => []);
      }
    } catch (e) {
      console.warn("[offersService] Provedor local indisponível:", e);
    }

    // 2. Se não encontrou ofertas no feed, busca na web via Gemini
    if (!ofertas.length && markets[0]) {
      const primeiroMercado = markets[0];
      const nomeMercado = primeiroMercado.nome || primeiroMercado.rede || "Mercado";
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

    // 3. Salva no Storage se o storageService estiver operacional
    try {
      const storageModule = await import("./storageService.js").catch(() => ({}));
      const storageService = storageModule.storageService || storageModule.default;
      const storeName = APP_CONFIG?.db?.stores?.offers;

      if (ofertas.length && storageService?.putMany && storeName) {
        await storageService.putMany(storeName, ofertas).catch(() => {});
      }
    } catch (e) {
      console.warn("[offersService] Não foi possível salvar em cache local:", e);
    }

    return ofertas;
  },

  /**
   * Função para chamar a Netlify Function do Gemini Search Grounding
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

      const dados = await response.json();
      return dados;
    } catch (error) {
      console.warn(`[offersService] Falha na requisição para ${nomeMercado}:`, error);
      return { mercado: nomeMercado, ofertas: [], observacao: null };
    }
  }
};

// Exportação padrão para compatibilidade universal
export default offersService;
