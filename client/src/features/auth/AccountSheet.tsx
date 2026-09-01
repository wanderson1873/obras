/** Conta: mostra o e-mail cadastrado, troca a senha e permite sair. */

import { useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  KeyRound,
  AtSign,
  Languages,
  Loader2,
  LogOut,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "@/features/works/components/BottomSheet";
import { useI18n, useT, LANGUAGES, LANGUAGE_NAMES } from "@/i18n/I18nContext";
import { useDates } from "@/i18n/useDates";
import { useAuth } from "./AuthContext";
import { useProfile } from "./useProfile";

export function AccountSheet({
  onClose,
  onOpenTeam,
}: {
  onClose: () => void;
  onOpenTeam: () => void;
}) {
  const { session, updatePassword, signOut } = useAuth();
  const { t, language, automatic, setLanguage } = useI18n();
  const d = useDates();
  const perfil = useProfile();
  const [changing, setChanging] = useState(false);

  const email = session?.user.email ?? "—";
  const createdAt = session?.user.created_at?.slice(0, 10);

  return (
    <BottomSheet
      label={t("account.label")}
      eyebrow={t("account.eyebrow")}
      title={t("account.title")}
      onClose={onClose}
      centerOnDesktop
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#eae4da] bg-white p-4">
          <p className="flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
            <Mail size={13} className="text-[#e86a33]" /> {t("account.email")}
          </p>
          <p className="mt-1.5 break-all text-[15px] font-bold text-[#27374c]">
            {email}
          </p>
          {createdAt && (
            <p className="mt-2 text-[12px] text-[#8a929d]">
              {t("account.createdAt", { date: d.long(createdAt) })}
            </p>
          )}
        </div>

        <NicknameField
          nickname={perfil.nickname}
          loading={perfil.loading}
          onSave={perfil.save}
        />

        <div className="rounded-2xl border border-[#e8e2d7] bg-white p-4">
          <p className="mb-2.5 flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
            <Languages size={13} className="text-[#e86a33]" />{" "}
            {t("account.language")}
          </p>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f3f0e9] p-1">
            {LANGUAGES.map(idioma => (
              <button
                key={idioma}
                onClick={() => setLanguage(idioma)}
                className={`h-9 rounded-lg text-[12px] font-bold transition ${
                  !automatic && language === idioma
                    ? "bg-white text-[#27374c] shadow-sm"
                    : "text-[#87909b]"
                }`}
              >
                {LANGUAGE_NAMES[idioma]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setLanguage(null)}
            className={`mt-2 w-full rounded-lg py-1.5 text-[12px] font-semibold transition ${
              automatic ? "text-[#43825c]" : "text-[#8a929d]"
            }`}
          >
            {automatic
              ? `✓ ${t("account.languageAuto")}`
              : t("account.languageAuto")}
          </button>
        </div>

        <button
          onClick={onOpenTeam}
          className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[#e8e2d7] bg-white px-3.5 text-left transition active:scale-[0.98]"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f3f0e9] text-[#e86a33]">
            <Building2 size={15} />
          </span>
          <span className="flex-1 text-sm font-bold text-[#354357]">
            {t("account.team")}
          </span>
          <ChevronRight size={17} className="text-[#b3bac3]" />
        </button>

        {changing ? (
          <ChangePasswordForm
            onCancel={() => setChanging(false)}
            onSubmit={async (atual, nova) => {
              await updatePassword(atual, nova);
              setChanging(false);
              toast.success(t("account.changed"), {
                description: t("account.changedHint"),
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
              {t("account.changePassword")}
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
          <LogOut size={16} /> {t("account.signOut")}
        </button>

        <p className="pb-1 text-center text-[12px] leading-5 text-[#8a929d]">
          {t("account.signOutHint")}
        </p>
      </div>
    </BottomSheet>
  );
}

/** Apelido: como os colegas encontram a pessoa para adicionar à organização. */
function NicknameField({
  nickname,
  loading,
  onSave,
}: {
  nickname: string | null;
  loading: boolean;
  onSave: (nickname: string) => Promise<void>;
}) {
  const t = useT();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function salvar(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSave(valor);
      setEditando(false);
      toast.success(t("account.nicknameSaved"));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("account.nicknameInvalid")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#e8e2d7] bg-white p-4">
      <p className="flex items-center gap-2 font-mono-field text-[9px] font-medium uppercase tracking-[0.13em] text-[#8a929d]">
        <AtSign size={13} className="text-[#e86a33]" /> {t("account.nickname")}
      </p>

      {editando ? (
        <form onSubmit={salvar} className="mt-2 space-y-2">
          <input
            value={valor}
            onChange={event => setValor(event.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            className="h-11 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
          />
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-[#f0cfc6] bg-[#fff6f3] px-3 py-2 text-[12px] font-medium text-[#a8462f]"
            >
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditando(false)}
              disabled={busy}
              className="h-10 flex-1 rounded-xl border border-[#e2dbd0] bg-white text-[12px] font-bold text-[#4c5a6d] transition active:scale-[0.98]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#27374c] text-[12px] font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}{" "}
              {t("common.save")}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-1.5 flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-[#27374c]">
            {loading ? "…" : `@${nickname ?? "—"}`}
          </span>
          <button
            onClick={() => {
              setValor(nickname ?? "");
              setError(null);
              setEditando(true);
            }}
            className="shrink-0 rounded-xl bg-[#f3f0e9] px-3 py-2 text-[12px] font-bold text-[#4f5c6e] transition active:scale-95"
          >
            {t("common.change")}
          </button>
        </div>
      )}

      <p className="mt-2 text-[11px] leading-4 text-[#8a929d]">
        {t("account.nicknameHint")}
      </p>
    </div>
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
