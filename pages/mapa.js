import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/storageService.js";
import { marketsService } from "../services/marketsService.js";
import { favoritesService } from "../services/favoritesService.js";
import { marketCard } from "../components/marketCard.js";

export async function render() {
  return `
    <section class="screen mapa-screen">
      <header class="page-header">
        <h1>Mercados próximos</h1>
        <p class="muted">Raio de busca: ${APP_CONFIG.searchRadiusKm} km</p>
      </header>
      <div id="leaflet-map" class="leaflet-map"></div>
      <div id="markets-list" class="markets-list">
        <p class="muted">Carregando mercados...</p>
      </div>
    </section>
  `;
}

export async function afterRender(router) {
  const pos = storageService.getPreference("posicao");
  const listEl = document.getElementById("markets-list");
  const mapEl = document.getElementById("leaflet-map");

  if (!pos) {
    listEl.innerHTML = `<p class="muted">Detecte sua localização na tela inicial para ver o mapa.</p>`;
    mapEl.style.display = "none";
    return;
  }

  const markets = await marketsService.findNearby(pos.latitude, pos.longitude);

  if (!markets.length) {
    listEl.innerHTML = `<p class="muted">Nenhum mercado encontrado em ${APP_CONFIG.searchRadiusKm} km. Tente novamente mais tarde.</p>`;
  } else {
    const favs = await favoritesService.getAll("mercado");
    const favIds = new Set(favs.map((f) => f.refId));
    listEl.innerHTML = markets
      .map((m) => marketCard(m, { isFavorite: favIds.has(m.id) }))
      .join("");
  }

  // Mapa Leaflet (biblioteca open source, carregada via CDN no index.html)
  if (window.L) {
    const map = L.map(mapEl).setView([pos.latitude, pos.longitude], 14);
    L.tileLayer(APP_CONFIG.mapTiles.url, { attribution: APP_CONFIG.mapTiles.attribution }).addTo(map);

    L.marker([pos.latitude, pos.longitude], {
      icon: L.divIcon({ className: "map-pin map-pin--user", html: "📍" }),
    })
      .addTo(map)
      .bindPopup("Você está aqui");

    markets.forEach((m) => {
      L.marker([m.latitude, m.longitude], {
        icon: L.divIcon({ className: "map-pin", html: "🛒" }),
      })
        .addTo(map)
        .bindPopup(
          `<strong>${m.nome}</strong><br>${m.endereco || ""}<br>${m.distanciaKm.toFixed(1)} km`
        );
    });
  }

  listEl.addEventListener("click", async (e) => {
    const verOfertasBtn = e.target.closest('[data-action="ver-ofertas"]');
    if (verOfertasBtn) {
      router.navigate(`/ofertas?mercadoId=${verOfertasBtn.dataset.marketId}`);
      return;
    }

    const favBtn = e.target.closest(".favorite-toggle");
    if (favBtn) {
      const market = markets.find((m) => m.id === favBtn.dataset.refId);
      const isFav = await favoritesService.toggle("mercado", favBtn.dataset.refId, {
        nome: market?.nome,
      });
      favBtn.textContent = isFav ? "❤️" : "🤍";
      favBtn.setAttribute("aria-pressed", isFav);
    }
  });
}
