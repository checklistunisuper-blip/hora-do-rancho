/**
 * src/pages/home.js
 * Página inicial (Home) - Seleção e detecção de localização para o Rancho.
 */

import { APP_CONFIG } from "../config/config.js";
import { geolocationService } from "../services/geolocationService.js";
import { marketsService } from "../services/marketsService.js";
import { storageService } from "../services/storageService.js";

export async function render() {
  const localSalvo = storageService?.getPreference ? storageService.getPreference("localizacao") : null;
  const posSalva = storageService?.getPreference ? storageService.getPreference("posicao") : null;
  const temLocalOuPos = Boolean(localSalvo || posSalva);

  const slogan = APP_CONFIG?.slogan || "Economize nas suas compras";

  return `
    <section class="screen home-screen">
      <header class="home-hero">
        <img src="./assets/icons/icon-96x96.png" alt="Hora do Rancho" class="home-hero__logo" />
        <h1 class="home-hero__title">HORA DO RANCHO</h1>
        <p class="home-hero__slogan">${slogan}</p>
      </header>

      <div class="card location-card">
        <h2 class="section-title">Sua localização</h2>
        <div id="location-display" class="location-display">
          ${
            localSalvo
              ? `<p>📍 ${localSalvo.bairro ? localSalvo.bairro + ", " : ""}${localSalvo.municipio || ""} ${localSalvo.estado ? "- " + localSalvo.estado : ""}</p>`
              : `<p class="muted">Localização ainda não detectada.</p>`
          }
        </div>

        <button id="btn-detectar-local" class="btn btn--outline btn--block">
          📡 DETECTAR MINHA LOCALIZAÇÃO
        </button>

        <details class="manual-location">
          <summary>Alterar manualmente</summary>
          <form id="form-local-manual" class="manual-location__form">
            <input type="text" name="estado" placeholder="Estado (ex: RS)" value="${localSalvo?.estado || ""}" required />
            <input type="text" name="municipio" placeholder="Município (ex: Porto Alegre)" value="${localSalvo?.municipio || ""}" required />
            <input type="text" name="bairro" placeholder="Bairro (opcional)" value="${localSalvo?.bairro || ""}" />
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
  const btnDetectar = document.getElementById("btn-detectar-local");
  const formManual = document.getElementById("form-local-manual");

  // 1. Detectar via GPS
  btnDetectar?.addEventListener("click", async () => {
    if (statusEl) statusEl.textContent = "Obtendo sua localização...";
    btnDetectar.disabled = true;

    try {
      const pos = await geolocationService.getCurrentPosition();
      if (storageService?.setPreference) {
        storageService.setPreference("posicao", pos);
      }

      if (statusEl) statusEl.textContent = "Identificando endereço...";
      const endereco = await geolocationService.reverseGeocode(pos.latitude, pos.longitude);
      
      if (storageService?.setPreference) {
        storageService.setPreference("localizacao", endereco);
      }

      if (locationDisplay) {
        const textoBairro = endereco.bairro ? `${endereco.bairro}, ` : "";
        locationDisplay.innerHTML = `<p>📍 ${textoBairro}${endereco.municipio || "Localização atual"} - ${endereco.estado || ""}</p>`;
      }

      if (statusEl) statusEl.textContent = "Localização detectada com sucesso!";
      if (btnBuscar) btnBuscar.disabled = false;
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = `Não foi possível obter GPS: ${error.message || error}. Informe manualmente abaixo.`;
      }
    } finally {
      btnDetectar.disabled = false;
    }
  });

  // 2. Preenchimento Manual
  formManual?.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formManual);
    const dados = Object.fromEntries(formData);

    if (storageService?.setPreference) {
      storageService.setPreference("localizacao", dados);
    }

    if (locationDisplay) {
      const textoBairro = dados.bairro ? `${dados.bairro}, ` : "";
      locationDisplay.innerHTML = `<p>📍 ${textoBairro}${dados.municipio} - ${dados.estado}</p>`;
    }

    if (statusEl) statusEl.textContent = "Localização manual salva com sucesso!";
    if (btnBuscar) btnBuscar.disabled = false;
  });

  // 3. Avançar para a próxima tela
  btnBuscar?.addEventListener("click", async () => {
    const pos = storageService?.getPreference ? storageService.getPreference("posicao") : null;
    
    if (statusEl) statusEl.textContent = "Buscando mercados e ofertas...";
    btnBuscar.disabled = true;

    try {
      // Garante o carregamento/reciclagem das ofertas atualizadas
      if (marketsService?.refresh) {
        await marketsService.refresh();
      }

      if (pos && pos.latitude && pos.longitude && marketsService?.findNearby) {
        await marketsService.findNearby(pos.latitude, pos.longitude).catch(() => []);
      }
      router.navigate("/mapa");
    } catch (error) {
      console.warn("Erro ao carregar ofertas:", error);
      router.navigate("/mapa");
    } finally {
      if (btnBuscar) btnBuscar.disabled = false;
    }
  });
}
