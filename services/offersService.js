/**
 * src/services/offersService.js
 * Serviço unificado para busca de ofertas (locais, raspadas e via Gemini AI Grounding).
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "./storageService.js";
import { scrapedProvider } from "./offerProviders/ScrapedFeedProvider.js";

export const offersService = {
  /**
   * Busca todas as ofertas para uma lista de mercados.
   * Tenta primeiro o provedor padronizado; se retornar vazio, consulta a web via Gemini.
   */
  async fetchAllOffers(markets = [], context = {}) {
    if (!markets.length) return [];

    const marketIds = markets.map((m) => m.id);

    // 1. Tenta buscar ofertas no feed/provedor local
    let ofertas = await scrapedProvider
      .fetchOffers({ marketIds, markets, ...context })
      .catch(() => []);

    // 2. Se não houver ofertas no feed, busca na web via Gemini para o primeiro mercado da lista
    if (!ofertas.length && markets[0]) {
      const primeiroMercado = markets[0];
      const ofertasWeb = await this.buscarOfertasNaWeb(
        primeiroMercado.nome || primeiroMercado.rede,
        context.municipio || context.cidade || "",
        context.estado || ""
      );

      if (ofertasWeb.ofertas && ofertasWeb.ofertas.length) {
        // Mapeia para o formato interno do seu app
        ofertas = ofertasWeb.ofertas.map((item, index) => ({
          id: `gemini-${primeiroMercado.id || "m"}-${index}-${Date.now()}`,
          marketId: primeiroMercado.id || "m1",
          nomeMercado: primeiroMercado.nome || "Mercado Local",
          produto: item.produto,
          preco: typeof item.preco === "number" ? item.preco : parseFloat(item.preco) || 0,
          unidade: item.unidade || "un",
          origem: "gemini-web",
          atualizadoEm: new Date().toISOString(),
        }));
      }
    }

    // 3. Atualiza o IndexedDB/Storage com as ofertas obtidas
    if (ofertas.length && storageService?.putMany && APP_CONFIG?.db?.stores?.offers) {
      await storageService.putMany(APP_CONFIG.db.stores.offers, ofertas).catch(() => {});
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
        throw new Error(`Erro HTTP na função de busca (${response.status})`);
      }

      const dados = await response.json();
      return dados; // Retorna { mercado, cidade, ofertas: [...], observacao }
    } catch (error) {
      console.warn(`[offersService] Não foi possível buscar ofertas na web para "${nomeMercado}":`, error);
      return { mercado: nomeMercado, ofertas: [], observacao: null };
    }
  },

  /**
   * Recupera ofertas salvas no cache do IndexedDB por id do mercado
   */
  async getCachedOffersByMarket(marketId) {
    if (!storageService?.getAll || !APP_CONFIG?.db?.stores?.offers) return [];
    try {
      const todas = await storageService.getAll(APP_CONFIG.db.stores.offers);
      return todas.filter((item) => item.marketId === marketId);
    } catch {
      return [];
    }
  }
};

// Exportação padrão para compatibilidade universal entre módulos
export default offersService;
