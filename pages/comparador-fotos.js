import { APP_CONFIG } from "../config/config.js";
import { storageService } from "../services/offerProviders/storageService.js";
import { parseOfertasDoTexto, detectarCategoria } from "../utils/ocrParser.js";
import { formatarMoeda, categoriaLabel } from "../utils/format.js";
import { categoryChipList } from "../components/categoryChip.js";

export async function render() {
  return `
    <section class="screen fotos-screen">
      <header class="page-header">
        <h1>Comparador por Foto</h1>
        <p class="muted">
          Tire um print da oferta no site/app/encarte do mercado, anexe aqui e o app lê
          os produtos e preços automaticamente. Depois é só conferir e salvar — funciona
          com QUALQUER mercado, mesmo sem loja online.
        </p>
      </header>

      <div class="card">
        <label for="foto-mercado-nome">Nome do mercado</label>
        <input type="text" id="foto-mercado-nome" placeholder="Ex: Asun Cavalhada, Unisuper Centro..." required />

        <label for="foto-input">Prints das ofertas (pode escolher vários de uma vez)</label>
        <input type="file" id="foto-input" accept="image/*" multiple capture="environment" />

        <div id="foto-thumbs" class="foto-thumbs"></div>

        <button id="btn-ler-ofertas" class="btn btn--primary btn--block btn--large" disabled>
          🔎 LER OFERTAS DAS FOTOS
        </button>
        <div id="ocr-progresso" class="status-message" role="status"></div>
      </div>

      <div id="ocr-resultados-container"></div>
    </section>
  `;
}

