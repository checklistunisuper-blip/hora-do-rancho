/**
 * notificationService.js
 * Notificações locais via Notification API do navegador.
 * Não usa nenhum serviço de push pago — apenas alertas disparados
 * pelo próprio app (ex: ao detectar queda de preço em favoritos).
 */

export const notificationService = {
  async requestPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return Notification.requestPermission();
  },

  async notify(titulo, opcoes = {}) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    if (navigator.serviceWorker?.controller) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification(titulo, {
        icon: "./assets/icons/icon-192x192.png",
        badge: "./assets/icons/icon-96x96.png",
        ...opcoes,
      });
    } else {
      new Notification(titulo, { icon: "./assets/icons/icon-192x192.png", ...opcoes });
    }
  },

  notifyNovaOferta(produto, mercado, preco) {
    return this.notify("Nova oferta encontrada 🛒", {
      body: `${produto} por R$ ${preco.toFixed(2)} em ${mercado}`,
      tag: "nova-oferta",
    });
  },

  notifyQuedaPreco(produto, precoAntigo, precoNovo) {
    return this.notify("Preço caiu 📉", {
      body: `${produto}: de R$ ${precoAntigo.toFixed(2)} por R$ ${precoNovo.toFixed(2)}`,
      tag: "queda-preco",
    });
  },
};
