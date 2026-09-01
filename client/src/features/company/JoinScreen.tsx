/**
 * Tela de quem chegou por um link de convite.
 *
 * Quem já está logado entra na organização na hora. Quem não está vê a tela de
 * entrada; o token fica guardado na aba e é usado assim que a sessão existir,
 * então criar a conta pelo link também funciona.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CircleCheck,
  House,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/features/auth/AuthContext";
import { SignInScreen } from "@/features/auth/SignInScreen";
import { useT } from "@/i18n/I18nContext";

const CHAVE_TOKEN = "obras:invite-token";

/** Guarda o token para sobreviver ao login, que recarrega a página. */
export function rememberInviteToken(token: string) {
  try {
    sessionStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    /* modo privado: o convite ainda funciona se a pessoa já estiver logada */
  }
}

export function takeInviteToken(): string | null {
  try {
    const token = sessionStorage.getItem(CHAVE_TOKEN);
    if (token) sessionStorage.removeItem(CHAVE_TOKEN);
    return token;
  } catch {
    return null;
  }
}

type Estado =
  | { fase: "conferindo" }
  | { fase: "pronto"; organizacao: string; jaEra: boolean }
  | { fase: "erro"; mensagem: string };

export function JoinScreen({
  token,
  onDone,
}: {
  token: string;
  onDone: () => void;
}) {
  const t = useT();
  const { session, loading } = useAuth();
  const [estado, setEstado] = useState<Estado>({ fase: "conferindo" });

  const entrar = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("join_company_by_token", {
        p_token: token,
      });
      if (error) throw new Error(error.message);
      const linha = Array.isArray(data) ? data[0] : data;
      setEstado({
        fase: "pronto",
        organizacao: linha?.company_name ?? "",
        jaEra: Boolean(linha?.already_member),
      });
    } catch (caught) {
      setEstado({
        fase: "erro",
        mensagem: caught instanceof Error ? caught.message : t("join.failed"),
      });
    }
  }, [token, t]);

  useEffect(() => {
    if (loading) return;
    if (!session) {
      rememberInviteToken(token);
      return;
    }
    void entrar();
  }, [loading, session, token, entrar]);

  if (loading) return <Espera />;

  // Sem sessão: entra ou cria a conta, e o token espera guardado na aba.
  if (!session) {
    return (
      <div>
        <p className="fixed inset-x-0 top-0 z-10 bg-[#27374c] px-4 py-2.5 text-center text-[12px] font-semibold text-white">
          {t("join.needAccount")}
        </p>
        <SignInScreen />
      </div>
    );
  }

  if (estado.fase === "conferindo")
    return <Espera legenda={t("join.checking")} />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f0] px-4 text-[#27374c]">
      <div className="app-enter w-full max-w-[400px] rounded-[28px] border border-[#e8e2d7] bg-[#fbfaf7] p-6 text-center shadow-[0_18px_50px_rgba(39,55,76,0.1)]">
        {estado.fase === "pronto" ? (
          <>
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[16px] bg-[#edf8f0] text-[#43825c]">
              <CircleCheck size={24} />
            </span>
            <h1 className="text-[20px] font-bold tracking-[-0.03em]">
              {estado.jaEra
                ? t("join.already", { org: estado.organizacao })
                : t("join.joined", { org: estado.organizacao })}
            </h1>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-[#8a929d]">
              <Building2 size={14} /> {estado.organizacao}
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-[16px] bg-[#fff0e8] text-[#a74b29]">
              <TriangleAlert size={24} />
            </span>
            <h1 className="text-[20px] font-bold tracking-[-0.03em]">
              {t("join.failed")}
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-[#647084]">
              {t("join.failedHint")}
            </p>
          </>
        )}

        <button
          onClick={onDone}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#27374c] text-sm font-bold text-white transition active:scale-[0.98]"
        >
          {t("join.continue")}
        </button>
      </div>
    </div>
  );
}

function Espera({ legenda }: { legenda?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f5f0]">
      <div className="grid h-14 w-14 animate-pulse place-items-center rounded-[18px] bg-[#e86a33]">
        <House size={28} strokeWidth={2.4} className="text-white" />
      </div>
      {legenda && (
        <p className="flex items-center gap-2 text-[13px] text-[#8a929d]">
          <Loader2 size={14} className="animate-spin" /> {legenda}
        </p>
      )}
    </div>
  );
}
