/**
 * src/utils/format.js — funções utilitárias de formatação resilientes a erros.
 */

/**
 * Formata valores numéricos para moeda brasileira (R$).
 */
export function formatarMoeda(valor) {
  const num = Number(valor);
  if (isNaN(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Aliases/Apelidos para garantir compatibilidade com componentes que chamam formatarPreco
 */
export const formatarPreco = formatarMoeda;

/**
 * Formata distâncias em metros (se menor que 1km) ou quilômetros.
 */
export function formatarDistancia(km) {
  const num = Number(km);
  if (isNaN(num) || num <= 0) return "0 m";
  if (num < 1) return `${Math.round(num * 1000)} m`;
  return `${num.toFixed(1).replace(".", ",")} km`;
}

/**
 * Formata datas ISO para o padrão brasileiro (DD/MM/AAAA).
 */
export function formatarData(isoString) {
  if (!isoString) return "—";
  const data = new Date(isoString);
  if (isNaN(data.getTime())) return "—";
  return data.toLocaleDateString("pt-BR");
}

/**
 * Formata data e hora ISO para o padrão brasileiro (DD/MM/AAAA HH:mm).
 */
export function formatarDataHora(isoString) {
  if (!isoString) return "—";
  const data = new Date(isoString);
  if (isNaN(data.getTime())) return "—";
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

/**
 * Utilitário de debounce para evitar execuções excessivas em inputs/buscas.
 */
export function debounce(fn, delayMs = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Retorna o rótulo amigável da categoria.
 */
export function categoriaLabel(categorias = [], id) {
  if (!Array.isArray(categorias)) return id || "Outros";
  return categorias.find((c) => c.id === id)?.label || id || "Outros";
}

/**
 * Retorna o ícone associado à categoria.
 */
export function categoriaIcone(categorias = [], id) {
  if (!Array.isArray(categorias)) return "🛒";
  return categorias.find((c) => c.id === id)?.icon || "🛒";
}
