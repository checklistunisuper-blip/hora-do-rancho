/**
 * Renderiza um chip individual de categoria.
 * @param {Object} categoria - Objeto contendo id, label e icon.
 * @param {Object} options - Opções de estado (ex: active).
 */
export function categoryChip(categoria, { active = false } = {}) {
  const icon = categoria.icon || "🏷️";
  const label = categoria.label || categoria.nome || "Categoria";

  return `
    <button 
      class="chip ${active ? "chip--active" : ""}" 
      data-category-id="${categoria.id}"
      aria-pressed="${active}"
      type="button"
    >
      <span class="chip__icon" aria-hidden="true">${icon}</span>
      <span class="chip__label">${label}</span>
    </button>
  `;
}

/**
 * Renderiza a lista horizontal de chips de categorias.
 * @param {Array} categorias - Lista de categorias.
 * @param {string|number|null} activeId - ID da categoria atualmente selecionada.
 */
export function categoryChipList(categorias = [], activeId = null) {
  if (!categorias.length) {
    return `<div class="chip-list chip-list--empty"></div>`;
  }

  return `
    <div class="chip-list" role="group" aria-label="Filtrar por categoria">
      ${categorias
        .map((c) => categoryChip(c, { active: String(c.id) === String(activeId) }))
        .join("")}
    </div>
  `;
}
