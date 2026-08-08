import { formatarDistancia, formatarDataHora } from "../utils/format.js";

export function marketCard(market, { isFavorite = false } = {}) {
  const atualizado = market.ultimaAtualizacaoOfertas
    ? formatarDataHora(market.ultimaAtualizacaoOfertas)
    : "sem ofertas carregadas";

  const telefoneHtml = market.telefone
    ? `<a href="tel:${market.telefone.replace(/\D/g, "")}" class="market-card__phone" title="Ligar para o mercado">📞 ${market.telefone}</a>`
    : "";

  const mapaUrl = market.lat && market.lng
    ? `https://www.google.com/maps/search/?api=1&query=${market.lat},${market.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${market.nome} ${market.endereco || ""}`)}`;

  return `
    <article class="card market-card" data-market-id="${market.id}">
      <div class="market-card__header">
        <span class="badge badge--${market.tipo === "Atacado" ? "orange" : "green"}">${market.tipo || "Supermercado"}</span>
        <button class="icon-btn favorite-toggle" data-tipo="mercado" data-ref-id="${market.id}"
          aria-label="Favoritar mercado" aria-pressed="${isFavorite}">
          ${isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      <h3 class="market-card__name">${market.nome}</h3>
      <p class="market-card__address">
        <a href="${mapaUrl}" target="_blank" rel="noopener noreferrer" class="market-card__address-link" title="Abrir no Google Maps">
          📍 ${market.endereco || "Endereço não informado"}
        </a>
      </p>

      <div class="market-card__meta">
        <span>📏 ${formatarDistancia(market.distanciaKm)}</span>
        <span>🕒 ${atualizado}</span>
      </div>

      ${telefoneHtml ? `<div class="market-card__contact">${telefoneHtml}</div>` : ""}

      <div class="market-card__actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="btn btn--primary" style="flex: 1;" data-action="ver-ofertas" data-market-id="${market.id}">
          VER OFERTAS
        </button>
        <a href="${mapaUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--outline" title="Como Chegar" style="display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 0.75rem;">
          🗺️
        </a>
      </div>
    </article>
  `;
}
