/**
 * src/utils/encarteParser.js
 * Utilitário para extração e parse de produtos e preços a partir de textos
 * brutos (obtidos via OCR) ou documentos PDF de encartes de supermercado.
 */

// Configura o worker do PDF.js automaticamente via CDN se a lib estiver presente no global
if (typeof window !== "undefined" && window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

/**
 * Regex para capturar padrões de preços em R$ (ex: "R$ 19,90", "19.90", "9,99")
 */
const REGEX_PRECO = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*[\,\.]\d{2})/i;
const REGEX_UNIDADE = /\b(kg|g|l|ml|un|unid|und|cx|pct|pacote|lata|garrafa|pet)\b/i;

/**
 * Converte um valor em string de preço para número float válido.
 * Ex: "1.299,90" -> 1299.90 | "15.90" -> 15.90
 */
function precoParaNumero(precoTexto) {
  if (!precoTexto) return null;
  // Se contiver vírgula, assume padrão brasileiro (pontos para milhar, vírgula para decimal)
  let limpo = precoTexto;
  if (limpo.includes(",")) {
    limpo = limpo.replace(/\./g, "").replace(",", ".");
  }
  const numero = parseFloat(limpo);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

/**
 * Formata o texto para capitalizado (primeira letra de cada palavra em maiúscula)
 */
function capitalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .split(" ")
    .map((palavra) => (palavra ? palavra[0].toUpperCase() + palavra.slice(1) : ""))
    .join(" ")
    .trim();
}

/**
 * Processa texto bruto de encarte e retorna um array de ofertas encontradas.
 * @param {string} texto 
 * @returns {Array<{nome: string, preco: number, unidade: string}>}
 */
export function parseEncarte(texto) {
  if (!texto || typeof texto !== "string") return [];

  const linhas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const ofertas = [];
  let nomeCandidato = null;

  for (const linha of linhas) {
    const matchPreco = linha.match(REGEX_PRECO);

    if (matchPreco) {
      const preco = precoParaNumero(matchPreco[1]);
      if (!preco || preco > 10000) continue;

      // Tenta pegar o nome que está na mesma linha do preço
      let nomeNaLinha = linha
        .replace(matchPreco[0], "")
        .replace(/[^\w\sÀ-ÿ\-\.%]/gi, " ")
        .trim();

      // Captura unidade de medida se houver
      const matchUnidade = linha.match(REGEX_UNIDADE);
      const unidade = matchUnidade ? matchUnidade[1].toLowerCase() : "un";

      // Define se o nome vem da própria linha ou da linha anterior
      const nomeFinal = nomeNaLinha.length >= 3 ? nomeNaLinha : nomeCandidato;

      if (nomeFinal && nomeFinal.length >= 3) {
        ofertas.push({
          nome: capitalizar(nomeFinal),
          preco,
          unidade,
        });
      }
      nomeCandidato = null;
    } else if (linha.length >= 3 && linha.length <= 80 && !/^\d+$/.test(linha)) {
      // Guarda a linha como candidato a nome do produto para o preço da próxima linha
      nomeCandidato = linha.replace(/[^\w\sÀ-ÿ\-\.%]/gi, " ").trim();
    }
  }

  return ofertas;
}

/**
 * Converte um arquivo PDF em texto corrido extraindo o conteúdo de todas as páginas.
 * @param {File|ArrayBuffer} pdfSource 
 * @returns {Promise<string>}
 */
export async function extrairTextoDePDF(pdfSource) {
  if (!window.pdfjsLib) {
    throw new Error("A biblioteca PDF.js não está carregada no index.html.");
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
    textoCompleto += `\n${textoPagina}`;
  }

  return textoCompleto;
}

/**
 * Função utilitária unificada: aceita texto direto ou arquivo PDF e devolve os produtos identificados.
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
      throw new Error("Formato de arquivo não suportado. Utilize arquivos PDF.");
    }
  }

  return parseEncarte(texto);
}

// Aliases de exportação para manter total compatibilidade com todas as chamadas do projeto:
export const processarTextoEncarte = parseEncarte;
export const processarEncarte = parseEncarteArquivoOuTexto;

export default {
  parseEncarte,
  extrairTextoDePDF,
  parseEncarteArquivoOuTexto,
  processarTextoEncarte,
  processarEncarte,
};
