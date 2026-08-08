/**
 * src/services/offersService.js
 * Serviço de ofertas unificado com busca local, busca web via Gemini e ofertas de PDF importadas.
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "./storageService.js";

export const offersService = {
  /**
   * Compara o preço de um produto buscando na base local/Gemini E nas ofertas importadas via PDF
   */
  async compareProduct(nomeProduto) {
    if (!nomeProduto) return null;

    const termo = nomeProduto.toLowerCase().trim();

    // 1. Busca ofertas nas bases padrão/web (Módulos de feed/Gemini)
    const ofertasCadastradas = await this.buscarOfertasLocaisECached(termo);

    // 2. Busca ofertas importadas via PDF no storage
    const ofertasPDF = this.getOfertasImportadasDoStorage(termo);

    // 3. Junta todas as fontes
    const todasOfertas = [...ofertasCadastradas, ...ofertasPDF];

    if (!todasOfertas.length) return null;

    // 4. Ordena do menor para o maior preço
    todasOfertas.sort((a, b) => Number(a.preco) - Number(b.preco));

    const menorPreco = todasOfertas[0];
    const maiorPreco = todasOfertas[todasOfertas.length - 1];
    const diferenca = maiorPreco.preco - menorPreco.preco;

    const economiaPercentual =
      maiorPreco.preco > 0
        ? ((diferenca / maiorPreco.preco) * 100).toFixed(0)
        : 0;

    return {
      menorPreco,
      maiorPreco,
      diferenca,
      economiaPercentual,
      equivalente: todasOfertas.length === 1,
      ofertas: todasOfertas,
    };
  },

  /**
   * Filtra ofertas importadas de encartes (PDF) salvas no localStorage/storageService
   */
  getOfertasImportadasDoStorage(termo) {
    const importadas = storageService.getPreference("ofertas_importadas", []);

    return importadas
      .filter((item) => item.nome && item.nome.toLowerCase().includes(termo))
      .map((item, index) => ({
        id: `pdf_importado_${index}_${Date.now()}`,
        nome: item.nome,
        preco: Number(item.preco) || 0,
        unidade: item.unidade || "un",
        mercadoNome: "Encarte Importado (PDF)",
        fonte: "pdf-importado",
        marca: "PDF",
      }));
  },

  /**
   * Busca ofertas salvas localmente/em cache que coincidam com a consulta
   */
  async buscarOfertasLocaisECached(termo) {
    try {
      const storeName = APP_CONFIG?.db?.stores?.offers;
      let ofertas = [];

      if (storeName && storageService?.getAll) {
        ofertas = (await storageService.getAll(storeName)) || [];
      } else {
        ofertas = storageService.getPreference("ofertas_cadastradas", []);
      }

      return ofertas
        .filter((o) => {
          const nomeObj = o.produto || o.nome || "";
          return nomeObj.toLowerCase().includes(termo);
        })
        .map((o) => ({
          id: o.id || `loc-${Math.random()}`,
          mercadoId: o.marketId || o.mercadoId,
          mercadoNome: o.nomeMercado || o.mercadoNome || "Mercado Local",
          nome: o.produto || o.nome,
          preco: typeof o.preco === "number" ? o.preco : parseFloat(o.preco) || 0,
          unidade: o.unidade || "un",
          fonte: o.origem || o.fonte || "scraped-feed",
          marca: o.marca || "",
        }));
    } catch (e) {
      console.warn("[offersService] Erro ao buscar ofertas em cache:", e);
      return [];
    }
  },

  /**
   * Busca ofertas para uma lista de mercados (Provedor ScrapedFeed + Gemini Fallback)
   */
  async fetchAllOffers(markets = [], context = {}) {
    if (!markets || !markets.length) return [];

    let ofertas = [];

    // 1. Tenta buscar ofertas no provedor local (ScrapedFeedProvider)
    try {
      const providerModule = await import("./offerProviders/ScrapedFeedProvider.js").catch(() => ({}));
      const scrapedProvider = providerModule.scrapedProvider || providerModule.default;

      if (scrapedProvider?.fetchOffers) {
        const marketIds = markets.map((m) => m.id);
        ofertas = await scrapedProvider.fetchOffers({ marketIds, markets, ...context }).catch(() => []);
      }
    } catch (e) {
      console.warn("[offersService] Provedor local indisponível:", e);
    }

    // 2. Se não houver ofertas locais, consulta a web via Gemini para o primeiro mercado
    if (!ofertas.length && markets[0]) {
      const primeiroMercado = markets[0];
      const nomeMercado = primeiroMercado.nome || primeiroMercado.rede || "Mercado Local";
      const cidade = context.municipio || context.cidade || "";
      const estado = context.estado || "";

      const ofertasWeb = await this.buscarOfertasNaWeb(nomeMercado, cidade, estado);

      if (ofertasWeb?.ofertas?.length) {
        ofertas = ofertasWeb.ofertas.map((item, index) => ({
          id: `gemini-${primeiroMercado.id || "m"}-${index}-${Date.now()}`,
          marketId: primeiroMercado.id || "m1",
          nomeMercado: nomeMercado,
          produto: item.produto,
          preco: typeof item.preco === "number" ? item.preco : parseFloat(item.preco) || 0,
          unidade: item.unidade || "un",
          origem: "gemini-web",
          atualizadoEm: new Date().toISOString(),
        }));
      }
    }

    // 3. Salva no Storage se operacional
    try {
      const storeName = APP_CONFIG?.db?.stores?.offers;
      if (ofertas.length && storageService?.putMany && storeName) {
        await storageService.putMany(storeName, ofertas).catch(() => {});
      }
    } catch (e) {
      console.warn("[offersService] Falha ao persistir ofertas:", e);
    }

    return ofertas;
  },

  /**
   * Chamada direta para a Netlify Function do Gemini Search Grounding
   */
  async buscarOfertasNaWeb(nomeMercado, cidade = "", estado = "") {
    const endpoint = window.location.hostname.includes("github.io")
      ? "https://checklistunisuper-blip.netlify.app/.netlify/functions/search-market-offers"
      : "/.netlify/functions/search-market-offers";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeMercado, cidade, estado }),
      });

      if (!response.ok) {
        throw new Error(`Status HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[offersService] Erro na busca de ofertas para ${nomeMercado}:`, error);
      return { mercado: nomeMercado, ofertas: [], observacao: null };
    }
  },
};

export default offersService;
