/** Escolher quem enxerga a obra. Só aparece para quem criou. */

import { useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  Lock,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { CompanyMember } from "@/features/company/types";
import type { ShareScope, Work } from "@/features/works/types";
import { useT } from "@/i18n/I18nContext";
import { BottomSheet } from "./BottomSheet";

export function ShareSheet({
  work,
  members,
  companyName,
  onClose,
  onSave,
}: {
  work: Work;
  /** Membros da empresa, já sem quem está usando o app. */
  members: CompanyMember[];
  companyName: string;
  onClose: () => void;
  onSave: (scope: ShareScope, userIds: string[]) => Promise<boolean>;
}) {
  const t = useT();
  const [scope, setScope] = useState<ShareScope>(work.shareScope);
  const [selected, setSelected] = useState<string[]>(work.sharedWith);
  const [saving, setSaving] = useState(false);

  function toggle(userId: string) {
    setSelected(current =>
      current.includes(userId)
        ? current.filter(id => id !== userId)
        : [...current, userId]
    );
  }

  async function save() {
    if (scope === "selected" && selected.length === 0) {
      toast.error(t("share.pickSomeone"), {
        description: t("share.pickSomeoneHint"),
      });
      return;
    }
    setSaving(true);
    const ok = await onSave(scope, scope === "selected" ? selected : []);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <BottomSheet
      label={t("share.label")}
      eyebrow={t("share.title")}
      title={work.street}
      onClose={onClose}
      centerOnDesktop
    >
      <div className="space-y-2">
        <ScopeOption
          icon={<Lock size={16} />}
          title={t("share.private")}
          description={t("share.privateHint")}
          active={scope === "private"}
          onClick={() => setScope("private")}
        />
        <ScopeOption
          icon={<UserRound size={16} />}
          title={t("share.selected")}
          description={t("share.selectedHint")}
          active={scope === "selected"}
          onClick={() => setScope("selected")}
          disabled={members.length === 0}
          disabledReason={t("share.noOneElse")}
        />
        <ScopeOption
          icon={<Building2 size={16} />}
          title={t("share.company", { company: companyName })}
          description={t("share.companyHint")}
          active={scope === "company"}
          onClick={() => setScope("company")}
        />
      </div>

      {scope === "selected" && members.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#eae4da] bg-white">
          {members.map((membro, index) => {
            const marcado = selected.includes(membro.userId);
            return (
              <button
                key={membro.userId}
                onClick={() => toggle(membro.userId)}
                className={`flex w-full items-center gap-3 px-3.5 py-3 text-left ${index < members.length - 1 ? "border-b border-[#f1ece3]" : ""}`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition ${marcado ? "border-[#599875] bg-[#599875] text-white" : "border-[#cfd3d4] bg-white"}`}
                >
                  {marcado && <Check size={13} strokeWidth={3} />}
                </span>
                <span className="flex-1 text-[14px] font-medium text-[#435064]">
                  {membro.displayName}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
        <Users size={14} className="mt-0.5 shrink-0 text-[#8a929d]" />
        {t("share.note")}
      </p>

      <button
        onClick={save}
        disabled={saving}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
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

function ScopeOption({
  icon,
  title,
  description,
  active,
  onClick,
  disabled = false,
  disabledReason,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition active:scale-[0.98] disabled:opacity-50 ${
        active ? "border-[#e86a33] bg-[#fff8f4]" : "border-[#e8e2d7] bg-white"
      }`}
    >
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-[#e86a33] text-white" : "bg-[#f3f0e9] text-[#5d6878]"}`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-[#354357]">
          {title}
        </span>
        <span className="block text-[12px] leading-4 text-[#78828f]">
          {disabled && disabledReason ? disabledReason : description}
        </span>
      </span>
    </button>
  );
}
