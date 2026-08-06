/**
 * offersService.js
 * Orquestra todos os provedores de ofertas registrados, salva os resultados
 * localmente (IndexedDB) e expõe consultas usadas pelo restante do app.
 *
 * PARA ADICIONAR UM NOVO PROVEDOR: importe a classe, instancie-a e adicione
 * ao array `providers` abaixo. Nenhum outro arquivo do app precisa mudar.
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "./storageService.js";
import { MockOfferProvider } from "./offerProviders/MockOfferProvider.js";
import { ScrapedFeedProvider } from "./offerProviders/ScrapedFeedProvider.js";

const scrapedProvider = new ScrapedFeedProvider();
const mockProvider = new MockOfferProvider();

export const offersService = {
  /**
   * Busca ofertas para os mercados informados. Ordem de prioridade:
   * 1) ScrapedFeedProvider — preços reais coletados (quando o mercado bate
   *    com uma rede configurada em config/redes.json);
   * 2) MockOfferProvider — só entra como fallback para os mercados que
   *    NÃO tiveram nenhuma oferta real encontrada, pra a tela nunca ficar vazia.
   *
   * @param {Array} markets - lista de objetos de mercado (id, nome, ...), não só IDs.
   */
  async fetchAllOffers(markets, context = {}) {
    const marketIds = markets.map((m) => m.id);

    const ofertasReais = await scrapedProvider
      .fetchOffers({ marketIds, markets, ...context })
      .catch(() => []);

    const mercadosComOfertaReal = new Set(ofertasReais.map((o) => o.mercadoId));
    const mercadosSemOfertaReal = markets.filter((m) => !mercadosComOfertaReal.has(m.id));

    const ofertasMock = mercadosSemOfertaReal.length
      ? await mockProvider
          .fetchOffers({
            marketIds: mercadosSemOfertaReal.map((m) => m.id),
            markets: mercadosSemOfertaReal,
            ...context,
          })
          .catch(() => [])
      : [];

    const offers = [...ofertasReais, ...ofertasMock];

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
      // fallback: produtos "equivalentes" pela categoria + nome parecido
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
