/**
 * src/utils/encarteParser.js
 * Utilitário de parsing para encartes/folhetos em PDF ou Texto OCR.
 */

// Configura o worker do PDF.js automaticamente via CDN se a lib estiver presente no global
if (typeof window !== "undefined" && window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/**
 * Expressões regulares para captura de nomes, preços e unidades
 */
const PRECO_REGEX = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*[\,\.]\d{2})/i;
const UNIDADE_REGEX = /\b(kg|g|l|ml|un|unid|und|cx|pct|pacote|lata|garrafa)\b/i;

/**
 * Converte um arquivo PDF enviado pelo usuário em texto extraído de todas as páginas.
 * @param {File|ArrayBuffer} pdfSource 
 * @returns {Promise<string>}
 */
export async function extrairTextoDePDF(pdfSource) {
  if (!window.pdfjsLib) {
    throw new Error("A biblioteca PDF.js não foi carregada no projeto.");
  }

  let arrayBuffer;
  if (pdfSource instanceof File) {
    arrayBuffer = await pdfSource.arrayBuffer();
  } else {
    arrayBuffer = pdfSource;
  }

  const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let textoCompleto = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const textoPagina = textContent.items.map((item) => item.str).join(" ");
    textoCompleto += ` ${textoPagina}\n`;
  }

  return textoCompleto;
}

/**
 * Processa texto extraído (seja de PDF ou OCR) e retorna uma lista estruturada de ofertas.
 * @param {string} texto 
 * @returns {Array<{nome: string, preco: number, unidade: string}>}
 */
export function parseEncarte(texto) {
  if (!texto || typeof texto !== "string") return [];

  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const ofertas = [];

  linhas.forEach((linha) => {
    const matchPreco = linha.match(PRECO_REGEX);

    if (matchPreco) {
      const precoString = matchPreco[1].replace(".", "").replace(",", ".");
      const preco = parseFloat(precoString);

      if (!isNaN(preco) && preco > 0) {
        // Extrai o nome removendo a parte do preço
        let nome = linha.replace(matchPreco[0], "").trim();

        // Tenta capturar a unidade
        const matchUnidade = nome.match(UNIDADE_REGEX);
        const unidade = matchUnidade ? matchUnidade[1].toLowerCase() : "un";

        // Limpa caracteres especiais residuais do nome
        nome = nome
          .replace(/[^\w\sÀ-ÿ\-]/gi, "")
          .replace(/\s+/g, " ")
          .trim();

        if (nome.length >= 3) {
          ofertas.push({
            nome,
            preco,
            unidade
          });
        }
      }
    }
  });

  return ofertas;
}

/**
 * Função utilitária unificada: recebe um arquivo PDF ou texto e retorna as ofertas extraídas.
 * @param {File|string} input 
 * @returns {Promise<Array<{nome: string, preco: number, unidade: string}>>}
 */
export async function parseEncarteArquivoOuTexto(input) {
  let texto = "";

  if (typeof input === "string") {
    texto = input;
  } else if (input instanceof File) {
    if (input.type === "application/pdf" || input.name.endsWith(".pdf")) {
      texto = await extrairTextoDePDF(input);
    } else {
      throw new Error("Formato de arquivo não suportado diretamente. Use PDF ou o leitor de fotos OCR.");
    }
  }

  return parseEncarte(texto);
}

export default {
  extrairTextoDePDF,
  parseEncarte,
  parseEncarteArquivoOuTexto,
};
