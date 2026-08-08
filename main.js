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
import * as importarOfertasPage from "./pages/importar-ofertas.js";
import * as comparadorPage from "./pages/comparador.js";
import * as comparadorFotosPage from "./pages/comparador-fotos.js";
import * as ranchoPage from "./pages/rancho.js";
import * as favoritosPage from "./pages/favoritos.js";
import * as perfilPage from "./pages/perfil.js";

// Aplica tema salvo antes de qualquer render (evita flash de tema errado)
const temaSalvo = storageService.getPreference("tema", "claro");
document.documentElement.dataset.theme = temaSalvo;

const outlet = document.getElementById("app-outlet");
document.getElementById("bottom-nav-slot").outerHTML = bottomNav();

const router = new Router(outlet);

function registerPage(path, pageModule) {
  router.register(path, async (params) => {
    const html = await pageModule.render(params);
    return {
      html,
      afterRender: () => pageModule.afterRender?.(router, params),
    };
  });
}

registerPage("/", homePage);
registerPage("/mapa", mapaPage);
registerPage("/ofertas", ofertasPage);
registerPage("/importar-ofertas", importarOfertasPage);
registerPage("/comparador", comparadorPage);
registerPage("/comparador-fotos", comparadorFotosPage);
registerPage("/rancho", ranchoPage);
registerPage("/favoritos", favoritosPage);
registerPage("/perfil", perfilPage);

router.start();

// ---- Splash screen: remove do DOM após a animação ----
const splash = document.getElementById("splash");
if (splash) {
  setTimeout(() => splash.remove(), 2600);
}

// ---- Service Worker (funcionamento offline) ----
// Registrado imediatamente (sem esperar o load completo da página) para
// ferramentas de auditoria como o PWABuilder/Lighthouse conseguirem
// detectá-lo mesmo com recursos externos (mapa) ainda carregando.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch((err) => {
    console.warn("Falha ao registrar Service Worker:", err);
  });
}
