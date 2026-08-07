/**
 * storageService.js
 * Camada única de acesso a armazenamento local: IndexedDB (dados estruturados)
 * e LocalStorage (preferências simples). Nenhum dado sai do dispositivo.
 */

import { APP_CONFIG } from "../config/config.js";

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(APP_CONFIG.db.name, APP_CONFIG.db.version);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      Object.values(APP_CONFIG.db.stores).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = callback(store);

    let output;
    if (req && typeof req.onsuccess !== "undefined") {
      req.onsuccess = () => {
        output = req.result;
      };
    } else {
      output = req;
    }

    tx.oncomplete = () => resolve(output);
    tx.onerror = () => reject(tx.error);
  });
}

export const storageService = {
  // --- IndexedDB: coleções (mercados, ofertas, favoritos, listas) ---
  async put(storeName, item) {
    return withStore(storeName, "readwrite", (store) => store.put(item));
  },

  async putMany(storeName, items) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  },

  async get(storeName, id) {
    return withStore(storeName, "readonly", (store) => store.get(id));
  },

  async getAll(storeName) {
    return withStore(storeName, "readonly", (store) => store.getAll());
  },

  async remove(storeName, id) {
    return withStore(storeName, "readwrite", (store) => store.delete(id));
  },

  async clear(storeName) {
    return withStore(storeName, "readwrite", (store) => store.clear());
  },

  // --- LocalStorage: preferências simples (tema, idioma, localização manual) ---
  setPreference(key, value) {
    localStorage.setItem(`hdr:${key}`, JSON.stringify(value));
  },

  getPreference(key, fallback = null) {
    const raw = localStorage.getItem(`hdr:${key}`);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  removePreference(key) {
    localStorage.removeItem(`hdr:${key}`);
  },
};
