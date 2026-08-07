/**
 * encarteExtractionService.js
 * Front-end: converte a imagem enviada pelo usuário e chama a função
 * serverless para leitura via IA.
 */

// Configure aqui a URL do seu backend se não estiver rodando no mesmo domínio
const NETLIFY_FUNCTION_URL = "https://seu-app.netlify.app/.netlify/functions/extract-encarte";

export const encarteExtractionService = {
  /**
   * @param {File} arquivoImagem
   * @param {{nomeMercado?: string}} contexto
   * @returns {Promise<{produtos: Array, observacao: string|null}>}
   */
  async extrairDeImagem(arquivoImagem, contexto = {}) {
    // Validação de tipo de arquivo no frontend
    if (!arquivoImagem || !arquivoImagem.type.startsWith("image/")) {
      throw new Error("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).");
    }

    const base64 = await this._arquivoParaBase64(arquivoImagem);

    // Usa a URL configurada ou o caminho relativo padrão
    const endpoint = window.location.hostname.includes("github.io")
      ? NETLIFY_FUNCTION_URL
      : "/.netlify/functions/extract-encarte";

    try {
      const resposta = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagemBase64: base64,
          mediaType: arquivoImagem.type || "image/jpeg",
          nomeMercado: contexto.nomeMercado || null,
        }),
      });

      if (!resposta.ok) {
        let mensagemErro = "";
        try {
          const jsonErro = await resposta.json();
          mensagemErro = jsonErro.message || jsonErro.error;
        } catch {
          mensagemErro = await resposta.text().catch(() => "");
        }
        throw new Error(`Falha ao processar o encarte (${resposta.status}): ${mensagemErro || 'Erro desconhecido'}`);
      }

      const dados = await resposta.json();
      return dados; // { produtos: [...], observacao: string|null }
    } catch (error) {
      console.error("Erro na extração de encarte:", error);
      throw error;
    }
  },

  _arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        const resultado = leitor.result;
        if (typeof resultado === "string" && resultado.includes(",")) {
          const base64 = resultado.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Formato de leitura da imagem inválido."));
        }
      };
      leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo de imagem."));
      leitor.readAsDataURL(arquivo);
    });
  },
};

// Exportação padrão de segurança para compatibilidade universal de módulos JS
export default encarteExtractionService;
