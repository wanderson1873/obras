/**
 * Troca de idioma fora do app.
 *
 * O seletor de idioma morava só em Conta, atrás do login — quem chegava ao
 * site com o celular em inglês via a landing em inglês e não tinha como mudar.
 *
 * Usa o `select` nativo escondido sobre a pílula, como em Conta: no celular
 * abre o seletor do próprio sistema, que é melhor com o dedo do que qualquer
 * lista desenhada à mão.
 */

import { ChevronDown, Languages } from "lucide-react";
import {
  LANGUAGES,
  LANGUAGE_NAMES,
  useI18n,
  type Language,
} from "./I18nContext";

export function LanguagePicker() {
  const { t, language, automatic, setLanguage } = useI18n();

  return (
    <label className="relative flex h-10 items-center gap-1.5 rounded-xl border border-[#e8e2d7] bg-[#fbfaf7] px-3 text-[13px] font-bold text-[#526073]">
      <Languages size={15} className="text-[#e86a33]" />
      {/* Na largura de celular o nome inteiro brigaria com o botão de entrar. */}
      <span className="uppercase sm:hidden">{language}</span>
      <span className="hidden sm:inline">{LANGUAGE_NAMES[language]}</span>
      <ChevronDown size={14} className="text-[#b3bac3]" />
      <select
        aria-label={t("account.language")}
        value={automatic ? "auto" : language}
        onChange={event =>
          setLanguage(
            event.target.value === "auto"
              ? null
              : (event.target.value as Language)
          )
        }
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      >
        <option value="auto">{t("account.languageAuto")}</option>
        {LANGUAGES.map(idioma => (
          <option key={idioma} value={idioma}>
            {LANGUAGE_NAMES[idioma]}
          </option>
        ))}
      </select>
    </label>
  );
}
