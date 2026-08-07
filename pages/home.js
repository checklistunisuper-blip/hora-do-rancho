import { APP_CONFIG } from "../config/config.js";
import { geolocationService } from "../services/geolocationService.js";
import marketsService from "../services/marketsService.js"; // <--- REMOVIDAS AS CHAVES
import { storageService } from "../services/storageService.js";

export async function render() {
  const localSalvo = storageService.getPreference("localizacao");
  const posSalva = storageService.getPreference("posicao");
  const temLocalOuPos = Boolean(localSalvo || posSalva);

  return `
    <section class="screen home-screen">
      <header class="home-hero">
        <img src="./assets/icons/icon-96x96.png" alt="Hora do Rancho" class="home-hero__logo" />
        <h1 class="home-hero__title">HORA DO RANCHO</h1>
        <p class="home-hero__slogan">${APP_CONFIG.slogan || "Economize nas suas compras"}</p>
      </header>

      <div class="card location-card">
        <h2 class="section-title">Sua localização</h2>
        <div id="location-display" class="location-display">
          ${
            localSalvo
              ? `<p>📍 ${localSalvo.bairro ? localSalvo.bairro + ", " : ""}${localSalvo.municipio} - ${localSalvo.estado}</p>`
              : `<p class="muted">Localização ainda não detectada.</p>`
          }
        </div>

        <button id="btn-detectar-local" class="btn btn--outline btn--block">
          📡 DETECTAR MINHA LOCALIZAÇÃO
        </button>

        <details class="manual-location">
          <summary>Alterar manualmente</summary>
          <form id="form-local-manual" class="manual-location__form">
            <input type="text" name="estado" placeholder="Estado" value="${localSalvo?.estado || ""}" required />
            <input type="text" name="municipio" placeholder="Município" value="${localSalvo?.municipio || ""}" required />
            <input type="text" name="bairro" placeholder="Bairro" value="${localSalvo?.bairro || ""}" />
            <button type="submit" class="btn btn--secondary btn--block">Salvar localização</button>
          </form>
        </details>
      </div>

      <button id="btn-buscar-ofertas" class="btn btn--primary btn--block btn--large" ${temLocalOuPos ? "" : "disabled"}>
        BUSCAR OFERTAS
      </button>

      <div id="home-status" class="status-message" role="status"></div>
    </section>
  `;
}

export function afterRender(router) {
  const statusEl = document.getElementById("home-status");
  const locationDisplay = document.getElementById("location-display");
  const btnBuscar = document.getElementById("btn-buscar-ofertas");

  // ---- 1. Detectar via GPS ----
  document.getElementById("btn-detectar-local")?.addEventListener("click", async () => {
    if (statusEl) statusEl.textContent = "Obtendo sua localização...";
    try {
      const pos = await geolocationService.getCurrentPosition();
      storageService.setPreference("posicao", pos);

      if (statusEl) statusEl.textContent = "Identificando endereço...";
      const endereco = await geolocationService.reverseGeocode(pos.latitude, pos.longitude);
      storageService.setPreference("localizacao", endereco);

      if (locationDisplay) {
        locationDisplay.innerHTML = `<p>📍 ${endereco.bairro ? endereco.bairro + ", " : ""}${endereco.municipio} - ${endereco.estado}</p>`;
      }
      if (statusEl) statusEl.textContent = "Localização detectada com sucesso!";
      if (btnBuscar) btnBuscar.disabled = false;
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = `Não foi possível obter GPS: ${error.message}. Você pode informar manualmente abaixo.`;
      }
    }
  });

  // ---- 2. Preenchimento Manual ----
  document.getElementById("form-local-manual")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.target));
    storageService.setPreference("localizacao", dados);
    if (locationDisplay) {
      locationDisplay.innerHTML = `<p>📍 ${dados.bairro ? dados.bairro + ", " : ""}${dados.municipio} - ${dados.estado}</p>`;
    }
    if (statusEl) statusEl.textContent = "Localização manual salva.";
    if (btnBuscar) btnBuscar.disabled = false;
  });

  // ---- 3. Avançar para a segunda etapa ----
  btnBuscar?.addEventListener("click", async () => {
    let pos = storageService.getPreference("posicao");

    if (statusEl) statusEl.textContent = "Buscando mercados e ofertas...";
    btnBuscar.disabled = true;

    try {
      if (pos && pos.latitude && pos.longitude) {
        await marketsService.findNearby(pos.latitude, pos.longitude).catch(() => []);
      }
      router.navigate("/mapa");
    } catch (error) {
      console.warn("Erro ao buscar mercados próximos:", error);
      router.navigate("/mapa");
    } finally {
      btnBuscar.disabled = false;
    }
  });
}   
