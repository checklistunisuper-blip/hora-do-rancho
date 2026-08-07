/**
 * MockOfferProvider.js
 * Provedor desativado: desabilita ofertas simuladas/fictícias.
 */

import { OfferProvider } from "./OfferProvider.js";

export class MockOfferProvider extends OfferProvider {
  get id() {
    return "mock-provider";
  }

  get label() {
    return "Catálogo de exemplo (Desativado)";
  }

  async fetchOffers() {
    // Retorna sempre um array vazio para não exibir dados fictícios no app
    return [];
  }
}
