
/**
 * router.js — roteador SPA minimalista baseado em hash (#/rota).
 * Sem dependências externas, compatível com GitHub Pages.
 */

export class Router {
  constructor(outletEl) {
    this.outlet = outletEl;
    this.routes = new Map();
    this.notFound = () => "<p>Página não encontrada.</p>";
    window.addEventListener("hashchange", () => this.render());
  }

  register(path, renderFn) {
    this.routes.set(path, renderFn);
    return this;
  }

  navigate(path) {
    window.location.hash = path;
  }

  currentPath() {
    return window.location.hash.replace(/^#/, "") || "/";
  }

  async render() {
    const path = this.currentPath();
    const [basePath, queryString] = path.split("?");
    const params = Object.fromEntries(new URLSearchParams(queryString || ""));
    const renderFn = this.routes.get(basePath) || this.notFound;

    this.outlet.classList.add("page-transition");
    const result = await renderFn(params);
    const html = typeof result === "string" ? result : result.html;

    this.outlet.innerHTML = html;
    requestAnimationFrame(() => this.outlet.classList.remove("page-transition"));

    // Só liga os eventos da página DEPOIS do HTML estar de fato no DOM.
    if (result && typeof result.afterRender === "function") {
      result.afterRender();
    }

    document.querySelectorAll(".bottom-nav__item").forEach((el) => {
      el.classList.toggle("active", el.dataset.route === basePath);
    });

    window.scrollTo(0, 0);
  }

  start() {
    if (!window.location.hash) window.location.hash = "/";
    this.render();
  }
}
