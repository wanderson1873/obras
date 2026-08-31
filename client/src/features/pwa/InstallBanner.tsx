/**
 * Convite para instalar o app na tela inicial. Some depois de instalado
 * ou quando o usuário dispensa.
 */

import { useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { usePwaInstall } from "./usePwaInstall";
import { useT } from "@/i18n/I18nContext";

export function InstallBanner() {
  const { installed, ios, canInstall, dismissed, install, dismiss } =
    usePwaInstall();
  const t = useT();
  const [showIosSteps, setShowIosSteps] = useState(false);

  // No iPhone não existe prompt, então o convite aparece mesmo sem evento do navegador.
  const shouldShow = !installed && !dismissed && (canInstall || ios);
  if (!shouldShow) return null;

  return (
    <>
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#f0ded4] bg-[#fff8f4] px-3.5 py-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e86a33] text-white"
          aria-hidden="true"
        >
          <Download size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#8f4526]">
            {t("pwa.installTitle")}
          </p>
          <p className="text-[12px] leading-4 text-[#a27053]">
            {t("pwa.installBody")}
          </p>
        </div>
        <button
          onClick={() => (ios ? setShowIosSteps(true) : void install())}
          className="h-9 shrink-0 rounded-xl bg-[#e86a33] px-3 text-[12px] font-bold text-white transition active:scale-95"
        >
          {t("pwa.install")}
        </button>
        <button
          onClick={dismiss}
          aria-label={t("pwa.dismiss")}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#b2907c] transition active:scale-90"
        >
          <X size={15} />
        </button>
      </div>

      {showIosSteps && (
        <BottomSheet
          label={t("pwa.iosLabel")}
          eyebrow={t("pwa.install")}
          title={t("pwa.iosTitle")}
          onClose={() => setShowIosSteps(false)}
          centerOnDesktop
        >
          <ol className="space-y-3">
            <IosStep
              number={1}
              icon={<Share size={17} />}
              text={t("pwa.iosStep1")}
            />
            <IosStep
              number={2}
              icon={<SquarePlus size={17} />}
              text={t("pwa.iosStep2")}
            />
            <IosStep number={3} text={t("pwa.iosStep3")} />
          </ol>
          <p className="mt-4 rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
            {t("pwa.iosNote")}
          </p>
        </BottomSheet>
      )}
    </>
  );
}

function IosStep({
  number,
  icon,
  text,
}: {
  number: number;
  icon?: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f3eee5] font-mono-field text-[11px] font-medium text-[#7c5a17]">
        {number}
      </span>
      <span className="flex flex-1 items-center gap-2 text-[14px] leading-6 text-[#4f5c6e]">
        {icon && <span className="shrink-0 text-[#e86a33]">{icon}</span>}
        {text}
      </span>
    </li>
  );
}
