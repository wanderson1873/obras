/**
 * Datas já no idioma de quem está lendo.
 *
 * As frases de duração ("7 dias de obra") saem do dicionário, então mudam com
 * o idioma junto com o resto da interface.
 */

import { useMemo } from "react";
import {
  daysSince,
  formatDayMonth,
  formatLongDate,
  formatShortDate,
} from "@/lib/dates";
import { useI18n } from "./I18nContext";

export function useDates() {
  const { language, t } = useI18n();

  return useMemo(
    () => ({
      short: (value: string) => formatShortDate(value, language),
      long: (value: string) => formatLongDate(value, language),
      dayMonth: (value: string) => formatDayMonth(value, language),

      /** "Hoje", "Ontem" ou a data curta — para a linha do tempo. */
      relativeDay(value: string) {
        const days = daysSince(value);
        if (days === null) return "—";
        if (days === 0) return t("common.today");
        if (days === 1) return t("common.yesterday");
        return formatDayMonth(value, language);
      },

      /** "7 dias de obra", "2 meses e 9 dias", "começa em 3 dias". */
      duration(startDate: string) {
        const days = daysSince(startDate);
        if (days === null) return t("date.durationUnavailable");
        if (days < 0) {
          const ahead = Math.abs(days);
          return ahead === 1
            ? t("date.startsTomorrow")
            : t("date.startsInDays", { days: ahead });
        }
        if (days === 0) return t("date.startedToday");
        if (days === 1) return t("date.oneDay");
        if (days < 30) return t("date.days", { days });

        const months = Math.floor(days / 30);
        const rest = days % 30;
        if (rest < 7) {
          return months === 1
            ? t("date.oneMonth")
            : t("date.months", { months });
        }
        return months === 1
          ? t("date.oneMonthAndDays", { days: rest })
          : t("date.monthsAndDays", { months, days: rest });
      },
    }),
    [language, t]
  );
}
