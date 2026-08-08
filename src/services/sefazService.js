/**
 * src/services/sefazService.js
 * Integração com dados de ofertas da SEFAZ / Menor Preço Nota Fiscal Gaúcha (RS)
 */

export const sefazService = {
  /**
   * Busca ofertas por palavra-chave ou raio de localização emitidas via NF-e
   */
  async buscarOfertasSefaz(latitude, longitude, raioKm = 10, termo = "") {
    try {
      // Exemplo de chamada para API de Menor Preço / SEFAZ RS
      // Em produção, esta URL aponta para a API pública da NFG/SEFAZ-RS
      const url = `https://menorpreco.sefaz.rs.gov.br/api/v1/produtos?lat=${latitude}&lng=${longitude}&raio=${raioKm}&termo=${encodeURIComponent(termo)}`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("API SEFAZ indisponível no momento");
      }

      const data = await response.json();
      
      // Formata a resposta da SEFAZ para a estrutura do aplicativo
      return (data.produtos || []).map((item) => ({
        id: `sefaz-${item.id || Math.random().toString(36).substring(2, 9)}`,
        produto: item.descricao || item.nome,
        preco: `R$ ${Number(item.preco).toFixed(2).replace('.', ',')}`,
        mercadoNome: item.estabelecimento?.nomeFantasia || item.estabelecimento?.razãoSocial,
        cnpj: item.estabelecimento?.cnpj,
        endereco: item.estabelecimento?.endereco,
        distanciaKm: item.distancia,
        dataEmissaoNfe: item.dataHoraEmissao,
        origem: "sefaz_rs"
      }));
    } catch (error) {
      console.warn("Falha ao carregar ofertas da SEFAZ, utilizando cache do robô:", error.message);
      return [];
    }
  }
};
