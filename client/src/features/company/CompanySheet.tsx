/** Equipe: quem participa da empresa, convites e criação da empresa. */

import { useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  Mail,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n/I18nContext";
import { useCompany } from "./useCompany";
import type { MemberRole } from "./types";

export function CompanySheet({ onClose }: { onClose: () => void }) {
  const {
    company,
    loading,
    createCompany,
    invite,
    cancelInvite,
    removeMember,
  } = useCompany();
  const { session } = useAuth();
  const t = useT();
  const meuId = session?.user.id;

  return (
    <BottomSheet
      label={t("team.eyebrow")}
      eyebrow={t("team.eyebrow")}
      title={company?.name ?? t("team.title")}
      onClose={onClose}
      centerOnDesktop
    >
      {loading ? (
        <div className="flex justify-center py-10 text-[#9aa2ac]">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : !company ? (
        <CreateCompanyForm onCreate={createCompany} />
      ) : (
        <div className="space-y-5">
          <ul className="overflow-hidden rounded-2xl border border-[#eae4da] bg-white">
            {company.members.map((membro, index) => (
              <li
                key={membro.userId}
                className={`flex items-center gap-3 px-3.5 py-3 ${index < company.members.length - 1 ? "border-b border-[#f1ece3]" : ""}`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f3f0e9] text-[#5d6878]">
                  <UserRound size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold text-[#354357]">
                    {membro.displayName}
                    {membro.userId === meuId && (
                      <span className="ml-1.5 text-[12px] font-medium text-[#8a929d]">
                        ({t("common.you")})
                      </span>
                    )}
                  </span>
                  <span className="font-mono-field text-[9px] uppercase tracking-[0.1em] text-[#8a929d]">
                    {membro.role === "admin"
                      ? t("team.roleAdmin")
                      : t("team.roleMember")}
                  </span>
                </span>
                {company.myRole === "admin" && membro.userId !== meuId && (
                  <button
                    onClick={() => void removeMember(membro.userId)}
                    aria-label={t("team.removeLabel", {
                      name: membro.displayName,
                    })}
                    className="p-1 opacity-60 transition hover:opacity-100"
                  >
                    <Trash2 size={15} className="text-[#b5a29a]" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {company.pendingInvites.length > 0 && (
            <section>
              <p className="mb-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
                {t("team.pendingInvites")}
              </p>
              <ul className="space-y-2">
                {company.pendingInvites.map(convite => (
                  <li
                    key={convite.id}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-[#dcd4c8] bg-[#f8f5ef] px-3.5 py-2.5"
                  >
                    <Mail size={15} className="shrink-0 text-[#a97b26]" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#5b6779]">
                      {convite.email}
                    </span>
                    <button
                      onClick={() => void cancelInvite(convite.id)}
                      aria-label={t("team.cancelInviteLabel", {
                        email: convite.email,
                      })}
                      className="p-1 opacity-60 transition hover:opacity-100"
                    >
                      <Trash2 size={14} className="text-[#b5a29a]" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] leading-5 text-[#8a929d]">
                {t("team.pendingHint")}
              </p>
            </section>
          )}

          {company.myRole === "admin" ? (
            <InviteForm onInvite={invite} />
          ) : (
            <p className="rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
              {t("team.onlyAdmin")}
            </p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

function CreateCompanyForm({
  onCreate,
}: {
  onCreate: (name: string) => Promise<void>;
}) {
  const t = useT();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError(t("team.typeCompanyName"));
    setError(null);
    setBusy(true);
    try {
      await onCreate(name);
      toast.success(t("team.created"), {
        description: t("team.createdHint"),
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("team.createFailed")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[14px] leading-6 text-[#647084]">
        {t("team.createIntro")}
      </p>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
          {t("team.companyName")}
        </span>
        <input
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="MAIA PAINTING INC"
          className="h-12 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#f0cfc6] bg-[#fff6f3] px-3 py-2.5 text-[13px] font-medium text-[#a8462f]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
      >
        {busy ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <Building2 size={17} />
        )}{" "}
        {t("team.create")}
      </button>
    </form>
  );
}

function InviteForm({
  onInvite,
}: {
  onInvite: (email: string, role: MemberRole) => Promise<void>;
}) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return setError(t("team.typeEmail"));
    setError(null);
    setBusy(true);
    try {
      await onInvite(email, role);
      setEmail("");
      toast.success(t("team.inviteCreated"), {
        description: t("team.inviteCreatedHint"),
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("team.inviteFailed")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border border-[#e8e2d7] bg-white p-4"
    >
      <p className="flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
        <UserPlus size={13} className="text-[#e86a33]" /> {t("team.invite")}
      </p>

      <input
        type="email"
        inputMode="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder={t("team.invitePlaceholder")}
        className="h-11 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
      />

      <div className="grid grid-cols-2 rounded-xl bg-[#f3f0e9] p-1">
        <button
          type="button"
          onClick={() => setRole("member")}
          className={`h-9 rounded-lg text-[12px] font-bold transition ${role === "member" ? "bg-white text-[#27374c] shadow-sm" : "text-[#87909b]"}`}
        >
          {t("team.roleMember")}
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`h-9 rounded-lg text-[12px] font-bold transition ${role === "admin" ? "bg-white text-[#27374c] shadow-sm" : "text-[#87909b]"}`}
        >
          {t("team.roleAdmin")}
        </button>
      </div>
      <p className="text-[11px] leading-4 text-[#8a929d]">
        {t("team.adminHint")}
      </p>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#f0cfc6] bg-[#fff6f3] px-3 py-2.5 text-[13px] font-medium text-[#a8462f]"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#27374c] text-[13px] font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
      >
        {busy ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Check size={15} />
        )}{" "}
        {t("team.inviteAction")}
      </button>
    </form>
  );
}
