/** Folha inferior compartilhada: fecha no Esc e no toque fora, e trava a rolagem do fundo. */

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export function BottomSheet({
  label,
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  centerOnDesktop = false,
}: {
  label: string;
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  centerOnDesktop?: boolean;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center bg-[#172334]/40 ${centerOnDesktop ? "sm:items-center sm:px-4" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
    >
      <div
        onClick={event => event.stopPropagation()}
        className={`sheet-enter max-h-[92vh] w-full max-w-[540px] overflow-y-auto rounded-t-[28px] bg-[#fbfaf7] p-5 shadow-2xl ${centerOnDesktop ? "sm:rounded-[28px]" : ""}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="font-mono-field text-[10px] uppercase tracking-[0.15em] text-[#e86a33]">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-1 text-[22px] font-bold tracking-[-0.04em] text-[#27374c]">
              {title}
            </h2>
            {subtitle && (
              <div className="mt-1 text-sm text-[#758093]">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0ece4] text-[#59677a] transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
