/**
 * favoritesService.js
 * Favoritar mercados, produtos e categorias — salvo apenas localmente.
 */

import { APP_CONFIG } from "../config/config.js";
import { storageService } from "./storageService.js";

const STORE = APP_CONFIG.db.stores.favorites;

export const favoritesService = {
  async add(tipo, refId, dadosExtras = {}) {
    try {
      const id = `${tipo}:${refId}`;
      await storageService.put(STORE, { 
        id, 
        tipo, 
        refId, 
        ...dadosExtras, 
        criadoEm: Date.now() 
      });
      return id;
    } catch (error) {
      console.error(`Erro ao adicionar favorito [${tipo}:${refId}]:`, error);
      return null;
    }
  },

  async remove(tipo, refId) {
    try {
      return await storageService.remove(STORE, `${tipo}:${refId}`);
    } catch (error) {
      console.error(`Erro ao remover favorito [${tipo}:${refId}]:`, error);
      return false;
    }
  },

  async isFavorite(tipo, refId) {
    try {
      const item = await storageService.get(STORE, `${tipo}:${refId}`);
      return Boolean(item);
    } catch (error) {
      console.error(`Erro ao verificar favorito [${tipo}:${refId}]:`, error);
      return false;
    }
  },

  async toggle(tipo, refId, dadosExtras = {}) {
    try {
      const isFav = await this.isFavorite(tipo, refId);
      if (isFav) {
        await this.remove(tipo, refId);
        return false;
      }
      await this.add(tipo, refId, dadosExtras);
      return true;
    } catch (error) {
      console.error(`Erro ao alternar favorito [${tipo}:${refId}]:`, error);
      return false;
    }
  },

  async getAll(tipo = null) {
    try {
      const all = (await storageService.getAll(STORE)) || [];
      return tipo ? all.filter((f) => f && f.tipo === tipo) : all;
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
      return [];
    }
  },
};
