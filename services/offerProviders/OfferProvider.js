/**
 * OfferProvider.js
 * Contrato que TODO provedor de ofertas deve seguir.
 *
 * Para adicionar uma nova fonte de ofertas (uma API de encartes, um feed
 * JSON/CSV publicado por você, um conector de uma rede parceira, etc.),
 * crie uma classe que estenda OfferProvider e implemente fetchOffers().
 * Depois registre a instância em offersService.js — nada mais no app
 * precisa mudar.
 */

export class OfferProvider {
  /** Identificador único do provedor (usado em logs e no campo "fonte" da oferta). */
  get id() {
    throw new Error("Todo provider precisa definir um id.");
  }

  /** Nome amigável exibido, se necessário, na UI. */
  get label() {
    return this.id;
  }

  /**
   * Deve retornar um array de ofertas no formato padrão:
   * {
   *   id, nome, marca, categoria, preco, imagem,
   *   mercadoId, data, validade, fonte
   * }
   * @param {{ marketIds: string[], latitude: number, longitude: number }} context
   */
  async fetchOffers(_context) {
    throw new Error(`${this.id}: fetchOffers() não implementado.`);
  }
}
