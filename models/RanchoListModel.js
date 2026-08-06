/**
 * RanchoListModel.js
 * Regras de negócio da "Lista de Rancho": dado um valor disponível e um
 * percentual de reserva, calcula valor reservado/restante e monta uma
 * sugestão de compras dentro do orçamento, priorizando o menor preço
 * de cada produto entre os mercados com ofertas carregadas.
 */

export function calcularReserva(valorDisponivel, percentualReserva) {
  const valorReservado = Number(((valorDisponivel * percentualReserva) / 100).toFixed(2));
  const valorRestante = Number((valorDisponivel - valorReservado).toFixed(2));
  return { valorDisponivel, percentualReserva, valorReservado, valorRestante };
}

/**
 * Monta uma sugestão de compras: para cada categoria, pega o produto de
 * menor preço disponível, respeitando o teto de valorRestante.
 * @param {Array} ofertas - lista de ofertas (já carregadas dos mercados próximos)
 * @param {Array} marketsById - mapa auxiliar id -> mercado, para exibir o nome
 */
export function montarSugestaoDeCompras(ofertas, valorRestante, marketsById = {}) {
  if (!ofertas.length) {
    return { itens: [], totalEstimado: 0, economiaTotal: 0, valorRestanteAposCompra: valorRestante };
  }

  // Agrupa por produto (nome) e pega o de menor preço em cada mercado
  const porProduto = new Map();
  ofertas.forEach((oferta) => {
    const chave = oferta.nome.toLowerCase();
    const atual = porProduto.get(chave);
    if (!atual || oferta.preco < atual.preco) {
      porProduto.set(chave, oferta);
    }
  });

  // Também calcula o maior preço do mesmo produto para estimar economia
  const maiorPrecoPorProduto = new Map();
  ofertas.forEach((oferta) => {
    const chave = oferta.nome.toLowerCase();
    const atual = maiorPrecoPorProduto.get(chave);
    if (!atual || oferta.preco > atual) {
      maiorPrecoPorProduto.set(chave, oferta.preco);
    }
  });

  const candidatos = Array.from(porProduto.values()).sort((a, b) => a.preco - b.preco);

  const itens = [];
  let total = 0;
  let economiaTotal = 0;

  for (const oferta of candidatos) {
    if (total + oferta.preco > valorRestante) continue;
    total = Number((total + oferta.preco).toFixed(2));

    const maiorPreco = maiorPrecoPorProduto.get(oferta.nome.toLowerCase()) || oferta.preco;
    const economia = Number((maiorPreco - oferta.preco).toFixed(2));
    economiaTotal = Number((economiaTotal + economia).toFixed(2));

    itens.push({
      produto: oferta.nome,
      marca: oferta.marca,
      categoria: oferta.categoria,
      preco: oferta.preco,
      economia,
      mercadoId: oferta.mercadoId,
      mercadoNome: marketsById[oferta.mercadoId]?.nome || "Mercado",
    });
  }

  return {
    itens,
    totalEstimado: total,
    economiaTotal,
    valorRestanteAposCompra: Number((valorRestante - total).toFixed(2)),
  };
}
