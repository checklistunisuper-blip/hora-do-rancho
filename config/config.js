/**
 * src/pages/mapa.js
 * Exibe o mapa usando Google Maps com remoção do prefixo padrão do Leaflet.
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/storageService.js";
import { marketsService } from "../services/marketsService.js";
import { favoritesService } from "../services/favoritesService.js";
import { marketCard } from "../components/marketCard.js";

function getMarketLogo(market) {
  if (market.logoUrl || market.logo) {
    return market.logoUrl || market.logo;
  }
  const nome = market.nome || market.rede || "Mercado";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=1b7a3d&color=fff&bold=true&length=2`;
}

export async function render() {
  const radius = APP_CONFIG?.searchRadiusKm || 10;
  return `
    <section class="screen mapa-screen">
      <header class="page-header">
        <h1>Mercados próximos</h1>
        <p class="muted">Raio de busca: ${radius} km</p>
      </header>
      <div id="leaflet-map" class="leaflet-map"></div>
      <div id="markets-list" class="markets-list">
        <p class="muted">Carregando mercados...</p>
      </div>
    </section>
  `;
}

export async function afterRender(router) {
  const pos = storageService.getPreference("posicao") || storageService.getPreference("user_location");
  const listEl = document.getElementById("markets-list");
  const mapEl = document.getElementById("leaflet-map");

  if (!pos || !pos.latitude || !pos.longitude) {
    if (listEl) {
      listEl.innerHTML = `<p class="muted">Detecte sua localização na tela inicial para ver o mapa.</p>`;
    }
    if (mapEl) mapEl.style.display = "none";
    return;
  }

  const radius = APP_CONFIG?.searchRadiusKm || 10;
  const markets = await marketsService.findNearby(pos.latitude, pos.longitude).catch(() => []);

  if (!markets || !markets.length) {
    if (listEl) {
      listEl.innerHTML = `<p class="muted">Nenhum mercado encontrado em ${radius} km. Tente novamente mais tarde.</p>`;
    }
  } else {
    const favs = await favoritesService.getAll("mercado").catch(() => []);
    const favIds = new Set(favs.map((f) => f.refId || f.id));

    if (listEl) {
      listEl.innerHTML = markets
        .map((m) => {
          const logoUrl = getMarketLogo(m);
          return marketCard({ ...m, logoUrl }, { isFavorite: favIds.has(m.id) });
        })
        .join("");
    }
  }

  // Configuração do Mapa Leaflet
  if (window.L && mapEl) {
    // Limpa instância anterior do mapa caso exista (evita erro de reinicialização)
    if (mapEl._leaflet_id) {
      mapEl._leaflet_id = null;
    }

    const map = L.map(mapEl).setView([pos.latitude, pos.longitude], 14);

    // 1. REMOVE O PREFIXO "Leaflet | " DO CANTO INFERIOR DIREITO
    if (map.attributionControl) {
      map.attributionControl.setPrefix(false);
    }

    // 2. FORÇA A CAMADA DO GOOGLE MAPS DIRECTAMENTE (Garante que não dependa de cache antigo)
    const googleTilesUrl = APP_CONFIG?.mapTiles?.url || "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    const googleAttribution = APP_CONFIG?.mapTiles?.attribution || "&copy; Google Maps";
    const subdomains = APP_CONFIG?.mapTiles?.subdomains || ["mt0", "mt1", "mt2", "mt3"];

    L.tileLayer(googleTilesUrl, {
      maxZoom: 20,
      subdomains: subdomains,
      attribution: googleAttribution,
    }).addTo(map);

    // Marcador do Usuário
    L.marker([pos.latitude, pos.longitude], {
      icon: L.divIcon({
        className: "map-pin map-pin--user",
        html: `<div style="background: #2563eb; color: white; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    })
      .addTo(map)
      .bindPopup("<strong>Você está aqui</strong>");

    // Marcadores dos Mercados com Logo
    markets.forEach((m) => {
      const lat = m.lat ?? m.latitude;
      const lon = m.lon ?? m.longitude;
      if (!lat || !lon) return;

      const logoUrl = getMarketLogo(m);
      const distKm = Number(m.distanciaKm || m.distancia || 0).toFixed(1);

      const customMarketIcon = L.divIcon({
        className: "map-pin map-pin--market",
        html: `
          <div style="background: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #1b7a3d; box-shadow: 0 3px 8px rgba(0,0,0,0.3); overflow: hidden;">
            <img src="${logoUrl}" alt="${m.nome}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(m.nome)}&background=1b7a3d&color=fff';" />
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([lat, lon], { icon: customMarketIcon })
        .addTo(map)
        .bindPopup(`
          <div style="display: flex; align-items: center; gap: 10px; font-family: sans-serif;">
            <img src="${logoUrl}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid #1b7a3d;" />
            <div>
              <strong style="font-size: 14px; color: #1b7a3d; display: block; margin-bottom: 2px;">${m.nome}</strong>
              <small style="color: #666; display: block; margin-bottom: 2px;">${m.endereco || "Região próxima"}</small>
              <span style="font-size: 12px; font-weight: bold; color: #333;">📏 ${distKm} km</span>
            </div>
          </div>
        `);
    });
  }

  // Eventos de clique
  if (listEl) {
    listEl.addEventListener("click", async (e) => {
      const verOfertasBtn = e.target.closest('[data-action="ver-ofertas"]');
      if (verOfertasBtn) {
        router.navigate(`/ofertas?mercadoId=${verOfertasBtn.dataset.marketId}`);
        return;
      }

      const favBtn = e.target.closest(".favorite-toggle");
      if (favBtn) {
        const marketId = favBtn.dataset.refId;
        const market = markets.find((m) => m.id === marketId);
        const isFav = await favoritesService.toggle("mercado", marketId, {
          nome: market?.nome,
        });
        favBtn.textContent = isFav ? "❤️" : "🤍";
        favBtn.setAttribute("aria-pressed", isFav);
      }
    });
  }
}

export default { render, afterRender };
