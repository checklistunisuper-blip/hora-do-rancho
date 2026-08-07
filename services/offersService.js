/**
 * offersService.js
 * Orquestra todos os provedores de ofertas registrados, salva os resultados
 * localmente (IndexedDB) e expõe consultas usadas pelo restante do app.
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "./storageService.js";
import { ScrapedFeedProvider } from "./offerProviders/ScrapedFeedProvider.js";

const scrapedProvider = new ScrapedFeedProvider();

export const offersService = {
  /**
   * Busca ofertas para os mercados informados.
   * Apenas preços reais coletados via ScrapedFeedProvider.
   *
   * @param {Array} markets - lista de objetos de mercado (id, nome, ...).
   */
  async fetchAllOffers(markets, context = {}) {
    const marketIds = markets.map((m) => m.id);

    // Busca apenas as ofertas reais do scraper
    const ofertasReais = await scrapedProvider
      .fetchOffers({ marketIds, markets, ...context })
      .catch(() => []);

    const offers = ofertasReais;

    if (offers.length) {
      await storageService.putMany(APP_CONFIG.db.stores.offers, offers);
    }

    return offers.length ? offers : storageService.getAll(APP_CONFIG.db.stores.offers);
  },

  async getAllCached() {
    return storageService.getAll(APP_CONFIG.db.stores.offers);
  },

  async getByCategory(categoria) {
    const all = await this.getAllCached();
    return all
      .filter((o) => o.categoria === categoria)
      .sort((a, b) => a.preco - b.preco);
  },

  async search(term) {
    const all = await this.getAllCached();
    const t = term.trim().toLowerCase();
    if (!t) return [];
    return all.filter(
      (o) =>
        o.nome.toLowerCase().includes(t) ||
        o.marca?.toLowerCase().includes(t) ||
        o.categoria?.toLowerCase().includes(t) ||
        o.codigoBarras?.includes(t)
    );
  },

  /**
   * Agrupa ofertas do mesmo produto (nome+marca, ou só nome como equivalente)
   * entre mercados diferentes e calcula o comparativo.
   */
  async compareProduct(nomeProduto) {
    const all = await this.getAllCached();
    const nomeLower = nomeProduto.toLowerCase();

    let matches = all.filter((o) => o.nome.toLowerCase() === nomeLower);
    let equivalente = false;

    if (matches.length < 2) {
      matches = all.filter((o) => o.nome.toLowerCase().includes(nomeLower));
      equivalente = true;
    }

    if (!matches.length) return null;

    const ordenado = [...matches].sort((a, b) => a.preco - b.preco);
    const menor = ordenado[0];
    const maior = ordenado[ordenado.length - 1];

    return {
      produto: nomeProduto,
      equivalente,
      ofertas: ordenado,
      menorPreco: menor,
      maiorPreco: maior,
      diferenca: Number((maior.preco - menor.preco).toFixed(2)),
      economiaPercentual: Number(
        (((maior.preco - menor.preco) / maior.preco) * 100).toFixed(1)
      ),
      mercadoRecomendadoId: menor.mercadoId,
    };
  },
};
