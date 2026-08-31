/**
 * Modo organizar: a lista vira linhas compactas com setas, para escolher a
 * ordem das fichas.
 *
 * Linhas em vez de cards porque, organizando, o que importa é ver muitas obras
 * de uma vez — e setas em vez de arrastar porque o dedo na obra nem sempre é
 * preciso, e arrastar brigaria com a rolagem da página.
 */

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronsUp,
  Loader2,
  X,
} from "lucide-react";
import type { Work } from "@/features/works/types";
import { useT } from "@/i18n/I18nContext";

export function ReorderList({
  works,
  label,
  onSave,
  onCancel,
}: {
  works: Work[];
  /** Nome do grupo sendo organizado, para o usuário saber o que está mexendo. */
  label: string;
  onSave: (orderedIds: string[]) => Promise<boolean>;
  onCancel: () => void;
}) {
  const t = useT();
  const [ordered, setOrdered] = useState<Work[]>(works);
  const [saving, setSaving] = useState(false);

  const changed = ordered.some((work, index) => work.id !== works[index]?.id);

  function moveTo(from: number, to: number) {
    if (to < 0 || to >= ordered.length) return;
    setOrdered(current => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    const ok = await onSave(ordered.map(work => work.id));
    setSaving(false);
    if (ok) onCancel();
  }

  return (
    <div className="app-enter min-h-screen px-4 pb-16 pt-7 sm:px-5">
      <header className="mb-6">
        <p className="field-rule w-max pb-1.5 font-mono-field text-[9px] font-medium uppercase tracking-[0.16em] text-[#6a7180]">
          {t("reorder.eyebrow", { group: label })}
        </p>
        <h1 className="mt-1 text-[25px] font-bold tracking-[-0.04em] text-[#27374c]">
          {t("reorder.title")}
        </h1>
        <p className="mt-1.5 text-[13px] leading-5 text-[#6d7889]">
          {t("reorder.hint")}
        </p>
      </header>

      <div className="mb-5 flex gap-2">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-[#e2dbd0] bg-white text-[13px] font-bold text-[#4c5a6d] transition active:scale-[0.98] disabled:opacity-60"
        >
          <X size={16} /> {t("common.cancel")}
        </button>
        <button
          onClick={save}
          disabled={saving || !changed}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {changed ? t("reorder.save") : t("reorder.noChanges")}
        </button>
      </div>

      <ol className="space-y-2">
        {ordered.map((work, index) => (
          <li
            key={work.id}
            className="flex items-center gap-3 rounded-2xl border border-[#e9e3d8] bg-[#fffefa] p-3 shadow-[0_3px_10px_rgba(39,55,76,0.05)]"
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f3eee5] font-mono-field text-[11px] font-medium text-[#7c5a17]">
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold leading-tight tracking-[-0.02em] text-[#27374c]">
                {work.street}
              </p>
              <p className="truncate text-[12px] text-[#78828f]">
                {work.city}
                {work.service && ` · ${work.service}`}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <MoveButton
                label={t("reorder.toTop", { street: work.street })}
                disabled={index === 0}
                onClick={() => moveTo(index, 0)}
              >
                <ChevronsUp size={16} />
              </MoveButton>
              <MoveButton
                label={t("reorder.up", { street: work.street })}
                disabled={index === 0}
                onClick={() => moveTo(index, index - 1)}
              >
                <ArrowUp size={16} />
              </MoveButton>
              <MoveButton
                label={t("reorder.down", { street: work.street })}
                disabled={index === ordered.length - 1}
                onClick={() => moveTo(index, index + 1)}
              >
                <ArrowDown size={16} />
              </MoveButton>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      // 36px de alvo: dá para acertar com o dedo sujo, de pé no canteiro.
      className="grid h-9 w-9 place-items-center rounded-xl bg-[#f3f0e9] text-[#4f5c6e] transition active:scale-90 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
