/** Lista de avisos: quem mexeu, em qual ficha e quando. Tocar abre a ficha. */

import {
  Bell,
  CheckCircle2,
  PencilLine,
  Plus,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { useT } from "@/i18n/I18nContext";
import { useRelativeTime } from "@/i18n/useRelativeTime";
import type { Activity, ActivityKind } from "./useActivity";

const ICONES: Record<ActivityKind, LucideIcon> = {
  created: Plus,
  updated: PencilLine,
  completed: CheckCircle2,
  reopened: RotateCcw,
};

export function ActivitySheet({
  items,
  onOpenWork,
  onClose,
}: {
  items: Activity[];
  /** Nulo quando a ficha já foi apagada; aí o aviso não leva a lugar nenhum. */
  onOpenWork: (workId: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const quando = useRelativeTime();

  return (
    <BottomSheet
      label={t("activity.title")}
      eyebrow={t("activity.eyebrow")}
      title={t("activity.title")}
      onClose={onClose}
      centerOnDesktop
    >
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#f3f0e9] text-[#a9b1bb]">
            <Bell size={20} />
          </span>
          <p className="text-[13px] leading-5 text-[#78828f]">
            {t("activity.empty")}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map(item => {
            const Icone = ICONES[item.kind];
            const abrivel = item.workId !== null;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!abrivel}
                  onClick={() => item.workId && onOpenWork(item.workId)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                    item.unseen
                      ? "border-[#f3cdb8] bg-[#fff8f4]"
                      : "border-[#eae4da] bg-white"
                  } ${abrivel ? "active:scale-[0.98]" : "opacity-60"}`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
                      item.unseen
                        ? "bg-[#e86a33] text-white"
                        : "bg-[#f3f0e9] text-[#5d6878]"
                    }`}
                  >
                    <Icone size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-5 text-[#354357]">
                      <strong className="font-bold">
                        {item.actorName || t("activity.someone")}
                      </strong>{" "}
                      {t(`activity.kind.${item.kind}`)}
                    </span>
                    <span className="block truncate text-[13px] font-bold text-[#27374c]">
                      {item.workStreet || t("activity.goneWork")}
                    </span>
                    <span className="mt-0.5 block font-mono-field text-[10px] uppercase tracking-[0.1em] text-[#9aa2ac]">
                      {quando(item.createdAt)}
                      {!abrivel && ` · ${t("activity.goneWork")}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </BottomSheet>
  );
}
