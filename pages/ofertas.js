/**
 * src/pages/ofertas.js (ou o arquivo correspondente da sua rota de ofertas)
 */
import { marketsService } from "../services/marketsService.js";

export async function render(params) {
  // Pega o ID do mercado dos parâmetros da URL ou do storage
  const marketId = params?.id || new URLSearchParams(window.location.search).get("id");
  const mercado = await marketsService.getById(marketId);

  // Seleciona a lista de ofertas independente do nome da chave
  const listaOfertas = mercado?.ofertas || mercado?.offers || [];

  if (!listaOfertas.length) {
    return `
      <section class="screen">
        <h2>${mercado?.nome || "Mercado"}</h2>
        <p class="muted">Nenhuma oferta disponível no momento para este estabelecimento.</p>
        <a href="#/mapa" class="btn btn--outline">Voltar ao mapa</a>
      </section>
    `;
  }

  return `
    <section class="screen">
      <header class="header-mercado">
        <h2>${mercado.nome}</h2>
        <p>📍 ${mercado.endereco}</p>
      </header>

      <div class="lista-ofertas">
        ${listaOfertas
          .map(
            (item) => `
          <div class="card card-oferta">
            <span class="badge">${item.tag || "Oferta"}</span>
            <h3 class="produto-title">${item.produto || item.nome}</h3>
            <p class="preco-destaque">${item.preco}</p>
          </div>
        `
          )
          .join("")}
      </div>

      <a href="#/mapa" class="btn btn--outline btn--block">Voltar ao mapa</a>
    </section>
  `;
}
