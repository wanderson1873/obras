/** Confirmação para ações que apagam ou encerram — substitui o window.confirm do navegador. */

import { BottomSheet } from "./BottomSheet";

export function ConfirmSheet({
  title,
  message,
  confirmLabel,
  tone = "neutral",
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "neutral" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmClasses =
    tone === "danger"
      ? "bg-[#b8462f] text-white shadow-[0_8px_18px_rgba(184,70,47,0.25)]"
      : "bg-[#27374c] text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)]";

  return (
    <BottomSheet label={title} title={title} onClose={onCancel} centerOnDesktop>
      <p className="mb-5 text-[14px] leading-6 text-[#5b6779]">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="h-12 flex-1 rounded-2xl border border-[#e2dbd0] bg-white text-sm font-bold text-[#4c5a6d] transition active:scale-[0.98]"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className={`h-12 flex-1 rounded-2xl text-sm font-bold transition active:scale-[0.98] ${confirmClasses}`}
        >
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
