/**
 * service-worker.js — cache offline do App Shell (Cache API).
 * Estratégia: cache-first para arquivos estáticos, network-first para
 * chamadas de API (Overpass/Nominatim), com fallback para o cache.
 */

const CACHE_NAME = "hora-do-rancho-v2";

const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./manifest.json",
  "./config/config.js",
  "./utils/router.js",
  "./utils/format.js",
  "./services/storageService.js",
  "./services/geolocationService.js",
  "./services/marketsService.js",
  "./services/offersService.js",
  "./services/favoritesService.js",
  "./services/notificationService.js",
  "./services/offerProviders/OfferProvider.js",
  "./services/offerProviders/MockOfferProvider.js",
  "./services/offerProviders/ScrapedFeedProvider.js",
  "./models/RanchoListModel.js",
  "./components/marketCard.js",
  "./components/offerCard.js",
  "./components/categoryChip.js",
  "./components/bottomNav.js",
  "./pages/home.js",
  "./pages/mapa.js",
  "./pages/ofertas.js",
  "./pages/comparador.js",
  "./pages/rancho.js",
  "./pages/favoritos.js",
  "./pages/perfil.js",
  "./assets/data/mock-offers.json",
  "./assets/data/scraped-offers.json",
  "./config/redes.json",
  "./assets/icons/icon-192x192.png",
  "./assets/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // APIs externas (Overpass/Nominatim/tiles): network-first, cai pro cache se offline
  const isExternalApi =
    url.hostname.includes("overpass-api.de") ||
    url.hostname.includes("nominatim.openstreetmap.org") ||
    url.hostname.includes("tile.openstreetmap.org");

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

  // App shell: cache-first
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
