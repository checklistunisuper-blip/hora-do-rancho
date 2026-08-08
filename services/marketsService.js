/**
 * Busca supermercados que contenham o termo de pesquisa no nome, endereço, rede ou cidade.
 * @param {string} query Termo de busca
 * @returns {Array}
 */
search(query) {
  if (!query || !query.trim()) return MARKETS_DATA;
  const term = query.toLowerCase().trim();
  return MARKETS_DATA.filter(
    m =>
      m.name.toLowerCase().includes(term) ||
      m.address.toLowerCase().includes(term) ||
      m.network.toLowerCase().includes(term) ||
      m.city.toLowerCase().includes(term)
  );
}
