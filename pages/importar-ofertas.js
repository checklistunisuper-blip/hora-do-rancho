import { storageService } from "../services/storageService.js";
import { processarTextoEncarte } from "../utils/encarteParser.js";

/**
 * Renderiza o HTML da página de importação
 */
export async function render(params) {
  return `
    <div class="page-transition">
      <div class="page-header">
        <h1>Importar Ofertas</h1>
        <p class="muted">Anexe um encarte em PDF ou cole o link do supermercado para extrair produtos automaticamente.</p>
      </div>

      <div class="painel-ofertas">
        <h2>Escolha o método de importação</h2>

        <!-- Opção 1: Arquivo PDF -->
        <div class="card-opcao">
          <h3>📄 Anexar PDF do Encarte</h3>
          <p>Envie o folheto do supermercado em formato PDF.</p>
          <input type="file" id="pdf-file-input" accept="application/pdf" />
        </div>

        <div class="divisor-ou">OU</div>

        <!-- Opção 2: Link de Supermercado -->
        <div class="card-opcao">
          <h3>🔗 Link do Encarte / Ofertas</h3>
          <p>Cole a URL da página de promoções do mercado.</p>
          <div class="input-grupo">
            <input type="url" id="link-oferta-input" placeholder="https://supermercado.com.br/ofertas" />
            <button id="btn-importar-link" class="btn btn--primary">Processar</button>
          </div>
        </div>

        <!-- Feedback de Carregamento -->
        <div id="status-importacao" class="status-container" style="display: none;">
          <div class="spinner"></div>
          <span id="status-texto">Processando ofertas...</span>
        </div>
      </div>

      <!-- Área de Exibição dos Produtos Extraídos -->
      <div id="resultado-importacao" class="resultado-container"></div>
    </div>
  `;
}

/**
 * Configura os ouvintes de eventos da página após a renderização no DOM
 */
export function afterRender(router, params) {
  const pdfInput = document.getElementById("pdf-file-input");
  const btnLink = document.getElementById("btn-importar-link");
  const linkInput = document.getElementById("link-oferta-input");

  // Evento 1: Leitura de arquivo PDF
  pdfInput?.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo no formato PDF.");
      return;
    }

    mostrarStatus(true, "Lendo páginas do PDF...");

    try {
      // 1. Extrai todo o texto das páginas usando o PDF.js global
      const textoBruto = await extrairTextoComPdfJs(file);

      mostrarStatus(true, "Analisando ofertas e preços...");

      // 2. Filtra produtos e preços com o parser heurístico
      const produtosIdentificados = processarTextoEncarte(textoBruto);

      // 3. Renderiza os resultados na tela
      renderizarProdutos(produtosIdentificados, router);
    } catch (err) {
      console.error("Erro no processamento do PDF:", err);
      alert("Não foi possível ler o PDF. Verifique se o arquivo não está protegido ou corrompido.");
    } finally {
      mostrarStatus(false);
    }
  });

  // Evento 2: Processamento de Link
  btnLink?.addEventListener("click", async () => {
    const url = linkInput?.value.trim();
    if (!url) {
      alert("Por favor, insira uma URL válida.");
      return;
    }

    mostrarStatus(true, "Buscando ofertas do link...");
    try {
      // Integração futura com scraper/API de links
      alert("Recurso de leitura por link em desenvolvimento.");
    } finally {
      mostrarStatus(false);
    }
  });
}

/**
 * Extrai texto diretamente usando a instância global do PDF.js (sem dependência de pdfService.js externo)
 */
async function extrairTextoComPdfJs(file) {
  if (!window.pdfjsLib) {
    throw new Error("A biblioteca PDF.js não está carregada no index.html.");
  }

  // Configura o Worker dinamicamente
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdfDocument = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";

  for (let i = 1; i <= pdfDocument.numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const content = await page.getTextContent();
    const textoPagina = content.items.map((item) => item.str).join(" ");
    textoCompleto += `\n${textoPagina}`;
  }

  return textoCompleto;
}

/**
 * Exibe/Oculta o indicador de progresso
 */
function mostrarStatus(visivel, mensagem = "") {
  const statusEl = document.getElementById("status-importacao");
  const textoEl = document.getElementById("status-texto");
  if (!statusEl) return;

  if (mensagem && textoEl) textoEl.textContent = mensagem;
  statusEl.style.display = visivel ? "flex" : "none";
}

/**
 * Monta os cards com os produtos identificados e vincula o envio ao comparador
 */
function renderizarProdutos(produtos, router) {
  const container = document.getElementById("resultado-importacao");
  if (!container) return;

  if (!produtos || produtos.length === 0) {
    container.innerHTML = `
      <div class="aviso-vazio">
        Nenhum produto foi identificado no texto deste PDF.<br>
        <small class="muted">Se o arquivo for uma foto escaneada, certifique-se de que possui texto selecionável.</small>
      </div>`;
    return;
  }

  const htmlProdutos = produtos
    .map(
      (prod) => `
    <div class="card-produto-oferta" style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color, #eee);">
      <div>
        <strong>${prod.nome}</strong>
        ${prod.unidade ? `<br><small class="muted">Embalagem: ${prod.unidade}</small>` : ""}
      </div>
      <div style="font-weight: bold; color: var(--primary-color, #2e7d32);">
        R$ ${Number(prod.preco).toFixed(2).replace(".", ",")}
      </div>
    </div>
  `
    )
    .join("");

  container.innerHTML = `
    <div style="margin-top: 20px;">
      <h3>Ofertas Encontradas (${produtos.length})</h3>
      <div class="lista-ofertas-scroll" style="max-height: 300px; overflow-y: auto; margin-bottom: 15px;">
        ${htmlProdutos}
      </div>
      <button id="btn-salvar-ofertas" class="btn btn--primary btn--block" style="width: 100%; padding: 12px;">
        Adicionar Ofertas ao Comparador
      </button>
    </div>
  `;

  document.getElementById("btn-salvar-ofertas")?.addEventListener("click", () => {
    // Armazena as ofertas extraídas e redireciona para a página do comparador
    storageService.savePreference("ofertas_importadas", produtos);
    router.navigate("/comparador");
  });
}
