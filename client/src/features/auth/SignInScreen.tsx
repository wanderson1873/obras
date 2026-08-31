/** Tela de entrada. Aparece só até existir uma sessão salva no aparelho. */

import { useState } from "react";
import { House, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

type Mode = "signIn" | "signUp";

/** As mensagens do Supabase vêm em inglês; traduzimos as que o usuário pode ver. */
function readableError(message: string) {
  const known: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "Confirme o e-mail antes de entrar.",
    "User already registered": "Esse e-mail já tem conta. Use Entrar.",
    "For security purposes, you can only request this after 60 seconds.":
      "Aguarde um minuto antes de pedir de novo.",
    "Password should be at least 6 characters.":
      "A senha precisa ter pelo menos 6 caracteres.",
  };
  return known[message] ?? message;
}

export function SignInScreen() {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);

  const isSignUp = mode === "signUp";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (isSignUp && password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setBusy(true);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUp(email, password);
        if (needsConfirmation) {
          toast.success("Conta criada", {
            description: "Confirme o e-mail que enviamos e depois entre.",
          });
          setMode("signIn");
        }
      } else {
        await signIn(email, password);
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Não foi possível entrar.";
      setError(readableError(message));
    } finally {
      setBusy(false);
    }
  }

  async function recoverPassword() {
    if (!email.trim()) {
      setError("Escreva seu e-mail acima para receber o link de recuperação.");
      return;
    }
    setError(null);
    setSendingReset(true);
    try {
      await sendPasswordReset(email);
      toast.success("E-mail enviado", {
        description: "Abra o link e depois troque a senha em Conta.",
      });
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Não foi possível enviar o e-mail.";
      setError(readableError(message));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 text-[#27374c]">
      <div className="app-enter w-full max-w-[400px] rounded-[28px] border border-[#e8e2d7] bg-[#fbfaf7] p-6 shadow-[0_18px_50px_rgba(39,55,76,0.1)]">
        <div className="mb-7">
          <div className="flex items-center gap-3">
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
          <p className="field-rule ml-[60px] mt-1.5 w-[123px] pb-1.5 font-mono-field text-[9px] font-medium uppercase tracking-[0.16em] text-[#6a7180]">
            Caderno de campo
          </p>
        </div>

        <p className="mb-6 text-[14px] leading-6 text-[#647084]">
          {isSignUp
            ? "Crie sua conta para guardar as fichas e abrir de qualquer aparelho."
            : "Entre uma vez — o aparelho guarda a sessão e o app abre direto nas obras."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              className="h-12 w-full rounded-xl border border-[#e4ded3] bg-white px-3 text-sm outline-none transition focus:border-[#e86a33]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-bold text-[#526073]">
              Senha
            </span>
            <input
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder={isSignUp ? "Mínimo de 6 caracteres" : "Sua senha"}
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
            {isSignUp ? "Criar conta" : "Entrar"}
          </button>
        </form>

        {!isSignUp && (
          <button
            onClick={recoverPassword}
            disabled={sendingReset}
            className="mt-4 w-full text-center text-[13px] font-semibold text-[#6d7889] disabled:opacity-60"
          >
            {sendingReset ? "Enviando…" : "Esqueci minha senha"}
          </button>
        )}

        <button
          onClick={() => {
            setMode(isSignUp ? "signIn" : "signUp");
            setError(null);
          }}
          className="mt-3 w-full text-center text-[13px] font-semibold text-[#a7502b]"
        >
          {isSignUp ? "Já tenho conta. Entrar" : "Ainda não tenho conta. Criar"}
        </button>
      </div>
    </div>
  );
}
