/**
 * Idioma da interface.
 *
 * O idioma vem do aparelho na primeira abertura e pode ser trocado à mão em
 * Conta. A escolha manual fica salva e passa a valer sobre o do aparelho.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { dictionaries, type TranslationKey } from "./translations";

export const LANGUAGES = ["pt", "en", "es"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<Language, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

const STORAGE_KEY = "obras:language";

function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

/** Idioma do aparelho, reduzido ao que o app fala. Cai no inglês se não souber. */
export function detectLanguage(): Language {
  if (typeof navigator === "undefined") return "en";
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    if (isLanguage(base)) return base;
  }
  return "en";
}

function readStored(): Language | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isLanguage(saved) ? saved : null;
  } catch {
    return null;
  }
}

type I18nValue = {
  language: Language;
  /** true quando o idioma veio do aparelho, sem escolha manual. */
  automatic: boolean;
  setLanguage: (language: Language | null) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [manual, setManual] = useState<Language | null>(readStored);
  const [device] = useState<Language>(detectLanguage);
  const language = manual ?? device;

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language | null) => {
    setManual(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* modo privado: a escolha vale só nesta sessão */
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dictionary = dictionaries[language];
    return {
      language,
      automatic: manual === null,
      setLanguage,
      t(key, values) {
        // O português é a referência: se faltar tradução, mostra o texto de lá
        // em vez de deixar a chave crua aparecer na tela.
        const template = dictionary[key] ?? dictionaries.pt[key] ?? key;
        if (!values) return template;
        return template.replace(/\{(\w+)\}/g, (_, nome: string) =>
          values[nome] === undefined ? `{${nome}}` : String(values[nome])
        );
      },
    };
  }, [language, manual, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n precisa estar dentro de I18nProvider.");
  return value;
}

/** Atalho para quem só precisa traduzir. */
export function useT() {
  return useI18n().t;
}
