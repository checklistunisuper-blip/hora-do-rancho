/**
 * format.js — funções utilitárias de formatação usadas em toda a UI.
 */

export function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatarDistancia(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatarData(isoString) {
  if (!isoString) return "—";
  const data = new Date(isoString);
  return data.toLocaleDateString("pt-BR");
}

export function formatarDataHora(isoString) {
  if (!isoString) return "—";
  const data = new Date(isoString);
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function debounce(fn, delayMs = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

export function categoriaLabel(categorias, id) {
  return categorias.find((c) => c.id === id)?.label || id;
}

export function categoriaIcone(categorias, id) {
  return categorias.find((c) => c.id === id)?.icon || "🛒";
}
