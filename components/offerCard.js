import { formatarMoeda, formatarData } from "../utils/format.js";

export function offerCard(offer, { mercadoNome = "", isFavorite = false, destaque = false } = {}) {
  return `
    <article class="card offer-card ${destaque ? "offer-card--destaque" : ""}" data-offer-id="${offer.id}">
      <div class="offer-card__img" role="img" aria-label="${offer.nome}">🛒</div>
      <div class="offer-card__body">
        <h4 class="offer-card__name">${offer.nome}</h4>
        <p class="offer-card__brand">${offer.marca || ""} ${offer.unidade ? "· " + offer.unidade : ""}</p>
        ${mercadoNome ? `<p class="offer-card__market">${mercadoNome}</p>` : ""}
        <p class="offer-card__validity">Válido até ${formatarData(offer.validade)}</p>
      </div>
      <div class="offer-card__price-col">
        <span class="offer-card__price">${formatarMoeda(offer.preco)}</span>
        <button class="icon-btn favorite-toggle" data-tipo="produto" data-ref-id="${offer.nome}"
          aria-label="Favoritar produto" aria-pressed="${isFavorite}">
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
    </article>
  `;
}