export async function afterRender(router) {
  const fotoInput = document.getElementById("foto-input");
  const thumbsEl = document.getElementById("foto-thumbs");
  const btnLer = document.getElementById("btn-ler-ofertas");
  const progressoEl = document.getElementById("ocr-progresso");
  const resultadosContainer = document.getElementById("ocr-resultados-container");
  const mercadoNomeInput = document.getElementById("foto-mercado-nome");

  let arquivosSelecionados = [];
  let ofertasLidas = []; // { id, nome, preco, categoria, incluir }
  let mapaCategoria = {};

  try {
    const response = await fetch("./config/redes.json");
    const config = await response.json();
    mapaCategoria = config.mapaCategoriaPorPalavraChave || {};
  } catch {
    mapaCategoria = {};
  }

  fotoInput.addEventListener("change", () => {
    arquivosSelecionados = Array.from(fotoInput.files || []);
    thumbsEl.innerHTML = arquivosSelecionados
      .map((file) => `<img src="${URL.createObjectURL(file)}" alt="${file.name}" class="foto-thumb" />`)
      .join("");
    btnLer.disabled = arquivosSelecionados.length === 0;
  });

  btnLer.addEventListener("click", async () => {
    if (!window.Tesseract) {
      progressoEl.textContent = "Ferramenta de leitura ainda carregando, tenta de novo em alguns segundos.";
      return;
    }
    if (!mercadoNomeInput.value.trim()) {
      progressoEl.textContent = "Preenche o nome do mercado antes de ler as fotos.";
      mercadoNomeInput.focus();
      return;
    }

    btnLer.disabled = true;
    ofertasLidas = [];
    let idCounter = 0;

    for (let i = 0; i < arquivosSelecionados.length; i++) {
      progressoEl.textContent = `Lendo foto ${i + 1} de ${arquivosSelecionados.length}...`;
      try {
        const resultado = await window.Tesseract.recognize(arquivosSelecionados[i], "por");
        const texto = resultado?.data?.text || "";
        const encontradas = parseOfertasDoTexto(texto);

        encontradas.forEach((item) => {
          ofertasLidas.push({
            id: `ocr-${Date.now()}-${idCounter++}`,
            nome: item.nome,
            preco: item.preco,
            categoria: detectarCategoria(item.nome, mapaCategoria),
            incluir: true,
          });
        });
      } catch (error) {
        console.warn("Erro no OCR da foto", i, error);
      }
    }

    progressoEl.textContent = ofertasLidas.length
      ? `${ofertasLidas.length} item(ns) encontrados. Confira e corrija antes de salvar.`
      : "Não consegui reconhecer nenhum produto/preço nas fotos. Tenta uma foto mais nítida, próxima e sem reflexo.";

    renderResultados();
    btnLer.disabled = false;
  });

  function renderResultados() {
    if (!ofertasLidas.length) {
      resultadosContainer.innerHTML = "";
      return;
    }

    resultadosContainer.innerHTML = `
      <h3 class="section-title">Confira antes de salvar</h3>
      <ul class="ocr-lista">
        ${ofertasLidas
          .map(
            (item) => `
          <li class="ocr-lista__item" data-id="${item.id}">
            <input type="checkbox" class="ocr-item-check" ${item.incluir ? "checked" : ""} />
            <div class="ocr-lista__campos">
              <input type="text" class="ocr-item-nome" value="${item.nome}" />
              <div class="ocr-lista__linha2">
                <input type="number" class="ocr-item-preco" step="0.01" min="0" value="${item.preco}" />
                <select class="ocr-item-categoria">
                  ${APP_CONFIG.categories
                    .map(
                      (c) =>
                        `<option value="${c.id}" ${c.id === item.categoria ? "selected" : ""}>${c.icon} ${c.label}</option>`
                    )
                    .join("")}
                </select>
              </div>
            </div>
            <button class="icon-btn ocr-item-remover" aria-label="Remover">🗑️</button>
          </li>`
          )
          .join("")}
      </ul>
      <button id="btn-salvar-ofertas" class="btn btn--primary btn--block btn--large">
        💾 SALVAR ${ofertasLidas.length} OFERTA(S)
      </button>
      <div id="salvar-status" class="status-message" role="status"></div>
    `;

    resultadosContainer.querySelectorAll(".ocr-lista__item").forEach((li) => {
      const id = li.dataset.id;
      const item = ofertasLidas.find((o) => o.id === id);

      li.querySelector(".ocr-item-check").addEventListener("change", (e) => {
        item.incluir = e.target.checked;
      });
      li.querySelector(".ocr-item-nome").addEventListener("input", (e) => {
        item.nome = e.target.value;
      });
      li.querySelector(".ocr-item-preco").addEventListener("input", (e) => {
        item.preco = Number(e.target.value);
      });
      li.querySelector(".ocr-item-categoria").addEventListener("change", (e) => {
        item.categoria = e.target.value;
      });
      li.querySelector(".ocr-item-remover").addEventListener("click", () => {
        ofertasLidas = ofertasLidas.filter((o) => o.id !== id);
        renderResultados();
      });
    });

    document.getElementById("btn-salvar-ofertas").addEventListener("click", salvarOfertas);
  }

  async function salvarOfertas() {
    const selecionadas = ofertasLidas.filter((o) => o.incluir && o.nome.trim() && o.preco > 0);
    const salvarStatusEl = document.getElementById("salvar-status");

    if (!selecionadas.length) {
      if (salvarStatusEl) salvarStatusEl.textContent = "Nenhuma oferta marcada pra salvar.";
      return;
    }

    const mercadoNome = mercadoNomeInput.value.trim();
    const agora = new Date();
    const validade = new Date(agora);
    validade.setDate(validade.getDate() + 7);

    // Estrutura para salvar na store de ofertas (IndexedDB/Storage)
    const ofertasParaSalvar = selecionadas.map((item) => ({
      id: item.id,
      nome: item.nome.trim(),
      marca: null,
      categoria: item.categoria,
      preco: item.preco,
      unidade: null,
      imagem: null,
      mercadoId: null,
      mercadoNome,
      data: agora.toISOString(),
      validade: validade.toISOString(),
      fonte: "foto-manual",
    }));

    // 1. Salva na store principal de ofertas
    try {
      if (APP_CONFIG?.db?.stores?.offers && storageService?.putMany) {
        await storageService.putMany(APP_CONFIG.db.stores.offers, ofertasParaSalvar);
      }
    } catch (e) {
      console.warn("Erro ao salvar na store de ofertas:", e);
    }

    // 2. Integrar e mesclar no repositório 'ofertas_importadas'
    const ofertasImportadasExistentes = storageService.getPreference("ofertas_importadas", []);
    const ofertasParaImportadas = selecionadas.map((item) => ({
      nome: item.nome.trim(),
      preco: item.preco,
      unidade: null,
      mercadoNome,
    }));

    // Evita duplicatas exatas de nome e preço
    const mapaUnificado = new Map();
    [...ofertasImportadasExistentes, ...ofertasParaImportadas].forEach((item) => {
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
