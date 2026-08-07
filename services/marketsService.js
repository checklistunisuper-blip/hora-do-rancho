/**
 * encarteExtractionService.js
 * Front-end: converte a imagem enviada pelo usuário e chama a função
 * serverless (netlify/functions/extract-encarte.js) que faz a leitura via IA.
 * A chave de API nunca fica no navegador — só na função serverless.
 */
export const encarteExtractionService = {
  /**
   * @param {File} arquivoImagem
   * @param {{nomeMercado?: string}} contexto
   * @returns {Promise<{produtos: Array, observacao: string|null}>}
   */
  async extrairDeImagem(arquivoImagem, contexto = {}) {
    const base64 = await this._arquivoParaBase64(arquivoImagem);
    const resposta = await fetch("/.netlify/functions/extract-encarte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imagemBase64: base64,
        mediaType: arquivoImagem.type || "image/jpeg",
        nomeMercado: contexto.nomeMercado || null,
      }),
    });

    if (!resposta.ok) {
      const erro = await resposta.text().catch(() => "");
      throw new Error(`Falha ao processar o encarte (${resposta.status}): ${erro}`);
    }

    const dados = await resposta.json();
    return dados; // { produtos: [...], observacao: string|null }
  },

  _arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => {
        // remove o prefixo "data:image/jpeg;base64," antes de mandar
        const resultado = leitor.result;
        const base64 = String(resultado).split(",")[1];
        resolve(base64);
      };
      leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo de imagem."));
      leitor.readAsDataURL(arquivo);
    });
  },
};
