import { extrairTextoDoPdf, extrairProdutosDoTexto } from "../services/pdfService.js";
import { storageService } from "../services/storageService.js";

export function afterRender(router, params) {
  const pdfInput = document.getElementById("pdf-file-input");

  pdfInput?.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Por favor, selecione um arquivo no formato PDF.");
      return;
    }

    mostrarStatus(true, "Lendo páginas do PDF...");

    try {
      // 1. Extrai todo o texto do PDF no navegador
      const textoBruto = await extrairTextoDoPdf(file);
      
      // 2. Processa o texto extraído para identificar produtos e preços
      const produtosIdentificados = extrairProdutosDoTexto(textoBruto);

      // 3. Renderiza o resultado na tela
      renderizarProdutos(produtosIdentificados, router);
    } catch (err) {
      console.error("Erro no processamento do PDF:", err);
      alert("Não foi possível ler o arquivo PDF. Verifique se o documento não está protegido por senha.");
    } finally {
      mostrarStatus(false);
    }
  });
}
