import { APP_CONFIG } from "../config/config.js";
import { marketsService } from "../services/marketsService.js";
import { offersService } from "../services/offersService.js";
import { favoritesService } from "../services/favoritesService.js";
import { offerCard } from "../components/offerCard.js";
import { categoryChipList } from "../components/categoryChip.js";
import { debounce } from "../utils/format.js";

export async function render({ mercadoId } = {}) {
  return `
    <section class="screen ofertas-screen">
      <header class="page-header">
        <h1 id="ofertas-titulo">Ofertas</h1>
      </header>

      <input type="search" id="busca-produto" class="search-input"
        placeholder="Buscar produto, marca ou categoria..." />

      <div id="categorias-container">${categoryChipList(APP_CONFIG.categories)}</div>

      <div id="ofertas-list" class="offers-list" data-mercado-id="${mercadoId || ""}">
        <p class="muted">Carregando ofertas...</p>
      </div>
    </section>
  `;
}

export async function afterRender(router, params) {
  const listEl = document.getElementById("ofertas-list");
  const tituloEl = document.getElementById("ofertas-titulo");
  const buscaEl = document.getElementById("busca-produto");
  const categoriasEl = document.getElementById("categorias-container");
  let categoriaAtiva = null;

  const mercado = params?.mercadoId ? await marketsService.getById(params.mercadoId) : null;
  tituloEl.textContent = mercado ? `Ofertas em ${mercado.nome}` : "Ofertas próximas";

  const allMarkets = await import("../services/storageService.js").then((m) =>
    m.storageService.getAll(APP_CONFIG.db.stores.markets)
  );
  const marketsParaBuscar = mercado ? [mercado] : allMarkets;
  const marketsById = Object.fromEntries(allMarkets.map((m) => [m.id, m]));

  async function renderLista(ofertas) {
    if (!ofertas.length) {
      listEl.innerHTML = `<p class="muted">Nenhuma oferta encontrada.</p>`;
      return;
    }
    const favs = await favoritesService.getAll("produto");
    const favNames = new Set(favs.map((f) => f.refId));
    listEl.innerHTML = ofertas
      .map((o) =>
        offerCard(o, {
          mercadoNome: marketsById[o.mercadoId]?.nome || "",
          isFavorite: favNames.has(o.nome),
        })
      )
      .join("");
  }

  listEl.innerHTML = `<p class="muted">Carregando ofertas...</p>`;
  let ofertas = await offersService.fetchAllOffers(marketsParaBuscar);
  ofertas.sort((a, b) => a.preco - b.preco);
  await renderLista(ofertas);

  const idsParaBuscar = marketsParaBuscar.map((m) => m.id);

  categoriasEl.addEventListener("click", async (e) => {
    const chip = e.target.closest("[data-category-id]");
    if (!chip) return;
    categoriaAtiva = categoriaAtiva === chip.dataset.categoryId ? null : chip.dataset.categoryId;
    categoriasEl.innerHTML = categoryChipList(APP_CONFIG.categories, categoriaAtiva);

    const filtradas = categoriaAtiva
      ? ofertas.filter((o) => o.categoria === categoriaAtiva).sort((a, b) => a.preco - b.preco)
      : ofertas;
    await renderLista(filtradas);
  });

  const buscar = debounce(async (termo) => {
    if (!termo) {
      await renderLista(ofertas);
      return;
    }
    const resultado = await offersService.search(termo);
    await renderLista(resultado.filter((o) => idsParaBuscar.includes(o.mercadoId)));
  }, 300);

  buscaEl.addEventListener("input", (e) => buscar(e.target.value));

  listEl.addEventListener("click", async (e) => {
    const favBtn = e.target.closest(".favorite-toggle");
    if (!favBtn) return;
    const isFav = await favoritesService.toggle("produto", favBtn.dataset.refId);
    favBtn.textContent = isFav ? "❤️" : "🤍";
    favBtn.setAttribute("aria-pressed", isFav);
  });
}
