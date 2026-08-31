/** Seletor de app de navegação — abre a rota de verdade no Waze, Google Maps ou Apple Maps. */

import { Copy, ExternalLink, Navigation } from "lucide-react";
import { toast } from "sonner";
import { fullAddress, navigationApps, openRoute } from "@/lib/navigation";
import type { Work } from "@/features/works/types";
import { useT } from "@/i18n/I18nContext";
import { BottomSheet } from "./BottomSheet";

export function NavigationSheet({
  work,
  onClose,
}: {
  work: Work;
  onClose: () => void;
}) {
  const t = useT();
  const address = fullAddress(work);
  const apps = navigationApps();

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(t("nav.copied"));
    } catch {
      toast.error(t("nav.copyFailed"));
    }
  }

  return (
    <BottomSheet
      label={t("nav.label")}
      eyebrow={t("nav.eyebrow")}
      title={work.street}
      subtitle={[work.city, work.zip].filter(Boolean).join(" · ")}
      onClose={onClose}
    >
      <div className="space-y-2">
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => {
              openRoute(app, address);
              onClose();
            }}
            className="flex h-14 w-full items-center gap-3 rounded-2xl border border-[#e8e2d7] bg-white px-3.5 text-left transition active:scale-[0.98]"
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-xl ${app.color} text-white`}
            >
              <Navigation size={16} fill="currentColor" />
            </span>
            <span className="flex-1 text-sm font-bold text-[#354357]">
              {app.name}
            </span>
            <ExternalLink size={16} className="text-[#9aa2ac]" />
          </button>
        ))}

        <button
          onClick={copyAddress}
          className="flex h-14 w-full items-center gap-3 rounded-2xl border border-dashed border-[#dcd4c8] bg-[#f8f5ef] px-3.5 text-left transition active:scale-[0.98]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eae4da] text-[#5d6878]">
            <Copy size={15} />
          </span>
          <span className="flex-1 text-sm font-bold text-[#354357]">
            {t("nav.copyAddress")}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
}
