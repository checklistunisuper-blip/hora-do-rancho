/**
 * src/utils/encarteParser.js
 * Parser heurístico para extração precisa de ofertas em textos de encartes.
 */

// Palavras-chave a serem ignoradas na busca por nomes de produtos
const BLACKLIST_PALAVRAS = [
  "oferta", "ofertas", "validade", "valido", "válida", "válido", "imagem",
  "ilustrativa", "meramente", "cnpj", "sac", "loja", "supermercado", "condições",
  "pagamento", "cartão", "desconto", "clube", "unidade", "unidades", "kg", "litro",
  "confira", "estoque", "encarte", "folheto", "página", "pag"
];

// Expressões regulares para detecção de unidades, pacotes e preços
const REGEX_PRECO = /(?:R\$\s*)?(\d{1,3}(?:\.\d{3})*[\.,]\d{2})/i;
const REGEX_UNIDADE = /\b(\d+(?:[\.,]\d+)?\s*(?:kg|g|l|ml|un|und|pack|cx|lata|saco|pct))\b/i;
const REGEX_DATAS_OU_CNPJ = /\b(\d{2}\/\d{2}|\d{2}\.\d{3}\.\d{3}|\d{14})\b/;

/**
 * Processa o texto bruto e retorna uma lista estruturada de produtos
 * @param {string} textoBruto 
 * @returns {Array<{nome: string, preco: number, unidade: string|null}>}
 */
export function processarTextoEncarte(textoBruto) {
  if (!textoBruto) return [];

  // 1. Normalização do texto e separação por linhas limpas
  const linhas = textoBruto
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !REGEX_DATAS_OU_CNPJ.test(l));

  const produtosExtraidos = [];
  let bufferNome = [];

  for (let i = 0; i < linhas.length; i++) {
    const linhaAtual = linhas[i];

    // Verifica se a linha contém um preço (Ancoragem)
    const matchPreco = linhaAtual.match(REGEX_PRECO);

    if (matchPreco) {
      const precoNum = converterParaNumero(matchPreco[1]);

      // Remove o texto do preço da linha para analisar o restante
      const textoRestanteLinha = linhaAtual.replace(matchPreco[0], "").trim();

      if (textoRestanteLinha.length > 0) {
        bufferNome.push(textoRestanteLinha);
      }

      // Junta as linhas do buffer acumulado para formar o nome do produto
      let nomeCandidato = bufferNome.join(" ").trim();
      
      // Tenta extrair unidade de medida (ex: 500g, 1kg, 2L, Pack C/6)
      const matchUnidade = nomeCandidato.match(REGEX_UNIDADE);
      const unidade = matchUnidade ? matchUnidade[1] : null;

      // Sanitiza o nome final tirando palavras da blacklist e caracteres desnecessários
      const nomeLimpo = sanitizarNomeProduto(nomeCandidato);

      // Validação: Aceita apenas se tiver um nome válido (ao menos 3 letras)
      if (validarProduto(nomeLimpo, precoNum)) {
        produtosExtraidos.push({
          nome: nomeLimpo,
          preco: precoNum,
          unidade: unidade
        });
      }

      // Limpa o buffer para o próximo produto
      bufferNome = [];
    } else {
      // Se a linha não contém preço, ela provavelmente é parte do nome do produto seguinte
      if (!isLinhaRuido(linhaAtual)) {
        bufferNome.push(linhaAtual);
      }
    }
  }

  return removerDuplicados(produtosExtraidos);
}

/**
 * Converte string no formato "21,90" ou "1.250,50" para number (float)
 */
function converterParaNumero(strPreco) {
  const limpo = strPreco.replace(/\./g, "").replace(",", ".");
  return parseFloat(limpo);
}

/**
 * Filtra palavras institucionais e pontuações soltas
 */
function sanitizarNomeProduto(nome) {
  let resultado = nome
    .replace(/[^\w\sÁ-ÿ]/gi, " ") // Remove caracteres especiais extras
    .replace(/\s+/g, " ");        // Remove espaços duplos

  // Remove termos institucionais se estiverem no início do nome
  BLACKLIST_PALAVRAS.forEach(termo => {
    const regexTermo = new RegExp(`^${termo}\\b`, "gi");
    resultado = resultado.replace(regexTermo, "");
  });

  return resultado.trim();
}

/**
 * Verifica se a linha isolada é apenas ruído promocional
 */
function isLinhaRuido(linha) {
  const linhaLower = linha.toLowerCase();
  if (linha.length < 3) return true;
  return BLACKLIST_PALAVRAS.some(palavra => linhaLower.includes(palavra) && linha.length < 25);
}

/**
 * Regras de validação para descartar falsos positivos
 */
function validarProduto(nome, preco) {
  if (!nome || nome.length < 3) return false;
  if (isNaN(preco) || preco <= 0.10 || preco > 5000) return false; // Preços irrealistas de mercado
  if (/^\d+$/.test(nome)) return false; // Nome contendo apenas números
  return true;
}

/**
 * Remove produtos idênticos capturados no mesmo bloco
 */
function removerDuplicados(lista) {
  const mapa = new Map();
  for (const item of lista) {
    const chave = `${item.nome.toLowerCase()}_${item.preco}`;
    if (!mapa.has(chave)) {
      mapa.set(chave, item);
    }
  }
  return Array.from(mapa.values());
}
