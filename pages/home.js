import { APP_CONFIG } from "../config/config.js";
import { geolocationService } from "../services/geolocationService.js";
import { marketsService } from "../services/marketsService.js";
import { storageService } from "../services/storageService.js";

export async function render() {
  const localSalvo = storageService.getPreference("localizacao");

  return `
    <section class="screen home-screen">
      <header class="home-hero">
        <img src="./assets/icons/icon-96x96.png" alt="Hora do Rancho" class="home-hero__logo" />
        <h1 class="home-hero__title">HORA DO RANCHO</h1>
        <p class="home-hero__slogan">${APP_CONFIG.slogan}</p>
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

      <button id="btn-buscar-ofertas" class="btn btn--primary btn--block btn--large" disabled>
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
  const localSalvo = storageService.getPreference("localizacao");
  const posSalva = storageService.getPreference("posicao");

  if (localSalvo && posSalva) btnBuscar.disabled = false;

  document.getElementById("btn-detectar-local").addEventListener("click", async () => {
    statusEl.textContent = "Obtendo sua localização...";
    try {
      const pos = await geolocationService.getCurrentPosition();
      storageService.setPreference("posicao", pos);

      statusEl.textContent = "Identificando estado, município e bairro...";
      const endereco = await geolocationService.reverseGeocode(pos.latitude, pos.longitude);
      storageService.setPreference("localizacao", endereco);

      locationDisplay.innerHTML = `<p>📍 ${endereco.bairro ? endereco.bairro + ", " : ""}${endereco.municipio} - ${endereco.estado}</p>`;
      statusEl.textContent = "Localização detectada com sucesso!";
      btnBuscar.disabled = false;
    } catch (error) {
      statusEl.textContent = `Não foi possível obter sua localização: ${error.message}. Você pode informar manualmente abaixo.`;
    }
  });

  document.getElementById("form-local-manual").addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(e.target));
    storageService.setPreference("localizacao", dados);
    locationDisplay.innerHTML = `<p>📍 ${dados.bairro ? dados.bairro + ", " : ""}${dados.municipio} - ${dados.estado}</p>`;
    statusEl.textContent = "Localização manual salva.";
    // Sem coordenadas exatas, mantemos possível posição anterior ou pedimos detecção para o mapa funcionar.
  });

  btnBuscar.addEventListener("click", async () => {
    const pos = storageService.getPreference("posicao");
    if (!pos) {
      statusEl.textContent = "Para buscar ofertas com mapa, detecte sua localização por GPS.";
      return;
    }
    statusEl.textContent = "Buscando mercados próximos...";
    btnBuscar.disabled = true;
    try {
      await marketsService.findNearby(pos.latitude, pos.longitude);
      router.navigate("/mapa");
    } catch (error) {
      statusEl.textContent = `Erro ao buscar mercados: ${error.message}`;
    } finally {
      btnBuscar.disabled = false;
    }
  });
}
