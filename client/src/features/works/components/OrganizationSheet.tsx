/**
 * Onde a ficha fica: privada ou dentro de uma organização.
 *
 * Só quem criou vê este botão — mover a ficha entre organizações muda quem
 * enxerga, e isso não é decisão de quem apenas recebeu.
 */

import { useState } from "react";
import { Building2, Check, Loader2, Lock, Users } from "lucide-react";
import { useT } from "@/i18n/I18nContext";
import type { Company } from "@/features/company/types";
import type { Work } from "@/features/works/types";
import { BottomSheet } from "./BottomSheet";

export function OrganizationSheet({
  work,
  companies,
  onClose,
  onSave,
}: {
  work: Work;
  companies: Company[];
  onClose: () => void;
  onSave: (companyId: string | null) => Promise<boolean>;
}) {
  const t = useT();
  const [escolhida, setEscolhida] = useState<string | null>(work.companyId);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const ok = await onSave(escolhida);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <BottomSheet
      label={t("org.pickTitle")}
      eyebrow={t("org.section")}
      title={work.street}
      onClose={onClose}
      centerOnDesktop
    >
      <div className="space-y-2">
        <Opcao
          icon={<Lock size={16} />}
          title={t("org.private")}
          description={t("org.privateHint")}
          active={escolhida === null}
          onClick={() => setEscolhida(null)}
        />
        {companies.map(empresa => (
          <Opcao
            key={empresa.id}
            icon={<Building2 size={16} />}
            title={empresa.name}
            description={t("org.belongsToHint")}
            active={escolhida === empresa.id}
            onClick={() => setEscolhida(empresa.id)}
          />
        ))}
      </div>

      {companies.length === 0 && (
        <p className="mt-4 rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
          {t("org.noneYet")}
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
        <Users size={14} className="mt-0.5 shrink-0 text-[#8a929d]" />
        {t("org.pickHint")}
      </p>

      <button
        onClick={save}
        disabled={saving || escolhida === work.companyId}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <Check size={17} />
        )}{" "}
        {t("common.save")}
      </button>
    </BottomSheet>
  );
}

function Opcao({
  icon,
  title,
  description,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition active:scale-[0.98] ${
        active ? "border-[#e86a33] bg-[#fff8f4]" : "border-[#e8e2d7] bg-white"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-[#e86a33] text-white" : "bg-[#f3f0e9] text-[#5d6878]"}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-bold text-[#354357]">
          {title}
        </span>
        <span className="block text-[12px] leading-4 text-[#78828f]">
          {description}
        </span>
      </span>
    </button>
  );
}
