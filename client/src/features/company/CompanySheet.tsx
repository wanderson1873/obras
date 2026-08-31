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
  const meuId = session?.user.id;

  return (
    <BottomSheet
      label="Equipe"
      eyebrow="Equipe"
      title={company?.name ?? "Sua equipe"}
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
                        (você)
                      </span>
                    )}
                  </span>
                  <span className="font-mono-field text-[9px] uppercase tracking-[0.1em] text-[#8a929d]">
                    {membro.role === "admin" ? "Administrador" : "Equipe"}
                  </span>
                </span>
                {company.myRole === "admin" && membro.userId !== meuId && (
                  <button
                    onClick={() => void removeMember(membro.userId)}
                    aria-label={`Remover ${membro.displayName} da equipe`}
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
                Convites aguardando
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
                      aria-label={`Cancelar convite de ${convite.email}`}
                      className="p-1 opacity-60 transition hover:opacity-100"
                    >
                      <Trash2 size={14} className="text-[#b5a29a]" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] leading-5 text-[#8a929d]">
                A pessoa entra na equipe sozinha assim que criar a conta com
                esse e-mail.
              </p>
            </section>
          )}

          {company.myRole === "admin" ? (
            <InviteForm onInvite={invite} />
          ) : (
            <p className="rounded-xl bg-[#f3f0e9] px-3.5 py-3 text-[12px] leading-5 text-[#6b7686]">
              Só o administrador da equipe pode convidar ou remover pessoas.
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
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Escreva o nome da empresa.");
    setError(null);
    setBusy(true);
    try {
      await onCreate(name);
      toast.success("Equipe criada", {
        description: "Agora convide as outras pessoas.",
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível criar a equipe."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-[14px] leading-6 text-[#647084]">
        Crie a equipe para poder compartilhar obras. Suas obras de hoje
        continuam privadas — nada passa a ser visto por ninguém sem você
        escolher.
      </p>

      <label className="block">
        <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
          Nome da empresa
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
        Criar equipe
      </button>
    </form>
  );
}

function InviteForm({
  onInvite,
}: {
  onInvite: (email: string, role: MemberRole) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return setError("Escreva o e-mail da pessoa.");
    setError(null);
    setBusy(true);
    try {
      await onInvite(email, role);
      setEmail("");
      toast.success("Convite criado", {
        description: "Peça para a pessoa criar a conta com esse e-mail.",
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Não foi possível convidar."
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
        <UserPlus size={13} className="text-[#e86a33]" /> Convidar para a equipe
      </p>

      <input
        type="email"
        inputMode="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
        placeholder="email@exemplo.com"
        className="h-11 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
      />

      <div className="grid grid-cols-2 rounded-xl bg-[#f3f0e9] p-1">
        <button
          type="button"
          onClick={() => setRole("member")}
          className={`h-9 rounded-lg text-[12px] font-bold transition ${role === "member" ? "bg-white text-[#27374c] shadow-sm" : "text-[#87909b]"}`}
        >
          Equipe
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`h-9 rounded-lg text-[12px] font-bold transition ${role === "admin" ? "bg-white text-[#27374c] shadow-sm" : "text-[#87909b]"}`}
        >
          Administrador
        </button>
      </div>
      <p className="text-[11px] leading-4 text-[#8a929d]">
        Administrador convida e remove pessoas. Isso não dá acesso às obras de
        ninguém.
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
        Convidar
      </button>
    </form>
  );
}
