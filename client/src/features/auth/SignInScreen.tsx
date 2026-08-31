/** Tela de entrada. Aparece só até existir uma sessão salva no aparelho. */

import { useEffect, useState } from "react";
import { House, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/i18n/I18nContext";
import type { TranslationKey } from "@/i18n/translations";
import { useAuth } from "./AuthContext";
import { GoogleButton } from "./GoogleButton";

type Mode = "signIn" | "signUp";

/** O Supabase responde em inglês; mapeamos o que o usuário pode ver. */
const ERROS: Record<string, TranslationKey> = {
  "Invalid login credentials": "auth.err.invalidCredentials",
  "Email not confirmed": "auth.err.emailNotConfirmed",
  "User already registered": "auth.err.alreadyRegistered",
  "For security purposes, you can only request this after 60 seconds.":
    "auth.err.tooSoon",
  "Password should be at least 6 characters.": "auth.passwordTooShort",
};

export function SignInScreen() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const t = useT();
  const readableError = (message: string) =>
    ERROS[message] ? t(ERROS[message]) : message;
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const isSignUp = mode === "signUp";

  useEffect(() => {
    // Quando o Google recusa, o navegador volta com o motivo na URL. Sem ler
    // isso o usuário só veria a tela de entrada de novo, sem entender por quê.
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const motivo =
      hash.get("error_description") ?? query.get("error_description");
    if (!motivo) return;
    setError(readableError(decodeURIComponent(motivo.replace(/\+/g, " "))));
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(t("auth.fillBoth"));
      return;
    }
    if (isSignUp && password.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setBusy(true);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          toast.success(t("auth.accountCreated"), {
            description: t("auth.confirmEmailSent"),
          });
          setMode("signIn");
        }
      } else {
        await signIn(email, password);
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : t("auth.genericFailure");
      setError(readableError(message));
    } finally {
      setBusy(false);
    }
  }

  async function recoverPassword() {
    if (!email.trim()) {
      setError(t("auth.typeEmailFirst"));
      return;
    }
    setError(null);
    setSendingReset(true);
    try {
      await sendPasswordReset(email);
      toast.success(t("auth.resetSent"), {
        description: t("auth.resetSentHint"),
      });
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : t("auth.genericFailure");
      setError(readableError(message));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 text-[#27374c]">
      <div className="app-enter w-full max-w-[400px] rounded-[28px] border border-[#e8e2d7] bg-[#fbfaf7] p-6 shadow-[0_18px_50px_rgba(39,55,76,0.1)]">
        <div className="mb-7 flex items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[#e86a33] shadow-[0_7px_15px_rgba(232,106,51,0.25)]"
            aria-hidden="true"
          >
            <House size={24} strokeWidth={2.4} className="text-white" />
          </div>
          <h1 className="text-[26px] font-bold leading-none tracking-[-0.045em]">
            Obras
          </h1>
        </div>

        <p className="mb-6 text-[14px] leading-6 text-[#647084]">
          {isSignUp ? t("auth.tagline.signUp") : t("auth.tagline.signIn")}
        </p>

        <GoogleButton onError={setError} />

        <div className="my-5 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#e6e0d6]" />
          <span className="font-mono-field text-[9px] uppercase tracking-[0.16em] text-[#9aa2ac]">
            {t("auth.orEmail")}
          </span>
          <span className="h-px flex-1 bg-[#e6e0d6]" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
              {t("auth.email")}
            </span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder={t("auth.emailPlaceholder")}
              className="h-12 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
              {t("auth.password")}
            </span>
            <input
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder={
                isSignUp
                  ? t("auth.passwordMinPlaceholder")
                  : t("auth.passwordPlaceholder")
              }
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
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white shadow-[0_8px_18px_rgba(39,55,76,0.2)] transition active:scale-[0.98] disabled:opacity-70"
          >
            {busy && <Loader2 size={17} className="animate-spin" />}
            {isSignUp ? t("auth.createAccount") : t("auth.signIn")}
          </button>
        </form>

        {!isSignUp && (
          <button
            onClick={recoverPassword}
            disabled={sendingReset}
            className="mt-4 w-full text-center text-[13px] font-semibold text-[#6d7889] disabled:opacity-60"
          >
            {sendingReset ? t("common.sending") : t("auth.forgot")}
          </button>
        )}

        <button
          onClick={() => {
            setMode(isSignUp ? "signIn" : "signUp");
            setError(null);
          }}
          className="mt-3 w-full text-center text-[13px] font-semibold text-[#a7502b]"
        >
          {isSignUp ? t("auth.toSignIn") : t("auth.toSignUp")}
        </button>
      </div>
    </div>
  );
}
