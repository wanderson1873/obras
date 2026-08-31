/**
 * Botão de entrar com o Google.
 *
 * O logotipo vai embutido em SVG porque a marca do Google precisa aparecer nas
 * cores originais — um ícone genérico não atende as regras deles.
 */

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "./AuthContext";

export function GoogleButton({
  onError,
}: {
  onError: (message: string) => void;
}) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  async function enter() {
    setBusy(true);
    try {
      // Em caso de sucesso o navegador sai desta página, então não há o que
      // fazer depois: quem assume é o retorno do Google.
      await signInWithGoogle();
    } catch (caught) {
      setBusy(false);
      onError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível abrir a entrada do Google."
      );
    }
  }

  return (
    <button
      type="button"
      onClick={enter}
      disabled={busy}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#e0dad0] bg-white text-sm font-bold text-[#3c4658] transition active:scale-[0.98] disabled:opacity-70"
    >
      {busy ? <Loader2 size={17} className="animate-spin" /> : <GoogleMark />}
      Entrar com o Google
    </button>
  );
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
