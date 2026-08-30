/**
 * Cache local das fichas em IndexedDB.
 *
 * Serve para dois momentos: abrir o app já mostrando as obras enquanto o
 * Supabase responde, e continuar mostrando endereço, código e tarefas quando
 * o celular está sem sinal no canteiro.
 *
 * Nunca é a fonte da verdade — o Supabase é. Falha de cache é silenciosa.
 */

import type { Work } from "@/features/works/types";

const DB_NAME = "obras-cache";
const DB_VERSION = 1;
const STORE = "works";
const OPEN_TIMEOUT_MS = 4000;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Este navegador não oferece armazenamento local."));
      return;
    }

    // Em navegação privada o IndexedDB pode nunca responder; sem limite o app
    // ficaria travado esperando o cache.
    const timeout = setTimeout(
      () => reject(new Error("O armazenamento do aparelho não respondeu.")),
      OPEN_TIMEOUT_MS
    );
    const settle = (action: () => void) => {
      clearTimeout(timeout);
      action();
    };

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => settle(() => resolve(request.result));
    request.onerror = () =>
      settle(() =>
        reject(request.error ?? new Error("Falha ao abrir o cache local."))
      );
    request.onblocked = () =>
      settle(() =>
        reject(new Error("Feche as outras abas do Obras e recarregue."))
      );
  });

  dbPromise.catch(() => {
    dbPromise = null;
  });

  return dbPromise;
}

export async function readCachedWorks(): Promise<Work[]> {
  try {
    const db = await openDatabase();
    return await new Promise<Work[]>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readonly");
      const request = transaction.objectStore(STORE).getAll() as IDBRequest<
        Work[]
      >;
      request.onsuccess = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("Cache local indisponível para leitura.", error);
    return [];
  }
}

/** Espelha exatamente o que veio do Supabase, apagando o que não existe mais. */
export async function writeCachedWorks(works: Work[]): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      const store = transaction.objectStore(STORE);
      store.clear();
      works.forEach(work => store.put(work));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.warn("Cache local indisponível para escrita.", error);
  }
}
