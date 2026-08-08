/**
 * ocrParser.js
 * Extrai pares "produto + preço" do texto bruto reconhecido pelo OCR
 * (Tesseract.js) numa foto de encarte/print de oferta. OCR de foto real
 * é impreciso por natureza, então isso é uma heurística — o app sempre
 * mostra o resultado numa lista EDITÁVEL antes de salvar, pra pessoa
 * corrigir nome/preço errado ou remover linha que não é produto.
 */

const REGEX_PRECO = /R?\$?\s?(\d{1,3}(?:\.\d{3})*,\d{2})/;

function precoParaNumero(precoTexto) {
  const limpo = precoTexto.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(limpo);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * @param {string} textoOcr - texto bruto retornado pelo Tesseract.js
 * @returns {Array<{nome: string, preco: number}>}
 */
export function parseOfertasDoTexto(textoOcr) {
  const linhas = (textoOcr || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const resultados = [];
  let nomeCandidato = null;

  for (const linha of linhas) {
    const match = linha.match(REGEX_PRECO);

    if (match) {
      const preco = precoParaNumero(match[1]);
      if (!preco || preco <= 0 || preco > 10000) continue;

      // Nome pode estar na mesma linha do preço, ou ter vindo na linha anterior
      // (comum em encarte, onde o preço grande fica isolado embaixo do nome).
      const nomeNaLinha = linha
        .slice(0, match.index)
        .trim()
        .replace(/[-–.,:]+$/, "")
        .trim();

      const nome = nomeNaLinha.length >= 3 ? nomeNaLinha : nomeCandidato;

      if (nome && nome.length >= 3) {
        resultados.push({ nome: capitalizar(nome), preco });
      }
      nomeCandidato = null;
    } else if (linha.length >= 3 && linha.length <= 60 && !/^\d+$/.test(linha)) {
      nomeCandidato = linha;
    }
  }

  return resultados;
}

function capitalizar(texto) {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra) => (palavra ? palavra[0].toUpperCase() + palavra.slice(1) : palavra))
    .join(" ");
}

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Detecta a categoria do app a partir do nome do produto, usando o mesmo
 * mapa de palavras-chave que o coletor automático usa (config/redes.json),
 * pra manter a categorização consistente entre as duas fontes de oferta.
 */
export function detectarCategoria(nomeProduto, mapaCategoriaPorPalavraChave) {
  const nomeNormalizado = normalizar(nomeProduto);
  for (const [categoriaId, palavras] of Object.entries(mapaCategoriaPorPalavraChave || {})) {
    if (palavras.some((palavra) => nomeNormalizado.includes(normalizar(palavra)))) {
      return categoriaId;
    }
  }
  return "bazar";
}
