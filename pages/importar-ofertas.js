import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/storageService.js";
// Se o encarteParser.js usar export default, remova as chaves de { parseEncarteTexto }:
import parseEncarteTexto from "../src/utils/encarteParser.js";
import { formatarMoeda } from "../utils/format.js";

export async function render() {
  return `
    <section class="screen importar-screen">
      <header class="page-header">
        <h1>Importar Ofertas por Texto</h1>
        <p class="muted">
          Cole aqui a lista ou encarte em texto recebido por WhatsApp/site do mercado.
          O sistema identifica produtos e preços para alimentar o comparador.
        </p>
      </header>

      <div class="card">
        <label for="importar-mercado-nome">Nome do mercado</label>
        <input type="text" id="importar-mercado-nome" placeholder="Ex: Asun Cavalhada, Unisuper Centro..." required />

        <label for="importar-texto">Cole o texto do encarte aqui</label>
        <textarea id="importar-texto" rows="8" placeholder="Ex: Arroz Tio João 5kg R$ 19,90&#10;Feijão Carioca 1kg R$ 7,49"></textarea>

        <button id="btn-processar-texto" class="btn btn--primary btn--block btn--large" style="margin-top: 1rem;">
          ⚡ PROCESSAR OFERTAS
        </button>
      </div>

      <div id="importar-resultados-container"></div>
    </section>
  `;
}

export async function afterRender(router) {
  const btnProcessar = document.getElementById("btn-processar-texto");
  const textoInput = document.getElementById("importar-texto");
  const mercadoInput = document.getElementById("importar-mercado-nome");
  const resultadosContainer = document.getElementById("importar-resultados-container");

  let ofertasProcessadas = [];

  btnProcessar.addEventListener("click", () => {
    const texto = textoInput.value.trim();
    const mercadoNome = mercadoInput.value.trim();

    if (!mercadoNome) {
      alert("Por favor, preencha o nome do mercado.");
      mercadoInput.focus();
      return;
    }

    if (!texto) {
      alert("Cole o texto do encarte antes de processar.");
      textoInput.focus();
      return;
    }

    const encontradas = typeof parseEncarteTexto === "function" 
      ? parseEncarteTexto(texto) 
      : (parseEncarteTexto.parseEncarteTexto ? parseEncarteTexto.parseEncarteTexto(texto) : []);

    let idCounter = 0;
    ofertasProcessadas = encontradas.map((item) => ({
      id: `txt-${Date.now()}-${idCounter++}`,
      nome: item.nome,
      preco: item.preco,
      unidade: item.unidade || null,
      incluir: true,
    }));

    renderResultados(mercadoNome);
  });

  function renderResultados(mercadoNome) {
    if (!ofertasProcessadas.length) {
      resultadosContainer.innerHTML = `
        <div class="card" style="margin-top: 1rem;">
          <p class="muted">Nenhuma oferta com preço foi identificada no texto colado.</p>
        </div>
      `;
      return;
    }

    resultadosContainer.innerHTML = `
      <div class="card" style="margin-top: 1rem;">
        <h3 class="section-title">Confira os itens encontrados (${ofertasProcessadas.length})</h3>
        <ul class="ocr-lista">
          ${ofertasProcessadas
            .map(
              (item) => `
            <li class="ocr-lista__item" data-id="${item.id}">
              <input type="checkbox" class="ocr-item-check" ${item.incluir ? "checked" : ""} />
              <div class="ocr-lista__campos">
                <input type="text" class="ocr-item-nome" value="${item.nome}" />
                <div class="ocr-lista__linha2">
                  <input type="number" class="ocr-item-preco" step="0.01" min="0" value="${item.preco}" />
                </div>
              </div>
              <button class="icon-btn ocr-item-remover" aria-label="Remover">🗑️</button>
            </li>`
            )
            .join("")}
        </ul>
        <button id="btn-salvar-texto-ofertas" class="btn btn--primary btn--block btn--large" style="margin-top: 1rem;">
          💾 SALVAR OFERTAS
        </button>
        <div id="salvar-status" class="status-message" role="status"></div>
      </div>
    `;

    resultadosContainer.querySelectorAll(".ocr-lista__item").forEach((li) => {
      const id = li.dataset.id;
      const item = ofertasProcessadas.find((o) => o.id === id);

      li.querySelector(".ocr-item-check").addEventListener("change", (e) => {
        item.incluir = e.target.checked;
      });
      li.querySelector(".ocr-item-nome").addEventListener("input", (e) => {
        item.nome = e.target.value;
      });
      li.querySelector(".ocr-item-preco").addEventListener("input", (e) => {
        item.preco = Number(e.target.value);
      });
      li.querySelector(".ocr-item-remover").addEventListener("click", () => {
        ofertasProcessadas = ofertasProcessadas.filter((o) => o.id !== id);
        renderResultados(mercadoNome);
      });
    });

    document.getElementById("btn-salvar-texto-ofertas").addEventListener("click", () => salvarOfertas(mercadoNome));
  }

  async function salvarOfertas(mercadoNome) {
    const selecionadas = ofertasProcessadas.filter((o) => o.incluir && o.nome.trim() && o.preco > 0);
    const salvarStatusEl = document.getElementById("salvar-status");

    if (!selecionadas.length) {
      if (salvarStatusEl) salvarStatusEl.textContent = "Nenhuma oferta válida marcada para salvar.";
      return;
    }

    const ofertasExistentes = storageService.getPreference("ofertas_importadas", []);
    const novasOfertas = selecionadas.map((item) => ({
      nome: item.nome.trim(),
      preco: item.preco,
      unidade: item.unidade,
      mercadoNome,
    }));

    const mapaUnificado = new Map();
    [...ofertasExistentes, ...novasOfertas].forEach((item) => {
      const chave = `${item.nome.toLowerCase().trim()}_${Number(item.preco)}`;
      if (!mapaUnificado.has(chave)) {
        mapaUnificado.set(chave, item);
      }
    });

    const ofertasAtualizadas = Array.from(mapaUnificado.values());
    storageService.savePreference("ofertas_importadas", ofertasAtualizadas);

    if (salvarStatusEl) {
      salvarStatusEl.innerHTML = `✅ ${selecionadas.length} oferta(s) salva(s) com sucesso! Redirecionando...`;
    }

    setTimeout(() => {
      if (router && typeof router.navigate === "function") {
        router.navigate("/comparador");
      } else {
        window.location.hash = "#/comparador";
      }
    }, 1200);
  }
}
