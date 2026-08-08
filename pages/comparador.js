import { offersService } from "../services/offersService.js";
import { marketsService } from "../services/marketsService.js";
import { storageService } from "../services/storageService.js";
import { formatarMoeda } from "../utils/format.js";

export async function render({ produto } = {}) {
  return `
    <section class="screen comparador-screen">
      <header class="page-header">
        <h1>Comparador de preços</h1>
      </header>

      <!-- Painel de Ofertas Importadas (Encarte em PDF) -->
      <div id="container-ofertas-importadas"></div>

      <form id="form-comparar" class="search-form">
        <input type="text" id="input-produto" class="search-input"
          placeholder="Digite o nome do produto" value="${produto || ""}" required />
        <button type="submit" class="btn btn--primary">COMPARAR</button>
      </form>

      <div style="display: flex; gap: 8px; margin-bottom: 14px;">
        <a href="#/comparador-fotos" class="btn btn--outline" style="flex: 1; text-align: center;">
          📷 Fotos de encarte
        </a>
        <a href="#/importar-ofertas" class="btn btn--outline" style="flex: 1; text-align: center;">
          📄 Importar PDF
        </a>
      </div>

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

  // 1. Carrega e exibe as ofertas salvas do encarte PDF
  carregarOfertasImportadas(router);

  async function comparar(nomeProduto) {
    resultadoEl.innerHTML = `<p class="muted">Comparando...</p>`;
    const comparativo = await offersService.compareProduct(nomeProduto);

    if (!comparativo) {
      resultadoEl.innerHTML = `<p class="muted">Nenhuma oferta encontrada para "${nomeProduto}".</p>`;
      return;
    }

    const mercados = {};
    for (const oferta of comparativo.ofertas) {
      if (oferta.mercadoId && !mercados[oferta.mercadoId]) {
        mercados[oferta.mercadoId] = await marketsService.getById(oferta.mercadoId);
      }
    }

    function nomeDoMercado(oferta) {
      return mercados[oferta.mercadoId]?.nome || oferta.mercadoNome || "Mercado";
    }

    resultadoEl.innerHTML = `
      ${comparativo.equivalente ? `<p class="tag-info">Mostrando produtos equivalentes (não foi encontrado o mesmo item em múltiplos mercados)</p>` : ""}

      <div class="comparador-resumo">
        <div class="comparador-resumo__item comparador-resumo__item--good">
          <span class="label">Menor preço</span>
          <strong>${formatarMoeda(comparativo.menorPreco.preco)}</strong>
          <small>${nomeDoMercado(comparativo.menorPreco)}</small>
        </div>
        <div class="comparador-resumo__item">
          <span class="label">Maior preço</span>
          <strong>${formatarMoeda(comparativo.maiorPreco.preco)}</strong>
          <small>${nomeDoMercado(comparativo.maiorPreco)}</small>
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
          .map((o, index) => {
            const fonteTexto =
              o.fonte === "scraped-feed"
                ? " · preço real"
                : o.fonte === "gemini-web"
                ? " · encontrado na web"
                : o.fonte === "foto-manual" || o.fonte === "foto-compartilhada"
                ? " · via foto"
                : o.fonte === "pdf-importado"
                ? " · via PDF"
                : "";
            return `
          <li class="comparador-lista__item ${o.id === comparativo.menorPreco.id ? "comparador-lista__item--recomendado" : ""}">
            <span class="comparador-lista__posicao">${index + 1}º</span>
            <div class="comparador-lista__info">
              <strong>${nomeDoMercado(o)}</strong>
              <p class="muted">${o.marca || ""} ${o.unidade ? "· " + o.unidade : ""}${fonteTexto}</p>
            </div>
            <span class="offer-card__price">${formatarMoeda(o.preco)}</span>
          </li>`;
          })
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

/**
 * Gerencia a renderização e interatividade das ofertas salvas do encarte PDF
 */
function carregarOfertasImportadas(router) {
  const container = document.getElementById("container-ofertas-importadas");
  if (!container) return;

  const ofertas = storageService.getPreference("ofertas_importadas", []);

  if (!ofertas || ofertas.length === 0) {
    container.innerHTML = "";
    return;
  }

  const htmlItens = ofertas
    .map(
      (item, index) => `
    <div class="card-item-importado" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #e0e0e0; background: #fff;">
      <div style="cursor: pointer; flex: 1;" class="item-clicavel" data-nome="${item.nome}">
        <strong style="display: block; font-size: 0.95rem;">${item.nome}</strong>
        ${item.unidade ? `<small class="muted">Embalagem: ${item.unidade}</small>` : ""}
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-weight: bold; color: var(--primary-color, #2e7d32); font-size: 1.05rem;">
          ${formatarMoeda(item.preco)}
        </span>
        <button class="btn-remover-item" data-index="${index}" style="background: none; border: none; cursor: pointer; color: #d32f2f; font-size: 1rem;" title="Remover item">✕</button>
      </div>
    </div>
  `
    )
    .join("");

  container.innerHTML = `
    <div class="painel-importados" style="background: #e8f5e9; border: 1px solid #c8e6c9; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h3 style="margin: 0; color: #2e7d32; font-size: 1rem;">📑 Ofertas Importadas do Encarte (${ofertas.length})</h3>
        <button id="btn-limpar-importados" class="btn btn--text" style="color: #c62828; font-size: 0.8rem; padding: 0;">Limpar tudo</button>
      </div>
      <p class="muted" style="font-size: 0.8rem; margin-bottom: 8px;">Toque em um produto abaixo para buscar concorrência na rede.</p>

      <div class="lista-importados-scroll" style="max-height: 220px; overflow-y: auto; border-radius: 6px; border: 1px solid #c8e6c9;">
        ${htmlItens}
      </div>
    </div>
  `;

  // Clique em "Limpar tudo"
  document.getElementById("btn-limpar-importados")?.addEventListener("click", () => {
    if (confirm("Deseja remover todas as ofertas importadas?")) {
      storageService.savePreference("ofertas_importadas", []);
      carregarOfertasImportadas(router);
    }
  });

  // Clique no "✕" para remover um item específico
  container.querySelectorAll(".btn-remover-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute("data-index"), 10);
      ofertas.splice(idx, 1);
      storageService.savePreference("ofertas_importadas", ofertas);
      carregarOfertasImportadas(router);
    });
  });

  // Clique no nome do produto para acionar a busca no formulário automaticamente
  container.querySelectorAll(".item-clicavel").forEach((el) => {
    el.addEventListener("click", (e) => {
      const nome = e.currentTarget.getAttribute("data-nome");
      const input = document.getElementById("input-produto");
      if (input && nome) {
        input.value = nome;
        router.navigate(`/comparador?produto=${encodeURIComponent(nome)}`);
      }
    });
  });
}
