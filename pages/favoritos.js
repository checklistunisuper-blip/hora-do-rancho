import { favoritesService } from "../services/favoritesService.js";

export async function render() {
  return `
    <section class="screen favoritos-screen">
      <header class="page-header"><h1>Favoritos</h1></header>
      <div id="favoritos-tabs" class="chip-list">
        <button class="chip chip--active" data-tipo="mercado">Mercados</button>
        <button class="chip" data-tipo="produto">Produtos</button>
        <button class="chip" data-tipo="categoria">Categorias</button>
      </div>
      <div id="favoritos-list"></div>
    </section>
  `;
}

export async function afterRender() {
  const tabsEl = document.getElementById("favoritos-tabs");
  const listEl = document.getElementById("favoritos-list");

  async function renderTipo(tipo) {
    const itens = await favoritesService.getAll(tipo);
    if (!itens.length) {
      listEl.innerHTML = `<p class="muted">Nenhum favorito nessa categoria ainda.</p>`;
      return;
    }
    listEl.innerHTML = `
      <ul class="favoritos-lista">
        ${itens
          .map(
            (f) => `
          <li class="favoritos-lista__item">
            <span>${f.nome || f.refId}</span>
            <button class="icon-btn" data-remover="${tipo}:${f.refId}">🗑️</button>
          </li>`
          )
          .join("")}
      </ul>
    `;
  }

  tabsEl.addEventListener("click", async (e) => {
    const chip = e.target.closest("[data-tipo]");
    if (!chip) return;
    tabsEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip--active"));
    chip.classList.add("chip--active");
    await renderTipo(chip.dataset.tipo);
  });

  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-remover]");
    if (!btn) return;
    const [tipo, refId] = btn.dataset.remover.split(":");
    await favoritesService.remove(tipo, refId);
    await renderTipo(tipo);
  });

  await renderTipo("mercado");
}
