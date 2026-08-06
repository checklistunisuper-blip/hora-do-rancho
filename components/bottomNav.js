const ITEMS = [
  { route: "/", icon: "🏠", label: "Início" },
  { route: "/mapa", icon: "🗺️", label: "Mapa" },
  { route: "/rancho", icon: "🛒", label: "Rancho" },
  { route: "/favoritos", icon: "❤️", label: "Favoritos" },
  { route: "/perfil", icon: "👤", label: "Perfil" },
];

export function bottomNav() {
  return `
    <nav class="bottom-nav" aria-label="Navegação principal">
      ${ITEMS.map(
        (item) => `
        <a href="#${item.route}" class="bottom-nav__item" data-route="${item.route}">
          <span class="bottom-nav__icon">${item.icon}</span>
          <span class="bottom-nav__label">${item.label}</span>
        </a>`
      ).join("")}
    </nav>
  `;
}
