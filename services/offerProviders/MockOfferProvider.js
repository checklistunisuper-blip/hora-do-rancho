/**
 * MockOfferProvider.js
 * Provedor de exemplo: gera ofertas plausíveis (com pequena variação de preço)
 * para cada mercado encontrado, a partir de assets/data/mock-offers.json.
 *
 * Serve para o app funcionar de ponta a ponta enquanto uma fonte real de
 * encartes (API paga, feed próprio, ou o ScrapedFeedProvider) não está
 * configurada. Troque ou combine provedores em offersService.js.
 */

import { OfferProvider } from "./OfferProvider.js";

let cachedTemplate = null;

async function loadTemplate() {
  if (cachedTemplate) return cachedTemplate;
  const response = await fetch("./assets/data/mock-offers.json");
  cachedTemplate = await response.json();
  return cachedTemplate;
}

// Variação determinística por mercado, para o mesmo produto ter preços
// diferentes (mas estáveis) entre mercados distintos — permite comparar.
function priceVariation(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  }
  return 0.85 + (hash / 1000) * 0.35; // entre -15% e +20%
}

export class MockOfferProvider extends OfferProvider {
  get id() {
    return "mock-provider";
  }

  get label() {
    return "Catálogo de exemplo";
  }

  async fetchOffers({ marketIds = [], markets = [] }) {
    // Só entra em ação se o provider de dados reais não cobriu nenhum mercado.
    marketIds = marketIds.length ? marketIds : markets.map((m) => m.id);
    const template = await loadTemplate();
    const today = new Date();
    const validade = new Date(today);
    validade.setDate(validade.getDate() + 7);

    const offers = [];

    marketIds.forEach((marketId) => {
      template.forEach((item, index) => {
        const variation = priceVariation(marketId + item.nome);
        offers.push({
          id: `mock-${marketId}-${index}`,
          nome: item.nome,
          marca: item.marca,
          categoria: item.categoria,
          preco: Number((item.preco * variation).toFixed(2)),
          unidade: item.unidade,
          imagem: null,
          mercadoId: marketId,
          data: today.toISOString(),
          validade: validade.toISOString(),
          fonte: this.id,
        });
      });
    });

    return offers;
  }
}
