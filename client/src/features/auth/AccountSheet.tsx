/** Conta: mostra o e-mail cadastrado, troca a senha e permite sair. */

import { useState } from "react";
import { Check, KeyRound, Loader2, LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { formatLongDate } from "@/lib/dates";
import { useAuth } from "./AuthContext";

export function AccountSheet({ onClose }: { onClose: () => void }) {
  const { session, updatePassword, signOut } = useAuth();
  const [changing, setChanging] = useState(false);

  const email = session?.user.email ?? "—";
  const createdAt = session?.user.created_at?.slice(0, 10);

  return (
    <BottomSheet
      label="Sua conta"
      eyebrow="Conta"
      title="Seus dados"
      onClose={onClose}
      centerOnDesktop
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#eae4da] bg-white p-4">
          <p className="flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
            <Mail size={13} className="text-[#e86a33]" /> E-mail cadastrado
          </p>
          <p className="mt-1.5 break-all text-[15px] font-bold text-[#27374c]">
            {email}
          </p>
          {createdAt && (
            <p className="mt-2 text-[12px] text-[#8a929d]">
              Conta criada em {formatLongDate(createdAt)}.
            </p>
          )}
        </div>

        {changing ? (
          <ChangePasswordForm
            onCancel={() => setChanging(false)}
            onSubmit={async (atual, nova) => {
              await updatePassword(atual, nova);
              setChanging(false);
              toast.success("Senha alterada", {
                description: "Use a nova senha da próxima vez que entrar.",
              });
            }}
          />
        ) : (
          <button
            onClick={() => setChanging(true)}
            className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[#e8e2d7] bg-white px-3.5 text-left transition active:scale-[0.98]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f3f0e9] text-[#e86a33]">
              <KeyRound size={15} />
            </span>
            <span className="flex-1 text-sm font-bold text-[#354357]">
              Alterar senha
            </span>
          </button>
        )}

        <button
          onClick={() => {
            void signOut();
            onClose();
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#f0ded4] bg-[#fff8f4] text-sm font-bold text-[#a8503a] transition active:scale-[0.98]"
        >
          <LogOut size={16} /> Sair da conta
        </button>

        <p className="pb-1 text-center text-[12px] leading-5 text-[#8a929d]">
          Sair não apaga nada. Suas obras continuam guardadas e voltam quando
          você entrar de novo.
        </p>
      </div>
    </BottomSheet>
  );
}

function ChangePasswordForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!current) return setError("Digite sua senha atual.");
    if (next.length < 6)
      return setError("A nova senha precisa ter pelo menos 6 caracteres.");
    if (next !== confirmation)
      return setError("As duas senhas novas não são iguais.");
    if (next === current) return setError("A nova senha é igual à atual.");

    setBusy(true);
    try {
      await onSubmit(current, next);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível alterar a senha."
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
        <KeyRound size={13} className="text-[#e86a33]" /> Alterar senha
      </p>

      <PasswordField
        label="Senha atual"
        value={current}
        onChange={setCurrent}
        autoComplete="current-password"
      />
      <PasswordField
        label="Nova senha"
        value={next}
        onChange={setNext}
        placeholder="Mínimo de 6 caracteres"
        autoComplete="new-password"
      />
      <PasswordField
        label="Repita a nova senha"
        value={confirmation}
        onChange={setConfirmation}
        autoComplete="new-password"
      />

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[#f0cfc6] bg-[#fff6f3] px-3 py-2.5 text-[13px] font-medium text-[#a8462f]"
        >
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-11 flex-1 rounded-xl border border-[#e2dbd0] bg-white text-[13px] font-bold text-[#4c5a6d] transition active:scale-[0.98] disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#27374c] text-[13px] font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}{" "}
          Salvar
        </button>
      </div>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
        {label}
      </span>
      <input
        type="password"
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
      />
    </label>
  );
}
