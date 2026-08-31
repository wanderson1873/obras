/**
 * Dicionários da interface.
 *
 * O português é a referência: o tipo Translations sai dele, então esquecer uma
 * chave em inglês ou espanhol vira erro de compilação, não texto faltando na
 * tela do usuário.
 */

import { pt } from "./pt";
import { en } from "./en";
import { es } from "./es";

export type TranslationKey = keyof typeof pt;
export type Translations = Record<TranslationKey, string>;

export const dictionaries: Record<"pt" | "en" | "es", Translations> = {
  pt,
  en,
  es,
};
