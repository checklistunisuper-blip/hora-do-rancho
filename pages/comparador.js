import { offersService } from "../services/offersService.js";
import { marketsService } from "../services/marketsService.js";
import { formatarMoeda } from "../utils/format.js";

export async function render({ produto } = {}) {
  return `
    <section class="screen comparador-screen">
      <header class="page-header">
        <h1>Comparador de preços</h1>
      </header>

      <form id="form-comparar" class="search-form">
        <input type="text" id="input-produto" class="search-input"
          placeholder="Digite o nome do produto" value="${produto || ""}" required />
        <button type="submit" class="btn btn--primary">COMPARAR</button>
      </form>

      <div id="comparador-resultado">
        ${produto ? "" : `<p class="muted">Digite um produto para comparar preços entre os mercados próximos.</p>`}
      </div>
    </section>
  `;
}

export async function afterRender(router, params) {
  const form = document.getElementById("form-comparar");
  const resultadoEl = document.getElementById("comparador-resultado");
  const input = document.getElementById("input-produto");

  async function comparar(nomeProduto) {
    resultadoEl.innerHTML = `<p class="muted">Comparando...</p>`;
    const comparativo = await offersService.compareProduct(nomeProduto);

    if (!comparativo) {
      resultadoEl.innerHTML = `<p class="muted">Nenhuma oferta encontrada para "${nomeProduto}".</p>`;
      return;
    }

    const mercados = {};
    for (const oferta of comparativo.ofertas) {
      if (!mercados[oferta.mercadoId]) {
        mercados[oferta.mercadoId] = await marketsService.getById(oferta.mercadoId);
      }
    }

    resultadoEl.innerHTML = `
      ${comparativo.equivalente ? `<p class="tag-info">Mostrando produtos equivalentes (não foi encontrado o mesmo item em múltiplos mercados)</p>` : ""}

      <div class="comparador-resumo">
        <div class="comparador-resumo__item comparador-resumo__item--good">
          <span class="label">Menor preço</span>
          <strong>${formatarMoeda(comparativo.menorPreco.preco)}</strong>
          <small>${mercados[comparativo.menorPreco.mercadoId]?.nome || ""}</small>
        </div>
        <div class="comparador-resumo__item">
          <span class="label">Maior preço</span>
          <strong>${formatarMoeda(comparativo.maiorPreco.preco)}</strong>
          <small>${mercados[comparativo.maiorPreco.mercadoId]?.nome || ""}</small>
        </div>
        <div class="comparador-resumo__item comparador-resumo__item--orange">
          <span class="label">Você economiza</span>
          <strong>${formatarMoeda(comparativo.diferenca)}</strong>
          <small>${comparativo.economiaPercentual}% mais barato</small>
        </div>
      </div>

      <h3 class="section-title">Ranking: do mais barato ao mais caro</h3>
      <ol class="comparador-lista comparador-lista--ranking">
        ${comparativo.ofertas
          .map(
            (o, index) => `
          <li class="comparador-lista__item ${o.mercadoId === comparativo.mercadoRecomendadoId ? "comparador-lista__item--recomendado" : ""}">
            <span class="comparador-lista__posicao">${index + 1}º</span>
            <div class="comparador-lista__info">
              <strong>${mercados[o.mercadoId]?.nome || "Mercado"}</strong>
              <p class="muted">${o.marca || ""} ${o.unidade ? "· " + o.unidade : ""}${o.fonte === "scraped-feed" ? " · preço real" : ""}</p>
            </div>
            <span class="offer-card__price">${formatarMoeda(o.preco)}</span>
          </li>`
          )
          .join("")}
      </ol>
    `;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    router.navigate(`/comparador?produto=${encodeURIComponent(input.value)}`);
    comparar(input.value);
  });

  if (params?.produto) comparar(params.produto);
}
