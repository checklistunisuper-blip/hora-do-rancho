/**
 * netlify/functions/search-market-offers.js
 * Busca ofertas de um mercado/atacado na web usando Gemini API + Google Search Grounding.
 */

exports.handler = async (event) => {
  // Configuração dos cabeçalhos CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Método não permitido. Use POST." }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { nomeMercado, cidade, estado } = body;

    if (!nomeMercado) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "O nome do mercado é obrigatório." }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "A chave GEMINI_API_KEY não está configurada nas variáveis de ambiente." }),
      };
    }

    // Endpoint do modelo Gemini 2.5 Flash
    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const localizacaoTexto = cidade ? `na cidade de ${cidade}${estado ? " - " + estado : ""}` : "no Brasil";

    const promptText = `
Você é um assistente especializado em encontrar encartes e ofertas de supermercados e atacados.
Pesquise na web pelas ofertas e encartes mais recentes e vigentes do supermercado/atacado "${nomeMercado}" ${localizacaoTexto}.

Instruções de resposta:
Extraia até 15 produtos em promoção encontrados na web com nome, preço numérico e unidade de medida (ex: kg, un, pacote).
Sua resposta final deve ser EXCLUSIVAMENTE um JSON válido no seguinte formato:

{
  "mercado": "${nomeMercado}",
  "cidade": "${cidade || ""}",
  "ofertas": [
    {
      "produto": "Nome do Produto",
      "preco": 0.00,
      "unidade": "un / kg / cx / pct"
    }
  ],
  "observacao": "Período de validade ou detalhes sobre a fonte das ofertas encontradas"
}
`;

    // Configuração do payload com Google Search Grounding
    const requestPayload = {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      tools: [
        {
          googleSearch: {},
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    const response = await fetch(geminiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API do Gemini (${response.status}): ${errorText}`);
    }

    const responseData = await response.json();
    const candidate = responseData.candidates?.[0];
    const rawContent = candidate?.content?.parts?.[0]?.text;

    // Captura links de fontes do Grounding
    const groundingSources = candidate?.groundingMetadata?.groundingChunks?.map((chunk) => ({
      title: chunk.web?.title || "",
      uri: chunk.web?.uri || "",
    })).filter(s => s.uri) || [];

    let resultado = { mercado: nomeMercado, ofertas: [], observacao: null, fontes: groundingSources };

    if (rawContent) {
      // Limpa marcadores de bloco de código markdown
      let jsonLimpo = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();

      const matchJson = jsonLimpo.match(/\{[\s\S]*\}/);
      if (matchJson) {
        jsonLimpo = matchJson[0];
      }

      try {
        const parsed = JSON.parse(jsonLimpo);

        // Sanitização e normalização das ofertas
        const ofertasSanitizadas = Array.isArray(parsed.ofertas)
          ? parsed.ofertas
              .map((item) => {
                let precoNum = typeof item.preco === "number" ? item.preco : parseFloat(String(item.preco).replace("R$", "").replace(",", ".").trim());
                return {
                  produto: String(item.produto || item.nome || "").trim(),
                  preco: isNaN(precoNum) ? 0 : Number(precoNum.toFixed(2)),
                  unidade: String(item.unidade || "un").trim(),
                };
              })
              .filter((item) => item.produto && item.preco > 0)
          : [];

        resultado = {
          mercado: parsed.mercado || nomeMercado,
          cidade: parsed.cidade || cidade || "",
          ofertas: ofertasSanitizadas,
          observacao: parsed.observacao || null,
          fontes: groundingSources,
        };
      } catch (parseError) {
        console.warn("Falha ao parsear JSON retornado pelo Gemini:", rawContent);
        resultado.observacao = "A pesquisa foi concluída, mas houve erro na estrutura do resultado.";
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(resultado),
    };
  } catch (error) {
    console.error("Erro na busca de ofertas com Gemini Search:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || "Erro interno ao buscar ofertas na web." }),
    };
  }
};
