const ITEMS = [
  { route: "/", icon: "🏠", label: "Início" },
  { route: "/mapa", icon: "🗺️", label: "Mapa" },
  { route: "/rancho", icon: "🛒", label: "Rancho" },
  { route: "/favoritos", icon: "❤️", label: "Favoritos" },
  { route: "/perfil", icon: "👤", label: "Perfil" },
];

/**
 * Obtém a rota atual do hash da URL.
 */
function getCurrentRoute() {
  const hash = window.location.hash.replace("#", "") || "/";
  // Remove parâmetros de busca ou subrotas se necessário
  const baseRoute = hash.split("?")[0];
  return baseRoute || "/";
}

export function bottomNav() {
  const activeRoute = getCurrentRoute();

  return `
    <nav class="bottom-nav" aria-label="Navegação principal">
      ${ITEMS.map((item) => {
        const isActive = activeRoute === item.route;
        return `
          <a href="#${item.route}" 
             class="bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}" 
             data-route="${item.route}"
             aria-current="${isActive ? "page" : "false"}">
            <span class="bottom-nav__icon">${item.icon}</span>
            <span class="bottom-nav__label">${item.label}</span>
          </a>`;
      }).join("")}
    </nav>
  `;
}

/**
 * Atualiza visualmente a aba ativa no DOM sem precisar renderizar a barra inteira novamente.
 */
export function updateActiveBottomNav() {
  const activeRoute = getCurrentRoute();
  const navItems = document.querySelectorAll(".bottom-nav__item");

  navItems.forEach((item) => {
    const route = item.getAttribute("data-route");
    const isActive = route === activeRoute;

    item.classList.toggle("bottom-nav__item--active", isActive);
    item.setAttribute("aria-current", isActive ? "page" : "false");
  });
}

// Ouve mudanças na URL para atualizar a aba ativa
window.addEventListener("hashchange", updateActiveBottomNav);
