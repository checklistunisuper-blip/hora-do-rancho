import { formatarMoeda, formatarData } from "../utils/format.js";

/**
 * Componente de Card de Oferta.
 * @param {Object} offer - Objeto da oferta (id, nome, preco, precoOriginal, imagem, marca, unidade, validade).
 * @param {Object} options - Opções de personalização (mercadoNome, isFavorite, destaque, emRancho).
 */
export function offerCard(
  offer,
  { mercadoNome = "", isFavorite = false, destaque = false, emRancho = false } = {}
) {
  // Cálculo do percentual de desconto se houver preço original
  const temDesconto = offer.precoOriginal && offer.precoOriginal > offer.preco;
  const percentualDesconto = temDesconto
    ? Math.round(((offer.precoOriginal - offer.preco) / offer.precoOriginal) * 100)
    : 0;

  // Formatação de validade com fallback
  const validadeTexto = offer.validade
    ? `Válido até ${formatarData(offer.validade)}`
    : "Validade não informada";

  // Renderização da imagem do produto ou do ícone placeholder
  const imagemHtml = offer.imagem
    ? `<img src="${offer.imagem}" alt="${offer.nome}" class="offer-card__img-el" loading="lazy" />`
    : `<div class="offer-card__img-placeholder" aria-hidden="true">🛒</div>`;

  return `
    <article class="card offer-card ${destaque ? "offer-card--destaque" : ""}" data-offer-id="${offer.id}">
      <div class="offer-card__header">
        <div class="offer-card__img-container">
          ${imagemHtml}
          ${temDesconto ? `<span class="badge badge--danger offer-card__badge">-${percentualDesconto}%</span>` : ""}
        </div>
        <button 
          class="icon-btn favorite-toggle" 
          data-tipo="produto" 
          data-ref-id="${offer.id || offer.nome}"
          aria-label="Favoritar produto" 
          aria-pressed="${isFavorite}"
        >
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <div class="offer-card__body">
        <h4 class="offer-card__name" title="${offer.nome}">${offer.nome}</h4>
        <p class="offer-card__brand">
          ${offer.marca || ""} ${offer.unidade ? (offer.marca ? "· " : "") + offer.unidade : ""}
        </p>
        ${mercadoNome ? `<p class="offer-card__market">🏪 ${mercadoNome}</p>` : ""}
        <p class="offer-card__validity">📅 ${validadeTexto}</p>
      </div>

      <div class="offer-card__footer">
        <div class="offer-card__price-col">
          ${temDesconto ? `<span class="offer-card__price-original">${formatarMoeda(offer.precoOriginal)}</span>` : ""}
          <span class="offer-card__price">${formatarMoeda(offer.preco)}</span>
        </div>

        <button 
          class="btn btn--small ${emRancho ? "btn--secondary" : "btn--outline"} offer-card__btn-rancho" 
          data-action="add-rancho" 
          data-offer-id="${offer.id}"
          title="${emRancho ? "Remover do Rancho" : "Adicionar ao Rancho"}"
        >
          ${emRancho ? "✓ No Rancho" : "+ Rancho"}
        </button>
      </div>
    </article>
  `;
}
