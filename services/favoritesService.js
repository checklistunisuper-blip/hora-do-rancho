/**
 * favoritesService.js
 * Favoritar mercados, produtos e categorias — salvo apenas localmente.
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "./storageService.js";

const STORE = APP_CONFIG.db.stores.favorites;

export const favoritesService = {
  async add(tipo, refId, dadosExtras = {}) {
    const id = `${tipo}:${refId}`;
    await storageService.put(STORE, { id, tipo, refId, ...dadosExtras, criadoEm: Date.now() });
    return id;
  },

  async remove(tipo, refId) {
    return storageService.remove(STORE, `${tipo}:${refId}`);
  },

  async isFavorite(tipo, refId) {
    const item = await storageService.get(STORE, `${tipo}:${refId}`);
    return !!item;
  },

  async toggle(tipo, refId, dadosExtras = {}) {
    const isFav = await this.isFavorite(tipo, refId);
    if (isFav) {
      await this.remove(tipo, refId);
      return false;
    }
    await this.add(tipo, refId, dadosExtras);
    return true;
  },

  async getAll(tipo = null) {
    const all = await storageService.getAll(STORE);
    return tipo ? all.filter((f) => f.tipo === tipo) : all;
  },
};
