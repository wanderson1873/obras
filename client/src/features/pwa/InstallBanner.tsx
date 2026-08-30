/**
 * Convite para instalar o app na tela inicial. Some depois de instalado
 * ou quando o usuário dispensa.
 */

import { useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { usePwaInstall } from "./usePwaInstall";

export function InstallBanner() {
  const { installed, ios, canInstall, dismissed, install, dismiss } =
    usePwaInstall();
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
            Instalar o Obras no celular
          </p>
          <p className="text-[12px] leading-4 text-[#a27053]">
            Abre direto pelo ícone, sem procurar a aba do navegador.
          </p>
        </div>
        <button
          onClick={() => (ios ? setShowIosSteps(true) : void install())}
          className="h-9 shrink-0 rounded-xl bg-[#e86a33] px-3 text-[12px] font-bold text-white transition active:scale-95"
        >
          Instalar
        </button>
        <button
          onClick={dismiss}
          aria-label="Dispensar convite de instalação"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#b2907c] transition active:scale-90"
        >
          <X size={15} />
        </button>
      </div>

      {showIosSteps && (
        <BottomSheet
          label="Como instalar no iPhone"
          eyebrow="Instalar"
          title="Adicionar à tela de início"
          onClose={() => setShowIosSteps(false)}
          centerOnDesktop
        >
          <ol className="space-y-3">
            <IosStep
              number={1}
              icon={<Share size={17} />}
              text="Toque no botão Compartilhar, na barra de baixo do Safari."
            />
            <IosStep
              number={2}
              icon={<SquarePlus size={17} />}
              text="Role a lista e escolha “Adicionar à Tela de Início”."
            />
            <IosStep
              number={3}
              text="Confirme em “Adicionar”. O ícone aparece junto dos outros apps."
            />
          </ol>
          <p className="mt-4 rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
            No iPhone isso só funciona pelo Safari. Se você abriu por outro
            navegador, copie o endereço e cole no Safari.
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
