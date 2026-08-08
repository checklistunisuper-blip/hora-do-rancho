/**
 * src/services/pdfService.js
 * Serviço responsável por extrair texto de arquivos PDF localmente usando PDF.js.
 */

// Define o Worker necessário para o processamento assíncrono do PDF.js
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/**
 * Converte um arquivo File (PDF) em string de texto puro
 * @param {File} file - Arquivo retornado pelo <input type="file">
 * @returns {Promise<string>} Texto completo extraído de todas as páginas
 */
export async function extrairTextoDoPdf(file) {
  if (!window.pdfjsLib) {
    throw new Error("A biblioteca PDF.js não foi carregada no documento.");
  }

  // Converte o arquivo de entrada em ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Carrega o documento PDF na memória
  const pdfDocument = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";

  // Percorre cada página do PDF extraindo os blocos de texto
  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Junta as palavras/frases da página separadas por espaço
    const textoPagina = textContent.items
      .map((item) => item.str)
      .join(" ");

    textoCompleto += `\n--- PÁGINA ${pageNum} ---\n` + textoPagina;
  }

  return textoCompleto;
}

/**
 * Extrai produtos e preços simples a partir do texto lido do PDF.
 * Procura padrões comuns de encartes (ex: "NOME DO PRODUTO R$ 12,99" ou "12,99")
 * @param {string} textoBruto 
 * @returns {Array<{nome: string, preco: number}>}
 */
export function extrairProdutosDoTexto(textoBruto) {
  const produtos = [];
  
  // Exemplo de Regex para capturar linhas contendo preço no formato R$ XX,XX ou XX,XX
  const regexPreco = /(.*?)(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{2})/gi;
  let match;

  while ((match = regexPreco.exec(textoBruto)) !== null) {
    let nome = match[1]
      .replace(/--- PÁGINA \d+ ---/g, "")
      .trim();
    
    const precoString = match[2].replace(".", "").replace(",", ".");
    const preco = parseFloat(precoString);

    // Filtra falsos positivos pequenos ou sem nome
    if (nome.length > 2 && !isNaN(preco)) {
      produtos.push({
        nome: nome,
        preco: preco
      });
    }
  }

  return produtos;
}
