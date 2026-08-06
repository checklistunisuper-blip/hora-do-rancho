import { formatarDistancia, formatarDataHora } from "../utils/format.js";

export function marketCard(market, { isFavorite = false } = {}) {
  const atualizado = market.ultimaAtualizacaoOfertas
    ? formatarDataHora(market.ultimaAtualizacaoOfertas)
    : "sem ofertas carregadas";

  return `
    <article class="card market-card" data-market-id="${market.id}">
      <div class="market-card__header">
        <span class="badge badge--${market.tipo === "Atacado" ? "orange" : "green"}">${market.tipo}</span>
        <button class="icon-btn favorite-toggle" data-tipo="mercado" data-ref-id="${market.id}"
          aria-label="Favoritar mercado" aria-pressed="${isFavorite}">
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      </div>
      <h3 class="market-card__name">${market.nome}</h3>
      <p class="market-card__address">${market.endereco || "Endereço não informado"}</p>
      <div class="market-card__meta">
        <span>📍 ${formatarDistancia(market.distanciaKm)}</span>
        <span>🕒 ${atualizado}</span>
      </div>
      <button class="btn btn--primary btn--block" data-action="ver-ofertas" data-market-id="${market.id}">
        VER OFERTAS
      </button>
    </article>
  `;
}
