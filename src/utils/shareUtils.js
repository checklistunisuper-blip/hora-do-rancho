/**
 * Formata as ofertas e abre o WhatsApp com o texto pronto.
 * @param {Array} ofertas - Lista de ofertas a compartilhar [{ nome, preco, mercadoNome }]
 * @param {string} [titulo] - Título opcional para a mensagem
 */
export function compartilharComparacaoWhatsApp(ofertas = [], titulo = "Lista de Comparação de Preços") {
  if (!ofertas || ofertas.length === 0) {
    alert("Nenhuma oferta selecionada para compartilhar.");
    return;
  }

  // 1. Monta o cabeçalho
  let mensagem = `🛒 *${titulo.toUpperCase()}*\n`;
  mensagem += `_Gerado pelo Comparador de Ofertas_\n\n`;

  // 2. Agrupa por mercado para organizar a visualização
  const porMercado = ofertas.reduce((acc, item) => {
    const mercado = item.mercadoNome || "Outros / Não informado";
    if (!acc[mercado]) acc[mercado] = [];
    acc[mercado].push(item);
    return acc;
  }, {});

  // 3. Monta a lista formatada
  for (const [mercado, itens] of Object.entries(porMercado)) {
    mensagem += `📍 *${mercado}*\n`;
    itens.forEach((item) => {
      const precoFormatado = Number(item.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      mensagem += `• ${item.nome}: *${precoFormatado}*\n`;
    });
    mensagem += `\n`;
  }

  // 4. Codifica o texto para URL
  const textoEncoded = encodeURIComponent(mensagem);

  // 5. Monta a URL do WhatsApp e abre em uma nova aba
  const urlWhatsapp = `https://api.whatsapp.com/send?text=${textoEncoded}`;
  window.open(urlWhatsapp, "_blank");
}
