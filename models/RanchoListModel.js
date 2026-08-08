/**
 * RanchoListModel.js
 * Regras de negócio da "Lista de Rancho": dado um valor disponível e um
 * percentual de reserva, calcula valor reservado/restante e monta uma
 * sugestão de compras dentro do orçamento, priorizando o menor preço
 * de cada produto entre os mercados com ofertas carregadas.
 */

/**
 * Calcula a reserva financeira a partir do valor total e do percentual.
 * @param {number} valorDisponivel - Valor total disponível para a compra.
 * @param {number} percentualReserva - Percentual reservado para emergências/imprevistos.
 * @returns {Object} Valores calculados com precisão de 2 casas decimais.
 */
export function calcularReserva(valorDisponivel = 0, percentualReserva = 0) {
  const disponivel = Math.max(0, Number(valorDisponivel) || 0);
  const percentual = Math.min(100, Math.max(0, Number(percentualReserva) || 0));

  const valorReservado = Number(((disponivel * percentual) / 100).toFixed(2));
  const valorRestante = Number((disponivel - valorReservado).toFixed(2));

  return {
    valorDisponivel: disponivel,
    percentualReserva: percentual,
    valorReservado,
    valorRestante,
  };
}

/**
 * Monta uma sugestão de compras dentro do saldo disponível,
 * priorizando as ofertas de menor preço por produto.
 * 
 * @param {Array} ofertas - Lista de ofertas carregadas dos mercados.
 * @param {number} valorRestante - Saldo teto disponível para compras.
 * @param {Object} marketsById - Mapa auxiliar de ID do mercado -> dados do mercado.
 * @returns {Object} Sugestão com itens selecionados, totais e economia estimada.
 */
export function montarSugestaoDeCompras(ofertas = [], valorRestante = 0, marketsById = {}) {
  const saldo = Math.max(0, Number(valorRestante) || 0);

  if (!Array.isArray(ofertas) || ofertas.length === 0 || saldo <= 0) {
    return {
      itens: [],
      totalEstimado: 0,
      economiaTotal: 0,
      valorRestanteAposCompra: saldo,
    };
  }

  // Agrupa produtos e rastreia o menor e o maior preço em uma única passagem (O(N))
  const produtoStats = new Map();

  ofertas.forEach((oferta) => {
    if (!oferta || typeof oferta.preco !== "number" || oferta.preco <= 0) return;

    const chave = (oferta.nome || "").toLowerCase().trim();
    if (!chave) return;

    const stat = produtoStats.get(chave);

    if (!stat) {
      produtoStats.set(chave, {
        menorOferta: oferta,
        maiorPreco: oferta.preco,
      });
    } else {
      if (oferta.preco < stat.menorOferta.preco) {
        stat.menorOferta = oferta;
      }
      if (oferta.preco > stat.maiorPreco) {
        stat.maiorPreco = oferta.preco;
      }
    }
  });

  // Ordena os candidatos pelo menor preço disponível
  const candidatos = Array.from(produtoStats.values()).sort(
    (a, b) => a.menorOferta.preco - b.menorOferta.preco
  );

  const itens = [];
  let total = 0;
  let economiaTotal = 0;

  for (const { menorOferta, maiorPreco } of candidatos) {
    const preco = menorOferta.preco;

    // Respeita o teto do orçamento restante
    if (total + preco > saldo) continue;

    total = Number((total + preco).toFixed(2));

    // Calcula a economia: prioriza a diferença do preço original (de/por) se existir,
    // caso contrário usa a diferença em relação ao maior preço praticado no mercado
    const precoBase =
      menorOferta.precoOriginal && menorOferta.precoOriginal > preco
        ? menorOferta.precoOriginal
        : maiorPreco;

    const economia = Math.max(0, Number((precoBase - preco).toFixed(2)));
    economiaTotal = Number((economiaTotal + economia).toFixed(2));

    const mercadoId = menorOferta.mercadoId;
    const mercadoNome =
      marketsById[mercadoId]?.nome || menorOferta.mercadoNome || "Mercado";

    itens.push({
      id: menorOferta.id,
      produto: menorOferta.nome,
      marca: menorOferta.marca || "",
      unidade: menorOferta.unidade || "",
      categoria: menorOferta.categoria || "Geral",
      preco,
      precoOriginal: menorOferta.precoOriginal || null,
      economia,
      mercadoId,
      mercadoNome,
    });
  }

  return {
    itens,
    totalEstimado: total,
    economiaTotal,
    valorRestanteAposCompra: Number((saldo - total).toFixed(2)),
  };
}

/**
 * Agrupa os itens da sugestão de compras por mercado.
 * Útil para exibir ao usuário o que comprar em cada estabelecimento.
 * 
 * @param {Object} sugestao - Objeto retornado por montarSugestaoDeCompras.
 * @returns {Array} Lista de mercados com seus respectivos itens e custo total.
 */
export function agruparSugestaoPorMercado(sugestao) {
  if (!sugestao || !Array.isArray(sugestao.itens)) return [];

  const mapaMercados = new Map();

  sugestao.itens.forEach((item) => {
    const id = item.mercadoId || "desconhecido";

    if (!mapaMercados.has(id)) {
      mapaMercados.set(id, {
        mercadoId: id,
        mercadoNome: item.mercadoNome,
        totalMercado: 0,
        itens: [],
      });
    }

    const grupo = mapaMercados.get(id);
    grupo.itens.push(item);
    grupo.totalMercado = Number((grupo.totalMercado + item.preco).toFixed(2));
  });

  return Array.from(mapaMercados.values());
}
