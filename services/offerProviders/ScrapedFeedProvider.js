/**
 * ScrapedFeedProvider.js
 * Consome assets/data/scraped-offers.json — o feed de preços REAIS,
 * coletados pela GitHub Action agendada (scripts/scraper/scrape_vtex.py)
 * a partir da API pública de busca de cada rede (ver config/redes.json).
 *
 * A coleta em si roda FORA do navegador (Action agendada no GitHub, com
 * acesso à internet do runner), porque CORS impede o navegador de ler
 * dados de outro domínio diretamente. Este provider só LÊ o resultado
 * já pronto — o front-end continua 100% estático.
 *
 * Como cada preço coletado é da rede como um todo (loja online), e não
 * de um endereço físico específico, o casamento com os mercados reais
 * encontrados perto do usuário (via Overpass/OpenStreetMap) é feito por
 * NOME: se o nome do mercado no mapa contém "Zaffari", "Carrefour" etc.
 * (configurado em matchKeywords), a oferta é aplicada àquele mercado.
 */

import { OfferProvider } from "./OfferProvider.js";

let cachedFeed = null;
let cachedRedesConfig = null;

async function loadFeed() {
  if (cachedFeed) return cachedFeed;
  try {
    const response = await fetch("./assets/data/scraped-offers.json");
    cachedFeed = response.ok ? await response.json() : [];
  } catch {
    cachedFeed = [];
  }
  return cachedFeed;
}

async function loadRedesConfig() {
  if (cachedRedesConfig) return cachedRedesConfig;
  try {
    const response = await fetch("./config/redes.json");
    cachedRedesConfig = response.ok ? await response.json() : { redes: [] };
  } catch {
    cachedRedesConfig = { redes: [] };
  }
  return cachedRedesConfig;
}

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Retorna os mercados (dos encontrados perto do usuário) que pertencem a essa rede. */
function encontrarMercadosDaRede(redeId, redesConfig, markets) {
  const rede = redesConfig.redes.find((r) => r.id === redeId);
  if (!rede) return [];

  const keywords = rede.matchKeywords.map(normalizar);
  return markets.filter((market) => {
    const nomeNormalizado = normalizar(market.nome);
    return keywords.some((kw) => nomeNormalizado.includes(kw));
  });
}

export class ScrapedFeedProvider extends OfferProvider {
  get id() {
    return "scraped-feed";
  }

  get label() {
    return "Preços reais coletados";
  }

  /**
   * @param {{ marketIds: string[], markets: Array }} context
   * `markets` (objetos completos, não só IDs) é necessário aqui pra casar por nome.
   */
  async fetchOffers({ markets = [] }) {
    if (!markets.length) return [];

    const [feed, redesConfig] = await Promise.all([loadFeed(), loadRedesConfig()]);
    if (!feed.length) return [];

    const ofertas = [];

    // Agrupa o feed por rede pra não repetir o cálculo de mercados correspondentes
    const feedPorRede = new Map();
    feed.forEach((item) => {
      if (!feedPorRede.has(item.redeId)) feedPorRede.set(item.redeId, []);
      feedPorRede.get(item.redeId).push(item);
    });

    feedPorRede.forEach((itensDaRede, redeId) => {
      const mercadosCorrespondentes = encontrarMercadosDaRede(redeId, redesConfig, markets);
      if (!mercadosCorrespondentes.length) return;

      mercadosCorrespondentes.forEach((market) => {
        itensDaRede.forEach((item, index) => {
          ofertas.push({
            id: `scraped-${redeId}-${market.id}-${index}`,
            nome: item.nome,
            marca: item.marca,
            categoria: item.categoria,
            preco: item.preco,
            unidade: item.unidade,
            imagem: item.imagem,
            mercadoId: market.id,
            data: item.data,
            validade: item.validade,
            fonte: this.id,
          });
        });
      });
    });

    return ofertas;
  }
}
