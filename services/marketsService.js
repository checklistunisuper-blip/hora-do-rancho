/**
 * encarteExtractionService.js
 * Front-end: converte a imagem enviada pelo usuário e chama a função
 * serverless para leitura via IA.
 */
export const encarteExtractionService = {
  /**
   * @param {File} arquivoImagem
   * @param {{nomeMercado?: string}} contexto
   * @returns {Promise<{produtos: Array, observacao: string|null}>}
   */
  async extrairDeImagem(arquivoImagem, contexto = {}) {
    // Validação de tipo de arquivo no frontend
    if (!arquivoImagem.type.startsWith("image/")) {
      throw new Error("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).");
    }

    const base64 = await this._arquivoParaBase64(arquivoImagem);

    // Altere a URL aqui caso o seu backend esteja em outro serviço fora do Netlify
    const endpoint = "/.netlify/functions/extract-encarte";

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
