export function categoryChip(categoria, { active = false } = {}) {
  return `
    <button class="chip ${active ? "chip--active" : ""}" data-category-id="${categoria.id}">
      <span class="chip__icon">${categoria.icon}</span>
      <span>${categoria.label}</span>
    </button>
  `;
}

export function categoryChipList(categorias, activeId = null) {
  return `
    <div class="chip-list" role="list">
      ${categorias.map((c) => categoryChip(c, { active: c.id === activeId })).join("")}
    </div>
  `;
}
