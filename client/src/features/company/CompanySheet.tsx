/** Organizações: quem participa de cada uma, convites e criação de novas. */

import { useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  LogOut,
  Mail,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n/I18nContext";
import { useCompanies } from "./useCompanies";
import type { Company, MemberRole } from "./types";

export function CompanySheet({ onClose }: { onClose: () => void }) {
  const {
    companies,
    loading,
    createCompany,
    invite,
    cancelInvite,
    removeMember,
    leave,
  } = useCompanies();
  const { session } = useAuth();
  const t = useT();
  const [criando, setCriando] = useState(false);
  const meuId = session?.user.id;

  const semNenhuma = !loading && companies.length === 0;

  return (
    <BottomSheet
      label={t("team.eyebrow")}
      eyebrow={t("team.eyebrow")}
      title={t("team.title")}
      onClose={onClose}
      centerOnDesktop
    >
      {loading ? (
        <div className="flex justify-center py-10 text-[#9aa2ac]">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : semNenhuma || criando ? (
        <CreateCompanyForm
          primeira={semNenhuma}
          onCancel={() => setCriando(false)}
          onCreate={async nome => {
            await createCompany(nome);
            setCriando(false);
          }}
        />
      ) : (
        <div className="space-y-5">
          {companies.map(empresa => (
            <CompanyBlock
              key={empresa.id}
              company={empresa}
              meuId={meuId}
              onInvite={(email, papel) => invite(empresa.id, email, papel)}
              onCancelInvite={cancelInvite}
              onRemoveMember={userId => removeMember(empresa.id, userId)}
              onLeave={() => leave(empresa.id)}
            />
          ))}

          <button
            onClick={() => setCriando(true)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d8d0c4] bg-[#f8f5ef] text-[13px] font-bold text-[#4f5d70] transition active:scale-[0.98]"
          >
            <Plus size={16} className="text-[#e86a33]" />{" "}
            {t("org.createAnother")}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function CompanyBlock({
  company,
  meuId,
  onInvite,
  onCancelInvite,
  onRemoveMember,
  onLeave,
}: {
  company: Company;
  meuId?: string;
  onInvite: (email: string, role: MemberRole) => Promise<void>;
  onCancelInvite: (inviteId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onLeave: () => Promise<void>;
}) {
  const t = useT();
  const souAdmin = company.myRole === "admin";

  return (
    <section className="rounded-2xl border border-[#eae4da] bg-white p-4">
      <p className="mb-3 flex items-center gap-2 text-[15px] font-bold text-[#27374c]">
        <Building2 size={16} className="shrink-0 text-[#e86a33]" />
        <span className="min-w-0 flex-1 truncate">{company.name}</span>
      </p>

      <ul className="overflow-hidden rounded-xl border border-[#f1ece3]">
        {company.members.map((membro, index) => (
          <li
            key={membro.userId}
            className={`flex items-center gap-3 px-3 py-2.5 ${index < company.members.length - 1 ? "border-b border-[#f1ece3]" : ""}`}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f3f0e9] text-[#5d6878]">
              <UserRound size={14} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-[#354357]">
                {membro.displayName}
                {membro.userId === meuId && (
                  <span className="ml-1.5 text-[11px] font-medium text-[#8a929d]">
                    ({t("common.you")})
                  </span>
                )}
              </span>
              <span className="font-mono-field text-[8px] uppercase tracking-[0.1em] text-[#8a929d]">
                {membro.role === "admin"
                  ? t("team.roleAdmin")
                  : t("team.roleMember")}
              </span>
            </span>
            {souAdmin && membro.userId !== meuId && (
              <button
                onClick={() => void onRemoveMember(membro.userId)}
                aria-label={t("team.removeLabel", { name: membro.displayName })}
                className="p-1 opacity-60 transition hover:opacity-100"
              >
                <Trash2 size={14} className="text-[#b5a29a]" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {company.pendingInvites.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {company.pendingInvites.map(convite => (
            <li
              key={convite.id}
              className="flex items-center gap-2.5 rounded-xl border border-dashed border-[#dcd4c8] bg-[#f8f5ef] px-3 py-2"
            >
              <Mail size={13} className="shrink-0 text-[#a97b26]" />
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#5b6779]">
                {convite.email}
              </span>
              <button
                onClick={() => void onCancelInvite(convite.id)}
                aria-label={t("team.cancelInviteLabel", {
                  email: convite.email,
                })}
                className="p-1 opacity-60 transition hover:opacity-100"
              >
                <Trash2 size={13} className="text-[#b5a29a]" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {souAdmin ? (
        <InviteForm onInvite={onInvite} />
      ) : (
        <p className="mt-3 rounded-xl bg-[#f3f0e9] px-3 py-2.5 text-[11px] leading-4 text-[#6b7686]">
          {t("team.onlyAdmin")}
        </p>
      )}

      <button
        onClick={() => void onLeave()}
        className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-[12px] font-bold text-[#a8503a] transition active:scale-[0.98]"
      >
        <LogOut size={14} /> {t("org.leave")}
      </button>
    </section>
  );
}

function CreateCompanyForm({
  primeira,
  onCreate,
  onCancel,
}: {
  primeira: boolean;
  onCreate: (name: string) => Promise<void>;
  onCancel: () => void;
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
      toast.success(t("team.created"), { description: t("team.createdHint") });
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
      {primeira && (
        <p className="text-[14px] leading-6 text-[#647084]">
          {t("team.createIntro")}
        </p>
      )}

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

      <div className="flex gap-2">
        {!primeira && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-12 flex-1 rounded-2xl border border-[#e2dbd0] bg-white text-sm font-bold text-[#4c5a6d] transition active:scale-[0.98]"
          >
            {t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
        >
          {busy ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Building2 size={17} />
          )}{" "}
          {t("team.create")}
        </button>
      </div>
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
    <form onSubmit={submit} className="mt-3 space-y-2">
      <p className="flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
        <UserPlus size={13} className="text-[#e86a33]" /> {t("team.invite")}
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          inputMode="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder={t("team.invitePlaceholder")}
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label={t("team.inviteAction")}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#27374c] text-white transition active:scale-95 disabled:opacity-70"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 rounded-xl bg-[#f3f0e9] p-1">
        <button
          type="button"
          onClick={() => setRole("member")}
          className={`h-8 rounded-lg text-[11px] font-bold transition ${role === "member" ? "bg-white text-[#27374c] shadow-sm" : "text-[#87909b]"}`}
        >
          {t("team.roleMember")}
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`h-8 rounded-lg text-[11px] font-bold transition ${role === "admin" ? "bg-white text-[#27374c] shadow-sm" : "text-[#87909b]"}`}
        >
          {t("team.roleAdmin")}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#f0cfc6] bg-[#fff6f3] px-3 py-2 text-[12px] font-medium text-[#a8462f]"
        >
          {error}
        </p>
      )}
    </form>
  );
}
