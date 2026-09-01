/** Organizações: quem participa de cada uma, convites e criação de novas. */

import { useState } from "react";
import {
  AtSign,
  Building2,
  Copy,
  Link as LinkIcon,
  Loader2,
  LogOut,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { useAuth } from "@/features/auth/AuthContext";
import { useT } from "@/i18n/I18nContext";
import { useDates } from "@/i18n/useDates";
import { useCompanies } from "./useCompanies";
import type { Company, InviteLink } from "./types";

export function CompanySheet({ onClose }: { onClose: () => void }) {
  const {
    companies,
    loading,
    createCompany,
    addByNickname,
    createInviteLink,
    revokeInviteLink,
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
              onAddByNickname={apelido => addByNickname(empresa.id, apelido)}
              onCreateLink={() => createInviteLink(empresa.id)}
              onRevokeLink={() => revokeInviteLink(empresa.id)}
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
  onAddByNickname,
  onCreateLink,
  onRevokeLink,
  onRemoveMember,
  onLeave,
}: {
  company: Company;
  meuId?: string;
  onAddByNickname: (
    nickname: string
  ) => Promise<{ nickname: string; alreadyMember: boolean }>;
  onCreateLink: () => Promise<void>;
  onRevokeLink: () => Promise<void>;
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

      {souAdmin ? (
        <>
          <NicknameForm onAdd={onAddByNickname} />
          <InviteLinkBox
            link={company.inviteLink}
            onCreate={onCreateLink}
            onRevoke={onRevokeLink}
          />
        </>
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

function NicknameForm({
  onAdd,
}: {
  onAdd: (
    nickname: string
  ) => Promise<{ nickname: string; alreadyMember: boolean }>;
}) {
  const t = useT();
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!nickname.trim()) return setError(t("team.typeNickname"));
    setError(null);
    setBusy(true);
    try {
      const { nickname: nome, alreadyMember } = await onAdd(nickname);
      setNickname("");
      toast.success(
        alreadyMember
          ? t("team.alreadyMember", { name: nome })
          : t("team.memberAdded", { name: nome })
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("team.nicknameNotFound")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <p className="flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
        <AtSign size={13} className="text-[#e86a33]" />{" "}
        {t("team.inviteByNickname")}
      </p>

      <div className="flex gap-2">
        <input
          value={nickname}
          onChange={event => setNickname(event.target.value)}
          placeholder={t("team.nicknamePlaceholder")}
          autoCapitalize="none"
          autoCorrect="off"
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
        />
        <button
          type="submit"
          disabled={busy}
          aria-label={t("team.inviteByNickname")}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#27374c] text-white transition active:scale-95 disabled:opacity-70"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <UserPlus size={16} />
          )}
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

/** Link de convite: gerar, copiar e cancelar. */
function InviteLinkBox({
  link,
  onCreate,
  onRevoke,
}: {
  link: InviteLink | null;
  onCreate: () => Promise<void>;
  onRevoke: () => Promise<void>;
}) {
  const t = useT();
  const d = useDates();
  const [busy, setBusy] = useState(false);

  const endereco = link ? `${window.location.origin}/entrar/${link.token}` : "";

  async function copiar() {
    try {
      await navigator.clipboard.writeText(endereco);
      toast.success(t("team.linkCopied"));
    } catch {
      toast.error(t("nav.copyFailed"));
    }
  }

  async function acao(fn: () => Promise<void>, aviso?: string) {
    setBusy(true);
    try {
      await fn();
      if (aviso) toast.success(aviso);
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : t("team.linkFailed")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border border-[#e4ded3] bg-[#fbfaf7] p-3">
      <p className="mb-2 flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
        <LinkIcon size={13} className="text-[#e86a33]" /> {t("team.inviteLink")}
      </p>

      {link ? (
        <>
          <p className="break-all rounded-lg bg-white px-2.5 py-2 font-mono-field text-[10px] leading-4 text-[#5b6779]">
            {endereco}
          </p>
          <p className="mt-1.5 font-mono-field text-[9px] uppercase tracking-[0.08em] text-[#8a929d]">
            {t("team.linkExpires", {
              date: d.short(link.expiresAt.slice(0, 10)),
            })}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={copiar}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#27374c] text-[12px] font-bold text-white transition active:scale-95"
            >
              <Copy size={13} /> {t("team.copyLink")}
            </button>
            <button
              onClick={() => void acao(onCreate)}
              disabled={busy}
              className="h-9 rounded-lg border border-[#e2dbd0] bg-white px-3 text-[12px] font-bold text-[#4c5a6d] transition active:scale-95 disabled:opacity-60"
            >
              {t("team.newLink")}
            </button>
          </div>
          <button
            onClick={() => void acao(onRevoke, t("team.linkRevoked"))}
            disabled={busy}
            className="mt-1.5 w-full py-1 text-[11px] font-bold text-[#a8503a] transition active:scale-95 disabled:opacity-60"
          >
            {t("team.revokeLink")}
          </button>
        </>
      ) : (
        <button
          onClick={() => void acao(onCreate)}
          disabled={busy}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#27374c] text-[12px] font-bold text-white transition active:scale-95 disabled:opacity-70"
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LinkIcon size={14} />
          )}{" "}
          {t("team.generateLink")}
        </button>
      )}

      <p className="mt-2 text-[11px] leading-4 text-[#8a929d]">
        {t("team.linkHint")}
      </p>
    </div>
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
