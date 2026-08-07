/**
 * service-worker.js — cache offline do App Shell (Cache API).
 * Estratégia: cache-first para arquivos estáticos, network-first para
 * chamadas de API (Overpass/Nominatim/Google Maps), com fallback gracioso.
 */

const CACHE_NAME = "hora-do-rancho-v1.0.1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.json",
  "./config/redes.json",
  "./assets/data/scraped-offers.json",
  "./assets/icons/favicon.ico",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/icon-512x512.png",
  "./main.js",
  "./src/config/config.js",
  "./src/utils/router.js",
  "./src/utils/format.js",
  "./src/services/storageService.js",
  "./src/services/geolocationService.js",
  "./src/services/marketsService.js",
  "./src/services/offersService.js",
  "./src/services/favoritesService.js",
  "./src/services/notificationService.js",
  "./src/services/offerProviders/OfferProvider.js",
  "./src/services/offerProviders/MockOfferProvider.js",
  "./src/services/offerProviders/ScrapedFeedProvider.js",
  "./src/models/RanchoListModel.js",
  "./src/components/marketCard.js",
  "./src/components/offerCard.js",
  "./src/components/categoryChip.js",
  "./src/components/bottomNav.js",
  "./src/pages/home.js",
  "./src/pages/mapa.js",
  "./src/pages/ofertas.js",
  "./src/pages/comparador.js",
  "./src/pages/rancho.js",
  "./src/pages/favoritos.js",
  "./src/pages/perfil.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Tratamento tolerante para dados de ofertas JSON em caso de falha de rede ou arquivo vazio
  if (url.pathname.includes("scraped-offers.json")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) throw new Error("Feed indisponível");
          return response;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(JSON.stringify([]), {
                headers: { "Content-Type": "application/json" },
              })
          )
        )
    );
    return;
  }

  // APIs externas (Overpass/Nominatim/Google Maps/Tiles): network-first, cai para o cache se offline
  const isExternalApi =
    url.hostname.includes("overpass") ||
    url.hostname.includes("nominatim") ||
    url.hostname.includes("google.com") ||
    url.hostname.includes("openstreetmap.org") ||
    url.hostname.includes("ui-avatars.com");

  if (isExternalApi) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // App shell: cache-first com fallback para a rede
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Hora do Rancho", {
      body: data.body || "Nova atualização de ofertas.",
      icon: "./assets/icons/icon-192x192.png",
    })
  );
});
