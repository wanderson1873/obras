/**
 * "há 5 min", "há 2 h", "ontem".
 *
 * O Intl faz o trabalho de dizer isso em cada idioma; aqui só se escolhe a
 * unidade que faz sentido para a distância.
 */

import { useMemo } from "react";
import { useI18n } from "./I18nContext";

const LOCALES = { pt: "pt-BR", en: "en-US", es: "es-ES" } as const;

const MINUTO = 60_000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

export function useRelativeTime() {
  const { language, t } = useI18n();

  return useMemo(() => {
    const formatador = new Intl.RelativeTimeFormat(LOCALES[language], {
      numeric: "auto",
    });

    return (isoDate: string) => {
      const quando = new Date(isoDate).getTime();
      if (Number.isNaN(quando)) return "—";

      const diferenca = quando - Date.now();
      const distancia = Math.abs(diferenca);

      // Menos de um minuto vira "agora": contar segundos não ajuda ninguém.
      if (distancia < MINUTO) return t("common.now");
      if (distancia < HORA) {
        return formatador.format(Math.round(diferenca / MINUTO), "minute");
      }
      if (distancia < DIA) {
        return formatador.format(Math.round(diferenca / HORA), "hour");
      }
      return formatador.format(Math.round(diferenca / DIA), "day");
    };
  }, [language, t]);
}
