/**
 * main.js — ponto de entrada do HORA DO RANCHO.
 * Inicializa o roteador, registra as páginas, monta a navegação inferior,
 * aplica o tema salvo e registra o Service Worker (offline/PWA).
 */

import { Router } from "./utils/router.js";
import { bottomNav } from "./components/bottomNav.js";
import { storageService } from "./services/storageService.js";

import * as homePage from "./pages/home.js";
import * as mapaPage from "./pages/mapa.js";
import * as ofertasPage from "./pages/ofertas.js";
import * as comparadorPage from "./pages/comparador.js";
import * as ranchoPage from "./pages/rancho.js";
import * as favoritosPage from "./pages/favoritos.js";
import * as perfilPage from "./pages/perfil.js";

// Aplica tema salvo antes de qualquer render (evita flash de tema errado)
const temaSalvo = storageService.getPreference("tema", "claro");
document.documentElement.dataset.theme = temaSalvo;

const outlet = document.getElementById("app-outlet");
const navSlot = document.getElementById("bottom-nav-slot");

if (navSlot) {
  navSlot.outerHTML = bottomNav();
}

const router = new Router(outlet);

function registerPage(path, pageModule) {
  router.register(path, async (params) => {
    try {
      const html = await pageModule.render(params);
      return {
        html,
        afterRender: () => pageModule.afterRender?.(router, params),
      };
    } catch (err) {
      console.error(`Erro ao renderizar a rota [${path}]:`, err);
      // Retorna uma interface de fallback amigável em vez de travar o app
      return {
        html: `
          <div style="padding: 2rem; text-align: center;">
            <h2>Ops! Algo deu errado.</h2>
            <p>Não foi possível carregar esta tela no momento.</p>
            <button onclick="location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">Tentar Novamente</button>
          </div>
        `,
        afterRender: () => {},
      };
    }
  });
}

registerPage("/", homePage);
registerPage("/mapa", mapaPage);
registerPage("/ofertas", ofertasPage);
registerPage("/comparador", comparadorPage);
registerPage("/rancho", ranchoPage);
registerPage("/favoritos", favoritosPage);
registerPage("/perfil", perfilPage);

// ---- Função para remover a Splash Screen com segurança ----
function dismissSplash() {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.style.opacity = "0";
    splash.style.transition = "opacity 0.4s ease";
    setTimeout(() => splash.remove(), 400);
  }
}

// Inicia o roteador e esconde a splash assim que carregar
(async () => {
  try {
    await router.start();
  } catch (err) {
    console.error("Erro no router.start():", err);
  } finally {
    // Remove a splash screen independentemente de ter dado erro ou sucesso
    dismissSplash();
  }
})();

// Timeout de segurança: força a remoção da splash após 3s se por algum motivo travar
setTimeout(dismissSplash, 3000);

// ---- Service Worker (funcionamento offline/PWA) ----
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js?v=1.0.1")
      .then((registration) => {
        console.log("[PWA] Service Worker registrado:", registration.scope);

        // Detecta novas versões publicadas no servidor
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] Nova versão instalada. Recarregando página...");
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn("[PWA] Falha ao registrar Service Worker:", err);
      });
  });
}
