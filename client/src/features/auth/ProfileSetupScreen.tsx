/**
 * Cadastro logo depois de criar a conta.
 *
 * Aparece uma vez, enquanto o nome estiver em branco. Fica antes do app e não
 * dentro dele porque o apelido é como os colegas encontram a pessoa: sem ele,
 * ninguém consegue ser adicionado a uma organização.
 */

import { useState, type ReactNode } from "react";
import { AtSign, Check, House, Loader2, Phone } from "lucide-react";
import { useAuth } from "./AuthContext";
import { isNicknameValid, type Profile } from "./useProfile";
import { useT } from "@/i18n/I18nContext";

export function ProfileSetupScreen({
  initial,
  onSave,
}: {
  initial: Profile;
  onSave: (profile: Profile) => Promise<void>;
}) {
  const t = useT();
  const { signOut } = useAuth();
  const [form, setForm] = useState<Profile>(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>(
    {}
  );

  const set = (campo: keyof Profile, valor: string) => {
    setForm(atual => ({ ...atual, [campo]: valor }));
    setErrors(atuais => ({ ...atuais, [campo]: undefined }));
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    const problemas: Partial<Record<keyof Profile, string>> = {};
    if (!form.firstName.trim()) problemas.firstName = t("common.required");
    if (!form.nickname.trim()) problemas.nickname = t("common.required");
    else if (!isNicknameValid(form.nickname))
      problemas.nickname = t("account.nicknameInvalid");
    setErrors(problemas);
    if (Object.keys(problemas).length > 0) return;

    setBusy(true);
    try {
      await onSave(form);
    } catch (caught) {
      setErrors({
        nickname:
          caught instanceof Error ? caught.message : t("profile.saveFailed"),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0] px-4 py-10 text-[#27374c]">
      <div className="mx-auto w-full max-w-[420px]">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="grid h-11 w-11 place-items-center rounded-[15px] bg-[#e86a33] shadow-[0_7px_15px_rgba(232,106,51,0.25)]"
            aria-hidden="true"
          >
            <House size={22} strokeWidth={2.4} className="text-white" />
          </span>
          <h1 className="text-[25px] font-bold leading-none tracking-[-0.04em]">
            Obras
          </h1>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[28px] border border-[#e8e2d7] bg-[#fbfaf7] p-5 shadow-[0_18px_50px_rgba(39,55,76,0.08)]"
        >
          <p className="font-mono-field text-[10px] font-medium uppercase tracking-[0.15em] text-[#8b9098]">
            {t("profile.eyebrow")}
          </p>
          <h2 className="mt-1 text-[21px] font-bold tracking-[-0.035em]">
            {t("profile.title")}
          </h2>
          <p className="mt-1.5 text-[13px] leading-5 text-[#647084]">
            {t("profile.intro")}
          </p>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Campo
                label={t("profile.firstName")}
                required
                value={form.firstName}
                error={errors.firstName}
                placeholder={t("profile.firstNamePlaceholder")}
                onChange={valor => set("firstName", valor)}
              />
              <Campo
                label={t("profile.lastName")}
                value={form.lastName}
                placeholder={t("profile.lastNamePlaceholder")}
                onChange={valor => set("lastName", valor)}
              />
            </div>

            <Campo
              label={t("account.nickname")}
              required
              icon={<AtSign size={15} />}
              value={form.nickname}
              error={errors.nickname}
              placeholder={t("profile.nicknamePlaceholder")}
              hint={t("account.nicknameHint")}
              onChange={valor => set("nickname", valor)}
            />

            <Campo
              label={t("profile.phone")}
              icon={<Phone size={15} />}
              value={form.phone}
              type="tel"
              placeholder={t("profile.phonePlaceholder")}
              hint={t("profile.phoneHint")}
              onChange={valor => set("phone", valor)}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98] disabled:opacity-70"
          >
            {busy ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Check size={17} />
            )}{" "}
            {t("profile.save")}
          </button>
        </form>

        <button
          onClick={() => void signOut()}
          className="mt-3 h-10 w-full rounded-xl text-[12px] font-bold text-[#8a929d] transition active:scale-[0.98]"
        >
          {t("account.signOut")}
        </button>
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  placeholder,
  hint,
  icon,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  icon?: ReactNode;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  const base = error
    ? "border-[#c45d4b] bg-[#fff8f6] focus:border-[#c45d4b]"
    : "border-[#e4ded3] bg-white focus:border-[#e86a33]";

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold text-[#526073]">
        {icon && <span className="text-[#e86a33]">{icon}</span>}
        {label}
        {required && <span className="text-[#bf493b]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`h-11 w-full rounded-xl border px-3 text-sm outline-none transition ${base}`}
      />
      {error ? (
        <span className="mt-1.5 block text-[11px] font-medium text-[#b34d3f]">
          {error}
        </span>
      ) : (
        hint && (
          <span className="mt-1.5 block text-[11px] leading-4 text-[#8a929d]">
            {hint}
          </span>
        )
      )}
    </label>
  );
}
