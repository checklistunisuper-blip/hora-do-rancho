import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/storageService.js";
import { marketsService } from "../services/marketsService.js";
import { offersService } from "../services/offersService.js";
import { calcularReserva, montarSugestaoDeCompras } from "../models/RanchoListModel.js";
import { formatarMoeda } from "../utils/format.js";

export async function render() {
  return `
    <section class="screen rancho-screen">
      <header class="page-header">
        <h1>Lista de Rancho</h1>
        <p class="muted">Informe seu orçamento e monte uma lista de compras inteligente.</p>
      </header>

      <form id="form-rancho" class="card rancho-form">
        <label for="valor-disponivel">Valor disponível</label>
        <input type="number" id="valor-disponivel" step="0.01" min="0" placeholder="R$ 1.500,00" required />

        <label>Percentual de reserva</label>
        <div class="chip-list" id="reserva-chips">
          ${APP_CONFIG.budgetReservePercents
            .map(
              (p) => `<button type="button" class="chip" data-percent="${p}">${p}%</button>`
            )
            .join("")}
        </div>

        <button type="submit" class="btn btn--primary btn--block btn--large">MONTAR LISTA</button>
      </form>

      <div id="rancho-resultado"></div>
    </section>
  `;
}

export async function afterRender() {
  const form = document.getElementById("form-rancho");
  const chipsEl = document.getElementById("reserva-chips");
  const resultadoEl = document.getElementById("rancho-resultado");
  let percentualSelecionado = APP_CONFIG.budgetReservePercents[1]; // 10% padrão

  chipsEl.querySelector(`[data-percent="${percentualSelecionado}"]`)?.classList.add("chip--active");

  chipsEl.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-percent]");
    if (!chip) return;
    percentualSelecionado = Number(chip.dataset.percent);
    chipsEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("chip--active"));
    chip.classList.add("chip--active");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valorDisponivel = Number(document.getElementById("valor-disponivel").value);
    if (!valorDisponivel || valorDisponivel <= 0) return;

    resultadoEl.innerHTML = `<p class="muted">Montando sua lista com base nas ofertas próximas...</p>`;

    const reserva = calcularReserva(valorDisponivel, percentualSelecionado);

    const pos = storageService.getPreference("posicao");
    const allMarkets = pos
      ? await marketsService.findNearby(pos.latitude, pos.longitude).catch(() => [])
      : [];
    const marketsById = Object.fromEntries((allMarkets || []).map((m) => [m.id, m]));

    let ofertas = await offersService.getAllCached();
    if (allMarkets.length && !ofertas.length) {
      ofertas = await offersService.fetchAllOffers(allMarkets);
    }

    const sugestao = montarSugestaoDeCompras(ofertas, reserva.valorRestante, marketsById);

    resultadoEl.innerHTML = `
      <div class="card rancho-resumo">
        <div class="rancho-resumo__row">
          <span>Valor disponível</span><strong>${formatarMoeda(reserva.valorDisponivel)}</strong>
        </div>
        <div class="rancho-resumo__row">
          <span>Reserva (${reserva.percentualReserva}%)</span><strong>${formatarMoeda(reserva.valorReservado)}</strong>
        </div>
        <div class="rancho-resumo__row rancho-resumo__row--highlight">
          <span>Disponível para compras</span><strong>${formatarMoeda(reserva.valorRestante)}</strong>
        </div>
      </div>

      <h3 class="section-title">Sugestão de compras (${sugestao.itens.length} itens)</h3>
      ${
        sugestao.itens.length
          ? `
        <ul class="rancho-lista">
          ${sugestao.itens
            .map(
              (item) => `
            <li class="rancho-lista__item">
              <div>
                <strong>${item.produto}</strong>
                <p class="muted">${item.marca || ""} · ${item.mercadoNome}</p>
              </div>
              <div class="rancho-lista__price-col">
                <span class="offer-card__price">${formatarMoeda(item.preco)}</span>
                ${item.economia > 0 ? `<small class="economia-tag">economiza ${formatarMoeda(item.economia)}</small>` : ""}
              </div>
            </li>`
            )
            .join("")}
        </ul>
        <div class="card rancho-total">
          <div class="rancho-resumo__row"><span>Total estimado</span><strong>${formatarMoeda(sugestao.totalEstimado)}</strong></div>
          <div class="rancho-resumo__row"><span>Economia total</span><strong class="economia-tag">${formatarMoeda(sugestao.economiaTotal)}</strong></div>
          <div class="rancho-resumo__row"><span>Sobra do orçamento</span><strong>${formatarMoeda(sugestao.valorRestanteAposCompra)}</strong></div>
        </div>
      `
          : `<p class="muted">Ainda não há ofertas carregadas. Detecte sua localização e busque ofertas na tela inicial primeiro.</p>`
      }
    `;
  });
}
